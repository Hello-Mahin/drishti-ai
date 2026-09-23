import os
import io
import logging
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Load local environment variables from .env if present
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from model import load_model, predict
from gradcam import generate_gradcam_overlay
from gemini_client import GeminiReportGenerator
from firebase_client import firebase_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("drishti_backend.main")

# Initialize FastAPI App
app = FastAPI(
    title="DrishtiAI Backend API",
    description="AI-powered Diabetic Retinopathy screening platform for rural India",
    version="1.0.0"
)

# Configure CORS Middleware (crucial for React frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances loaded on server startup
DEVICE = "cpu"  # Cloud Run default
MODEL_PATH = os.getenv("MODEL_PATH", "efficientnet_dr.pth")

logger.info("Initializing DrishtiAI Model and AI Services...")
dr_model = load_model(model_path=MODEL_PATH, device=DEVICE)
gemini_generator = GeminiReportGenerator()


@app.get("/", tags=["General"])
def read_root():
    """
    Root endpoint verifying DrishtiAI API status and endpoints.
    """
    return {
        "project": "DrishtiAI",
        "description": "AI-powered Diabetic Retinopathy Screening Backend",
        "status": "online",
        "endpoints": {
            "predict": "POST /predict",
            "history": "GET /history/{asha_worker_id}",
            "health": "GET /health",
            "docs": "GET /docs"
        }
    }


@app.get("/health", tags=["Monitoring"])
def health_check():
    """
    Standard Cloud Run health check endpoint.
    """
    return {"status": "ok"}


@app.post("/predict", tags=["Screening"])
async def predict_retinopathy(
    image: Optional[UploadFile] = File(None, description="Retinal fundus image file"),
    file: Optional[UploadFile] = File(None, description="Alternative field for image file"),
    patient_name: str = Form(..., description="Full name of patient"),
    patient_id: str = Form(..., description="Unique Patient Identifier (e.g., P001)"),
    age: Optional[int] = Form(None, description="Patient age in years"),
    patient_age: Optional[int] = Form(None, description="Patient age (alternative field name)"),
    asha_worker_id: Optional[str] = Form("ASHA_DEFAULT", description="ID of screening ASHA worker"),
    location: Optional[str] = Form("Rural Health Sub-Centre", description="Clinic or village screening location")
):
    """
    Predicts Diabetic Retinopathy stage, generates Grad-CAM heatmap,
    produces a Gemini clinical report, and persists screening data to Firestore.
    """
    final_age = age if age is not None else (patient_age if patient_age is not None else 50)

    # Accommodate both 'image' and 'file' form field keys from React
    upload = image or file
    if upload is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing image file. Please provide an image using the 'image' or 'file' field."
        )

    # 1. Read and validate uploaded image
    try:
        image_bytes = await upload.read()
        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image.verify()
        # Re-open after verify() since verify() can mutate internal state
        pil_image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        logger.error(f"Image validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image format: {e}"
        )

    # 2. Run EfficientNet-B3 Inference
    try:
        dr_level, dr_stage, confidence, input_tensor, resized_pil = predict(
            model=dr_model,
            pil_image=pil_image,
            device=DEVICE
        )
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {e}"
        )

    # 3. Generate Grad-CAM Heatmap overlay
    try:
        heatmap_base64 = generate_gradcam_overlay(
            model=dr_model,
            input_tensor=input_tensor,
            original_pil=pil_image,
            target_category=dr_level
        )
    except Exception as e:
        logger.error(f"Grad-CAM generation error: {e}")
        heatmap_base64 = ""

    # 4. Generate Clinical Ophthalmology Report via Gemini API
    try:
        report_text = gemini_generator.generate_report(
            dr_stage_name=dr_stage,
            confidence=confidence
        )
    except Exception as e:
        logger.error(f"Clinical report generation error: {e}")
        report_text = (
            f"Screening completed: {dr_stage} Diabetic Retinopathy ({confidence}% confidence). "
            "Please consult an ophthalmologist for a comprehensive dilated eye exam."
        )

    # 5. Persist record to Firestore
    screening_record: Dict[str, Any] = {
        "patient_id": patient_id,
        "patientId": patient_id,
        "patient_name": patient_name,
        "patientName": patient_name,
        "patient_age": final_age,
        "patientAge": final_age,
        "age": final_age,
        "asha_worker_id": asha_worker_id,
        "dr_stage": dr_stage,
        "drStage": dr_stage,
        "dr_level": dr_level,
        "confidence": confidence,
        "heatmap_base64": heatmap_base64,
        "report_text": report_text,
        "reportText": report_text,
        "location": location
    }

    screening_id = firebase_client.save_screening(screening_record)

    # 6. Return response to Frontend
    return {
        "dr_stage": dr_stage,
        "dr_level": dr_level,
        "confidence": confidence,
        "heatmap_base64": heatmap_base64,
        "report_text": report_text,
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_age": final_age,
        "screening_id": screening_id
    }


@app.get("/history/{asha_worker_id}", tags=["History"])
def get_worker_screening_history(asha_worker_id: str) -> List[Dict[str, Any]]:
    """
    Returns all screening records from Firestore for a given ASHA worker.
    """
    try:
        records = firebase_client.get_worker_history(asha_worker_id)
        return records
    except Exception as e:
        logger.error(f"Error fetching history for worker {asha_worker_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch worker history: {e}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
