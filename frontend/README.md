# DrishtiAI — Preventing Blindness in Rural India

**DrishtiAI** is an AI-assisted Diabetic Retinopathy (DR) screening application designed specifically for **ASHA (Accredited Social Health Activist) health workers** in rural India.

Diabetic Retinopathy is one of the leading causes of preventable adult blindness worldwide. In rural India, access to ophthalmologists is severely constrained, leading to late diagnoses when vision loss has already become permanent. DrishtiAI bridges this gap by enabling frontline health workers to screen retinal fundus images captured via portable fundus cameras directly in rural sub-centres, categorizing pathology into 5 standard ICDR stages in under 2 seconds.

---

## Key Features

1. **Retinal Fundus Image Analysis**
   - High-throughput screening of retinal fundus photographs captured via fundus cameras.
   - Strictly engineered for retinal fundus images (not normal eye photos or phone selfies).
   - Instant drag-and-drop or file upload supporting `.jpg`, `.jpeg`, and `.png`.

2. **Kaggle APTOS 2019 Dataset Presets**
   - Built-in instant test cases covering all 5 International Clinical Diabetic Retinopathy (ICDR) stages:
     - **Stage 0: No DR** (Normal healthy retina)
     - **Stage 1: Mild NPDR** (Early microaneurysms)
     - **Stage 2: Moderate NPDR** (Hemorrhages and hard lipid exudates)
     - **Stage 3: Severe NPDR** (4-2-1 Rule met, cotton wool spots)
     - **Stage 4: Proliferative DR** (Neovascularization, vitreous hemorrhage risk — flagged as **URGENT**)

3. **Spatial Explainability (Grad-CAM Heatmaps)**
   - Dual side-by-side retinal visualization: Original Retinal Fundus and Grad-CAM Attention Heatmap.
   - Clearly highlights microaneurysms, hemorrhages, and vascular abnormalities guiding the model's prediction.

4. **Dynamic DR Visualization & Confidence Ring**
   - Animated SVG circular progress ring displaying real-time confidence (0% → target percentage over 1.5s).
   - Distinct healthcare color coding for all 5 stages.
   - Compact ICDR severity matrix highlighting the active detected stage.

5. **Clinical PDF Screening Report**
   - 1-click clinical document export using **jsPDF**.
   - Embeds patient demographics, scan metadata, side-by-side fundus & Grad-CAM images, objective AI clinical findings, and standard rural triage disclaimers.

6. **Population Health Dashboard**
   - Real-time rural screening registry with animated metric counters: *Total Screenings*, *Cases Needing Urgent Care (Severe + Proliferative)*, and *Clear Cases (No DR)*.
   - Searchable, filterable screening table with "View Details" to recall any past patient scan.

7. **Zero-Setup Demo Mode**
   - Fully functional offline/demo mode when Firebase or backend server are not configured.
   - Pre-loaded with 5 realistic community patient records and procedural fundus imaging.

---

## Technology Stack

- **Frontend Framework:** React 18 (Functional Components, Hooks)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Custom healthcare palette: Primary Teal `#0E9488`, Warm Coral `#FF7A59`, Background `#F7FAF9`, Dark `#0B2A32`)
- **Typography:** Google Fonts (*Plus Jakarta Sans* & *Sora*)
- **HTTP Client:** Axios
- **Authentication & Database:** Firebase v10 (Google Authentication & Cloud Firestore)
- **Report Generation:** jsPDF
- **Bundler & Dev Server:** Vite (Configured to start at `http://localhost:3000`)

---

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```

The application will launch and open automatically at:
```
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the root directory if you wish to connect a live backend or Firebase project. A template is provided in `.env.example`:

