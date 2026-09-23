# DrishtiAI — FastAPI Backend

**AI-powered Diabetic Retinopathy (DR) Screening Platform for Rural India**  
**Hackathon**: Digital Campus on Google Cloud Hack Sprint — SSTC Bhilai  
**Team**: NexGen | **Lead**: Mahin (Syed Mahin Sabry) | **Theme**: Healthcare  

---

## 📌 Architecture Overview

1. **Retinal Fundus Image Upload**: ASHA workers upload eye fundus photos from rural clinics.
2. **EfficientNet-B3 Model**: Classifies the image into 5 Diabetic Retinopathy stages:
   - `0`: No DR (Healthy)
   - `1`: Mild DR
   - `2`: Moderate DR
   - `3`: Severe DR
   - `4`: Proliferative DR (Most Critical)
3. **Grad-CAM Explainability**: Visualizes affected retinal regions using class activation maps overlaid as heatmaps (`model.features[-1]`).
4. **Google Gemini API**: Synthesizes a structured 3-paragraph clinical summary tailored for rural healthcare workers (diagnosis, urgency level & next steps, lifestyle advice).
5. **Firebase Firestore**: Stores screening records (`screenings` collection) and retrieves worker history.

---

## 📁 Project Structure

```
.
├── main.py                 # FastAPI application, routing & CORS
├── model.py                # EfficientNet-B3 model loader & inference
├── gradcam.py              # Grad-CAM heatmap generator & base64 encoder
├── gemini_client.py        # Gemini 1.5 Flash clinical report generator
├── firebase_client.py      # Firestore persistence & worker history
├── test_api.py             # Verification script for local testing
├── requirements.txt        # Backend dependencies
├── Dockerfile              # Container configuration for Google Cloud Run
├── .env.example            # Environment variables template
└── README.md               # Documentation & deployment guide
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+ installed
- Trained weights file: `efficientnet_dr.pth` placed in the project root directory
- Firebase Service Account key: `serviceAccountKey.json` (optional for local dev; memory fallback active)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and insert your credentials:
```env
GEMINI_API_KEY=AIzaSy...
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
PORT=8080
MODEL_PATH=efficientnet_dr.pth
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Locally
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```
Open **[http://localhost:8080/docs](http://localhost:8080/docs)** to view the interactive Swagger API documentation.

---

## 📡 API Endpoints

### 1. `POST /predict`
Performs DR classification, generates Grad-CAM heatmap, calls Gemini API, and saves record to Firestore.

- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image` *(File, required)*: Retinal fundus image (JPEG/PNG)
  - `patient_name` *(string, required)*: Patient's full name
  - `patient_id` *(string, required)*: e.g., `P001`
  - `age` *(integer, required)*: e.g., `52`
  - `asha_worker_id` *(string, optional)*: e.g., `ASHA_102`
  - `location` *(string, optional)*: e.g., `Bhilai PHC`

**Sample Response**:
```json
{
  "dr_stage": "Severe",
  "dr_level": 3,
  "confidence": 87.5,
  "heatmap_base64": "data:image/png;base64,iVBORw0KGgoAAA...",
  "report_text": "The patient's retinal scan indicates Severe Diabetic Retinopathy...\n\nUrgency Level: Urgent. Immediate referral to district ophthalmologist within 1 week.\n\nStrict glycemic control and blood pressure monitoring recommended.",
  "patient_id": "P001",
  "screening_id": "SCR-A89F12BC"
}
```

### 2. `GET /history/{asha_worker_id}`
Returns all screening records submitted by a specific ASHA worker.

**Sample Response**:
```json
[
  {
    "screening_id": "SCR-A89F12BC",
    "patient_id": "P001",
    "patient_name": "Ramesh Kumar",
    "age": 54,
    "asha_worker_id": "ASHA_102",
    "dr_stage": "Severe",
    "dr_level": 3,
    "confidence": 87.5,
    "heatmap_base64": "data:image/png;base64,...",
    "report_text": "...",
    "timestamp": "2026-09-23T12:30:00",
    "location": "Bhilai PHC"
  }
]
```

### 3. `GET /health`
Liveness/readiness probe for Google Cloud Run:
```json
{"status": "ok"}
```

---

## ☁️ Deployment to Google Cloud Run

### Step 1: Authenticate and Configure Project
```bash
gcloud auth login
gcloud config set project drishti-ai-b2c66
```

### Step 2: Build & Push Image via Google Cloud Build
```bash
gcloud builds submit --tag gcr.io/drishti-ai-b2c66/drishti-backend
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy drishti-backend \
  --image gcr.io/drishti-ai-b2c66/drishti-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key_here"
```

### Step 4: Verify Deployment URL
```bash
gcloud run services describe drishti-backend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🛠️ Troubleshooting Guide

- **`torch` model loading error**: Ensure `map_location='cpu'` is passed when loading checkpoint weights on Cloud Run (`model.py` already includes this).
- **CORS Errors**: `main.py` is configured with `CORSMiddleware(allow_origins=["*"])` to allow requests from any frontend domain.
- **Gemini API Quota Exceeded**: The client defaults to `gemini-1.5-flash` with built-in medical fallback templates so API calls never fail.
- **Cloud Run Out-Of-Memory (OOM)**: Deploy with `--memory 2Gi` or `--memory 4Gi` to accommodate PyTorch and Grad-CAM in-memory tensor processing.
- **Firebase Authentication**: On Cloud Run, Google Cloud IAM automatically manages service account credentials without needing a static `serviceAccountKey.json`.
