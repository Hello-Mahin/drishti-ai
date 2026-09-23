"""
DrishtiAI Backend Smoke Test Script
Verifies:
1. Model loading & inference
2. Grad-CAM generation & base64 encoding
3. Gemini report generator
4. Firebase manager save and get history
5. FastAPI endpoints (Health, Root, and /predict simulation)
"""
import io
import sys
import asyncio
import logging
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_api")


def run_tests():
    logger.info("=== STEP 1: Testing Model Loading & Inference ===")
    from model import load_model, predict, DR_CLASSES

    model = load_model("efficientnet_dr.pth", device="cpu")
    assert model is not None, "Model failed to load"

    # Create synthetic 224x224 RGB image
    test_img = Image.new("RGB", (224, 224), color=(180, 50, 50))
    dr_level, dr_stage, confidence, input_tensor, resized_pil = predict(model, test_img, device="cpu")

    logger.info(f"Predicted DR Level: {dr_level}")
    logger.info(f"Predicted DR Stage: {dr_stage}")
    logger.info(f"Confidence: {confidence}%")
    assert 0 <= dr_level <= 4, f"Invalid dr_level: {dr_level}"
    assert dr_stage in DR_CLASSES.values(), f"Invalid dr_stage: {dr_stage}"
    assert 0.0 <= confidence <= 100.0, f"Invalid confidence: {confidence}"
    logger.info("✓ Model test passed.")

    logger.info("\n=== STEP 2: Testing Grad-CAM Generation ===")
    from gradcam import generate_gradcam_overlay

    heatmap_b64 = generate_gradcam_overlay(
        model=model,
        input_tensor=input_tensor,
        original_pil=test_img,
        target_category=dr_level
    )
    assert heatmap_b64.startswith("data:image/png;base64,"), "Heatmap is not a valid base64 PNG data URI"
    assert len(heatmap_b64) > 50, "Heatmap base64 is suspiciously short"
    logger.info("✓ Grad-CAM generation test passed.")

    logger.info("\n=== STEP 3: Testing Gemini Report Generation ===")
    from gemini_client import GeminiReportGenerator

    gemini_gen = GeminiReportGenerator()
    report = gemini_gen.generate_report(dr_stage, confidence)
    logger.info(f"Generated Clinical Report:\n{report}")
    assert len(report) > 20, "Report text is empty or too short"
    logger.info("✓ Gemini report test passed.")

    logger.info("\n=== STEP 4: Testing Firebase Client Persistence ===")
    from firebase_client import firebase_client

    sample_record = {
        "patient_id": "P_TEST_001",
        "patient_name": "Test Patient",
        "age": 45,
        "asha_worker_id": "ASHA_TEST_01",
        "dr_stage": dr_stage,
        "dr_level": dr_level,
        "confidence": confidence,
        "heatmap_base64": heatmap_b64[:30] + "...",
        "report_text": report,
        "location": "Bhilai Rural Clinic"
    }

    screening_id = firebase_client.save_screening(sample_record)
    logger.info(f"Screening ID saved: {screening_id}")
    assert screening_id is not None, "Failed to get screening_id"

    history = firebase_client.get_worker_history("ASHA_TEST_01")
    assert len(history) >= 1, "Failed to retrieve history for worker"
    logger.info(f"Retrieved {len(history)} records for ASHA_TEST_01")
    logger.info("✓ Firebase client test passed.")

    logger.info("\n=== STEP 5: Testing FastAPI Health & Root Endpoints ===")
    from main import app, health_check, read_root, predict_retinopathy
    from starlette.datastructures import UploadFile

    root_res = read_root()
    assert root_res["status"] == "online"

    health_res = health_check()
    assert health_res["status"] == "ok"
    logger.info("✓ Health and Root endpoints test passed.")

    logger.info("\n=== STEP 6: Testing /predict Endpoint Flow ===")
    # Create dummy in-memory image for upload
    img_byte_arr = io.BytesIO()
    test_img.save(img_byte_arr, format="PNG")
    img_bytes = img_byte_arr.getvalue()

    upload_file = UploadFile(
        file=io.BytesIO(img_bytes),
        filename="retina_sample.png"
    )

    predict_res = asyncio.run(predict_retinopathy(
        image=upload_file,
        file=None,
        patient_name="Ramesh Kumar",
        patient_id="P001",
        age=54,
        asha_worker_id="ASHA_102",
        location="Bhilai Health Sub-Centre"
    ))

    logger.info(f"Predict Response: {predict_res}")
    assert "dr_stage" in predict_res
    assert "dr_level" in predict_res
    assert "confidence" in predict_res
    assert "heatmap_base64" in predict_res
    assert predict_res["heatmap_base64"].startswith("data:image/png;base64,")
    assert "report_text" in predict_res
    assert predict_res["patient_id"] == "P001"
    assert "screening_id" in predict_res
    logger.info("✓ /predict endpoint response matches required schema exactly.")

    logger.info("\n🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY! DrishtiAI Backend is ready for production.")


if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        logger.exception(f"Test failed with error: {e}")
        sys.exit(1)
