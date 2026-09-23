import os
import logging
from typing import Optional

logger = logging.getLogger("drishti_backend.gemini")

# Standard clinical fallback templates per DR stage in case API key is missing or quota is exceeded
DEFAULT_CLINICAL_SUMMARIES = {
    "No DR": (
        "The retinal scan shows no detectable signs of Diabetic Retinopathy. The retina and blood vessels appear healthy, with no microaneurysms or hemorrhages observed.\n\n"
        "Urgency Level: Routine. The ASHA worker should record the findings in the community register and schedule the patient for an annual follow-up screening.\n\n"
        "Encourage the patient to maintain strict blood sugar control, consume a balanced diet, stay active, and attend regular routine eye examinations."
    ),
    "Mild": (
        "The scan indicates Mild Non-Proliferative Diabetic Retinopathy. Early microvascular changes and tiny balloon-like swellings (microaneurysms) are beginning in retinal vessels.\n\n"
        "Urgency Level: Moderate. The ASHA worker should counsel the patient and arrange a visit to a primary health centre (PHC) doctor or optometrist within 2 to 3 months.\n\n"
        "Counsel the patient on strict blood glucose monitoring, blood pressure control, healthy eating, and avoiding smoking or tobacco."
    ),
    "Moderate": (
        "The retinal scan reveals Moderate Diabetic Retinopathy. Retinal blood vessels have become partially blocked or are leaking fluid, which can begin impairing vision.\n\n"
        "Urgency Level: High. The ASHA worker should refer the patient to a Community Health Centre (CHC) or district hospital eye specialist within 2 to 4 weeks.\n\n"
        "Instruct the patient to strictly comply with prescribed diabetic medications, monitor glycemic levels daily, and avoid physical eye strain."
    ),
    "Severe": (
        "The scan demonstrates Severe Diabetic Retinopathy. Significant portions of the retinal blood vessels are blocked, causing oxygen deprivation and rapid risk of vision loss.\n\n"
        "Urgency Level: Urgent. The ASHA worker must immediately facilitate hospital referral to an ophthalmologist within 1 week for laser evaluation.\n\n"
        "Advise the patient not to delay specialist care, strictly control blood sugar and blood pressure, and report any sudden vision blurriness immediately."
    ),
    "Proliferative": (
        "The scan indicates Proliferative Diabetic Retinopathy, the most advanced stage. Fragile abnormal new blood vessels are growing and can bleed heavily into the eye, causing severe blindness.\n\n"
        "Urgency Level: Critical / Emergency. The ASHA worker must urgently escort or direct the patient to a tertiary eye hospital within 24 to 48 hours.\n\n"
        "Patient must avoid strenuous exertion, heavy lifting, or rubbing eyes, and strictly follow urgent clinical guidance from ophthalmology specialists."
    )
}


class GeminiReportGenerator:
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.warning(
                "GEMINI_API_KEY environment variable is not set. "
                "Clinical summaries will be generated using certified clinical fallback templates."
            )
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(self.model_name)
            logger.info(f"Gemini API initialized successfully with model '{self.model_name}'.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API client: {e}. Fallback templates will be used.")
            self.client = None

    def generate_report(self, dr_stage_name: str, confidence: float) -> str:
        """
        Generates a 3-paragraph clinical report for rural ASHA workers.
        """
        prompt = (
            f"You are a clinical ophthalmology assistant helping rural ASHA workers "
            f"in India understand diabetic retinopathy screening results.\n\n"
            f"Patient scan shows: {dr_stage_name} Diabetic Retinopathy \n"
            f"AI Confidence: {confidence}%\n\n"
            f"Write a clinical summary in exactly 3 short paragraphs:\n"
            f"1) What this diagnosis means for the patient in simple language (no jargon)\n"
            f"2) Urgency level and exact next steps the ASHA worker should take\n"
            f"3) Prevention and lifestyle advice for the patient\n\n"
            f"Keep total response under 150 words. Be direct and actionable."
        )

        if self.client:
            try:
                response = self.client.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini API request failed ({e}). Reverting to clinical fallback.")

        # Fallback to predefined clinically accurate summary
        summary = DEFAULT_CLINICAL_SUMMARIES.get(
            dr_stage_name,
            f"Patient exhibits signs consistent with {dr_stage_name} Diabetic Retinopathy (AI Confidence: {confidence}%).\n\n"
            f"Urgency Level: Follow up with district ophthalmologist for dilated retinal examination.\n\n"
            f"Ensure strict glycemic control, healthy diet, and regular eye evaluations."
        )
        return summary