```env
# Optional: Backend Deep Learning API Endpoint
REACT_APP_API_URL=http://localhost:8000/api

# Optional: Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

> **Note:** If `.env` is omitted, DrishtiAI runs in **Demo Mode** seamlessly without any errors.

---

## Firebase Setup (Optional)

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** and add **Google** as a sign-in provider.
3. Enable **Cloud Firestore** in test or production mode.
4. Copy your web app configuration keys into `.env` (see above).
5. When configured, DrishtiAI will authenticate via Google and sync screenings in real-time to Firestore.

### Cloud Firestore Schema
Collection: `screenings`
```json
{
  "patientId": "MH-STR-2026-0041",
  "patientName": "Rameshwar Patil",
  "patientAge": 48,
  "drStage": "No DR",
  "confidence": 96.4,
  "createdAt": "2026-09-22T10:00:00.000Z",
  "reportText": "Clean retinal vasculature, optic disc margins intact..."
}
```

---

## Backend API Setup (Optional)

DrishtiAI can connect to any deep learning inference backend exposing a `POST /predict` endpoint:

- **Method:** `POST /predict`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `image`: Retinal fundus image binary file (`image/jpeg` or `image/png`)
  - `patient_name`: Patient full name
  - `patient_age`: Patient age in years
  - `patient_id`: Unique screening ID
- **Expected JSON Response:**
  ```json
  {
    "dr_stage": "Moderate",
    "confidence": 89.5,
    "heatmap_base64": "data:image/jpeg;base64,...",
    "report_text": "Scattered blot hemorrhages and hard lipid exudates near macula..."
  }
  ```

If `REACT_APP_API_URL` is omitted or the backend is unreachable, DrishtiAI automatically simulates a 1.5–2.0 second deep-learning inference pipeline with Grad-CAM heatmap generation.

---

## Project Structure

```
drishti-ai/
├── public/
│   └── favicon.svg                    # Custom DrishtiAI retinal aperture icon
├── src/
│   ├── components/
│   │   ├── ConfidenceRing.jsx         # Animated circular progress ring (0% -> target)
│   │   ├── DRSeverityVisualization.jsx # Compact ICDR 5-stage matrix
│   │   ├── DrishtiLogo.jsx            # Custom SVG eye icon and typography logo
│   │   ├── Navbar.jsx                 # Healthcare header with ASHA profile and navigation
│   │   ├── ProtectedRoute.jsx         # Route guard for authenticated ASHA access
│   │   ├── Spinner.jsx                # Subtle loading spinner
│   │   └── StageBadge.jsx             # Clinical color badges (No DR to Proliferative)
│   ├── context/
│   │   ├── AuthContext.jsx            # Firebase Auth & seamless Demo Mode provider
│   │   └── ToastContext.jsx           # Non-blocking slide/fade notification system
│   ├── lib/
│   │   ├── generateReport.js          # jsPDF clinical screening report generator
│   │   └── sampleFundusData.js        # APTOS 2019 fundus simulations & Grad-CAM engine
│   ├── pages/
│   │   ├── DashboardPage.jsx          # Population registry, stats, and real-time records
│   │   ├── LoginPage.jsx              # Landing & ASHA worker authentication portal
│   │   ├── ResultPage.jsx             # DR classification, Grad-CAM, and PDF export
│   │   └── UploadPage.jsx             # Fundus drag-and-drop & patient registry form
│   ├── App.jsx                        # React Router v6 route configuration
│   ├── api.js                         # Axios client with fallback mock engine
│   ├── firebase.js                    # Firebase v10 initialization
│   ├── index.css                      # Tailwind directives, fonts, and animation keyframes
│   └── index.js                       # React 18 DOM root entry point
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore definitions
├── index.html                         # HTML5 template with Google Fonts
├── package.json                       # Project scripts and dependencies
├── postcss.config.js                  # PostCSS plugins
├── tailwind.config.js                 # Tailwind CSS theme configuration
├── vite.config.js                     # Vite build configuration (port 3000)
└── README.md                          # Comprehensive documentation
```

---

## How to Use the Application

1. **Access Portal:** Navigate to `http://localhost:3000`. Click **"Continue as ASHA Worker (Demo Mode)"** or sign in with Google.
2. **Upload Retinal Fundus Image:**
   - On the `/upload` page, drag and drop a retinal fundus image, or select one of the 5 quick **Kaggle APTOS 2019** sample cases.
   - Enter or confirm the patient demographics (Name, Age, Patient ID).
   - Click **"Analyze Retina"**.
3. **Inspect Clinical Results:**
   - Observe the circular confidence ring animating upward.
   - Compare the original retinal fundus image side-by-side with the **Grad-CAM attention heatmap**.
   - Review the objective clinical summary and ASHA protocol recommendations.
   - Click **"Generate PDF Report"** to download the official clinical summary.
4. **Surveillance Dashboard:**
   - Navigate to `/dashboard` to monitor population screening statistics, filter by severity, or recall past patient records.

---

## Medical Disclaimer

DrishtiAI is an artificial intelligence screening triage tool designed to assist community healthcare workers in identifying individuals requiring ophthalmologist consultation. It does not provide a definitive medical diagnosis. Final diagnosis and treatment decisions must be made by qualified medical professionals.
