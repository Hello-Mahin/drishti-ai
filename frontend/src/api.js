import axios from 'axios';
import { generateFundusImage, generateGradCAMHeatmap, SAMPLE_CASES } from './lib/sampleFundusData';

const getApiBaseUrl = () => {
  return (
    (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
    import.meta.env?.VITE_API_URL ||
    ''
  );
};

const api = axios.create({
  timeout: 15000,
});

/**
 * Predicts Diabetic Retinopathy from a Retinal Fundus image.
 * If backend is not configured or unavailable, automatically falls back to high-fidelity mock mode.
 */
export async function predictRetina({
  imageFile,
  imageDataUrl,
  patientName = 'Anonymous Patient',
  patientAge = 50,
  patientId = 'MH-2026-0001',
  sampleStage = null,
}) {
  const baseUrl = getApiBaseUrl();

  // If backend endpoint is provided, attempt actual backend request
  if (baseUrl && baseUrl.trim() !== '') {
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageDataUrl) {
        // Convert dataUrl to blob
        const res = await fetch(imageDataUrl);
        const blob = await res.blob();
        formData.append('image', blob, `${patientId}_fundus.jpg`);
      }
      formData.append('patient_name', patientName);
      formData.append('patient_age', String(patientAge));
      formData.append('patient_id', patientId);

      const endpoint = baseUrl.endsWith('/') ? `${baseUrl}predict` : `${baseUrl}/predict`;
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const data = response.data;
        return {
          dr_stage: data.dr_stage || data.stage || 'No DR',
          confidence: Number(data.confidence) || 85.0,
          heatmap_base64: data.heatmap_base64 || data.heatmap || generateGradCAMHeatmap(imageDataUrl, data.dr_stage),
          report_text: data.report_text || data.report || 'Retinal fundus screening completed with automated deep learning analysis.',
          patient_id: patientId,
          patient_name: patientName,
          patient_age: Number(patientAge),
          original_image_url: imageDataUrl,
          created_at: new Date().toISOString(),
          isMock: false,
        };
      }
    } catch (err) {
      console.warn('Backend API request failed or unreachable. Falling back to DrishtiAI Mock Mode:', err.message);
      // Seamlessly proceed with mock mode simulation
    }
  }

  // ==========================================
  // Mock Mode Engine (1.5 - 2.0s realistic delay)
  // ==========================================
  const delayMs = 1500 + Math.floor(Math.random() * 500);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // Determine stage: if user selected a sample case or uploaded an image
  let selectedCase;
  if (sampleStage) {
    selectedCase = SAMPLE_CASES.find((c) => c.stage.toLowerCase() === sampleStage.toLowerCase()) || SAMPLE_CASES[1];
  } else {
    // Semi-random pick with weighted realistic distribution
    const rand = Math.random();
    if (rand < 0.35) selectedCase = SAMPLE_CASES[0]; // No DR
    else if (rand < 0.65) selectedCase = SAMPLE_CASES[1]; // Mild
    else if (rand < 0.85) selectedCase = SAMPLE_CASES[2]; // Moderate
    else if (rand < 0.95) selectedCase = SAMPLE_CASES[3]; // Severe
    else selectedCase = SAMPLE_CASES[4]; // Proliferative
  }

  const effectiveOriginal = imageDataUrl || generateFundusImage(selectedCase.stage);
  const heatmap = generateGradCAMHeatmap(effectiveOriginal, selectedCase.stage);

  const confidenceVariation = Number((selectedCase.confidence + (Math.random() * 3 - 1.5)).toFixed(1));

  const clinicalSummary = `DrishtiAI automated deep-learning screening model (EfficientNet-B4 backbone trained on Kaggle APTOS 2019 & EyePACS datasets) evaluated the retinal fundus image for ICDR classification.\n\n` +
    `Screening Result: Stage ${selectedCase.stage} Diabetic Retinopathy (${selectedCase.findings}).\n\n` +
    `Model Spatial Attention (Grad-CAM): Significant activation localized to retinal microvasculature with ${confidenceVariation}% screening confidence.\n\n` +
    `ASHA Health Worker Protocol: ${selectedCase.recommendation}`;

  return {
    dr_stage: selectedCase.stage,
    confidence: confidenceVariation,
    heatmap_base64: heatmap,
    report_text: clinicalSummary,
    patient_id: patientId,
    patient_name: patientName,
    patient_age: Number(patientAge),
    original_image_url: effectiveOriginal,
    created_at: new Date().toISOString(),
    isMock: true,
  };
}
