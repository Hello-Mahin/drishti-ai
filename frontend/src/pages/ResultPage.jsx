import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StageBadge from '../components/StageBadge';
import ConfidenceRing from '../components/ConfidenceRing';
import DRSeverityVisualization from '../components/DRSeverityVisualization';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generatePDFReport } from '../lib/generateReport';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [resultData, setResultData] = useState(() => {
    if (location.state?.resultData) {
      return location.state.resultData;
    }
    // Fallback check sessionStorage
    try {
      const cached = sessionStorage.getItem('drishti_latest_result');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  });

  const { t } = useLanguage();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPdfLanguageModalOpen, setIsPdfLanguageModalOpen] = useState(false);
  const [generatingLanguage, setGeneratingLanguage] = useState(null);

  // If no result data exists at all, redirect to /upload
  useEffect(() => {
    if (!resultData) {
      navigate('/upload', { replace: true });
    }
  }, [resultData, navigate]);

  if (!resultData) {
    return null;
  }

  const {
    patient_id,
    patient_name,
    patient_age,
    dr_stage,
    confidence,
    original_image_url,
    heatmap_base64,
    report_text,
    created_at,
  } = resultData;

  const handleDownloadPDF = async (lang = 'en') => {
    setIsGeneratingPdf(true);
    setGeneratingLanguage(lang);
    try {
      // Simulate small smooth delay for tactile feedback
      await new Promise((resolve) => setTimeout(resolve, 500));
      await generatePDFReport(resultData, user?.displayName || 'ASHA Health Worker', lang);
      toast.success(
        lang === 'hi'
          ? 'हिंदी पीडीएफ रिपोर्ट सफलतापूर्वक तैयार की गई!'
          : 'PDF report generated successfully.'
      );
      setIsPdfLanguageModalOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
      setGeneratingLanguage(null);
    }
  };

  const handleShareWhatsApp = () => {
    const stageName = dr_stage || 'Diabetic Retinopathy Assessment';
    const confPercent = Math.round((confidence || 0) * 100);
    const message = `DrishtiAI Screening Report\nPatient: ${patient_name || 'Anonymous'}\nDR Stage: ${stageName}\nConfidence: ${confPercent}%\n\nPlease refer to the generated DrishtiAI report for complete screening details.\n\nNotice: DrishtiAI is an AI-assisted screening tool, not a confirmed medical diagnosis.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formattedDate = new Date(created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border animate-fadeUp">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal mb-1">
              <Link to="/upload" className="hover:underline flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                {t('result.screenings', 'Screenings')}
              </Link>
              <span>/</span>
              <span>{t('result.analysis', 'Result Analysis')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-dark tracking-tight">
              {t('result.assessmentTitle', 'Diabetic Retinopathy Assessment')}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              to="/upload"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-brand-dark text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('result.newScan', 'New Scan')}</span>
            </Link>

            {/* Generate PDF Report Button */}
            <button
              type="button"
              onClick={() => setIsPdfLanguageModalOpen(true)}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-brand-teal/20 flex items-center gap-2 transform active:scale-98 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>{t('result.generatingPdf', 'Generating Report…')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{t('result.generatePdf', 'Generate PDF Report')}</span>
                </>
              )}
            </button>

            {/* Share on WhatsApp Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 transform active:scale-98 cursor-pointer"
              title="Share report summary via WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.1-.477-.15-.677.15-.2.301-.777.98-.953 1.18-.175.2-.351.225-.652.075-.301-.15-1.272-.469-2.422-1.496-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.63-.928-2.232-.244-.587-.492-.507-.676-.516-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.029-1.053 2.509 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.895.12.577-.087 1.781-.728 2.032-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35zM12.04 2C6.518 2 2.03 6.485 2.03 12c0 1.98.577 3.824 1.573 5.378L2 22l4.78-1.554C8.26 21.373 10.103 22 12.04 22c5.522 0 10.01-4.485 10.01-10S17.562 2 12.04 2zm0 18.15c-1.706 0-3.29-.533-4.59-1.442l-.33-.23-2.834.92.943-2.76-.248-.36A8.136 8.136 0 013.88 12c0-4.498 3.66-8.15 8.16-8.15 4.5 0 8.16 3.652 8.16 8.15 0 4.498-3.66 8.15-8.16 8.15z" />
              </svg>
              <span>{t('result.shareWhatsApp', 'Share on WhatsApp')}</span>
            </button>
          </div>
        </div>

        {/* 1. Patient Information Banner (Stagger 1) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-brand-border shadow-xs animate-fadeUp animate-delay-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                {t('result.patientName', 'Patient Name')}
              </span>
              <span className="text-base font-display font-extrabold text-brand-dark mt-0.5 block">
                {patient_name}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                {t('result.patientId', 'Patient ID')}
              </span>
              <span className="text-sm font-mono font-bold text-brand-teal mt-0.5 block">
                {patient_id}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                {t('result.ageDemo', 'Age & Demographic')}
              </span>
              <span className="text-sm font-semibold text-brand-dark mt-0.5 block">
                {patient_age} {t('result.years', 'Years')}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                {t('result.scanTimestamp', 'Scan Timestamp')}
              </span>
              <span className="text-xs font-medium text-slate-600 mt-0.5 block">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Core Analysis Section: Retinal Image & DR Visualization (Stagger 2 & 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Retinal Fundus & Heatmap Cards (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Desktop Side-by-side / Mobile Stacked Image Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Original Retinal Image Card */}
              <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-xs flex flex-col items-center group transition-all animate-fadeUp animate-delay-200">
                <div className="w-full flex items-center justify-between mb-2.5 px-1">
                  <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
                    {t('result.originalFundus', 'Original Retinal Image')}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Fundus Camera
                  </span>
                </div>

                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 shadow-inner">
                  {original_image_url ? (
                    <img
                      src={original_image_url}
                      alt="Original Retinal Fundus"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Image Available</span>
                  )}
                </div>

                <p className="text-[11px] text-brand-muted text-center mt-3">
                  High-magnification retinal posterior pole view
                </p>
              </div>

              {/* Grad-CAM Heatmap Card */}
              <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-xs flex flex-col items-center group transition-all animate-fadeUp animate-delay-300">
                <div className="w-full flex items-center justify-between mb-2.5 px-1">
                  <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {t('result.gradCamOverlay', 'Grad-CAM Heatmap')}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-brand-coral">
                    AI Attention
                  </span>
                </div>

                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 shadow-inner">
                  {heatmap_base64 ? (
                    <img
                      src={heatmap_base64}
                      alt="Grad-CAM Pathology Attention Heatmap"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Grad-CAM Processing…</span>
                  )}
                </div>

                <p className="text-[11px] text-brand-muted text-center mt-3">
                  Red & yellow zones highlight pathological lesions
                </p>
              </div>
            </div>
          </div>

          {/* Right: DR Analysis Visualization & Severity Matrix (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Circular DR Confidence Ring */}
            <div className="animate-fadeUp animate-delay-300">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  {t('result.triageAssessment', 'AI Screening Assessment')}
                </span>
                <StageBadge stage={dr_stage} size="sm" />
              </div>
              <ConfidenceRing stage={dr_stage} confidence={confidence} size={190} />
            </div>

            {/* Compact DR Severity Scale */}
            <div className="animate-fadeUp animate-delay-400">
              <DRSeverityVisualization currentStage={dr_stage} />
            </div>
          </div>
        </div>

        {/* Clinical-style Screening Summary Report (Staggered Entrance) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs animate-fadeUp animate-delay-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-tealLight text-brand-teal flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-bold text-brand-dark">
                  {t('result.clinicalFindings', 'AI Screening Summary')}
                </h3>
                <span className="text-xs text-brand-muted font-medium">
                  Objective deep-learning clinical report for rural health workers
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-brand-muted">Stage Grade:</span>
              <StageBadge stage={dr_stage} size="sm" />
            </div>
          </div>

          {/* Formatted Report Body */}
          <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-border/60 text-sm text-brand-dark leading-relaxed font-normal whitespace-pre-line">
            {report_text}
          </div>

          {/* Medical Disclaimer Callout */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="leading-relaxed">
              <strong className="font-bold">Medical Disclaimer: </strong>
              This is an AI-assisted screening result and not a confirmed medical diagnosis. Designed for primary
              health worker (ASHA) triage. Refer patients presenting with abnormalities to an ophthalmologist for definitive
              dilated examination.
            </div>
          </div>
        </div>
      </main>

      {/* Select PDF Language Modal */}
      {isPdfLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => !isGeneratingPdf && setIsPdfLanguageModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center z-10 animate-scaleIn">
            {/* Close Button */}
            {!isGeneratingPdf && (
              <button
                type="button"
                onClick={() => setIsPdfLanguageModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Icon */}
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl font-display font-extrabold text-brand-dark mb-1">
              Select PDF Language
            </h3>
            <p className="text-xs text-brand-muted mb-5">
              Choose the language for the generated DrishtiAI screening report
            </p>

            {/* If Generating: Progress Spinner */}
            {isGeneratingPdf ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <Spinner size="md" className="text-brand-teal" />
                <span className="text-sm font-bold text-brand-dark">
                  {generatingLanguage === 'hi'
                    ? 'हिंदी में रिपोर्ट तैयार की जा रही है…'
                    : 'Generating English PDF Report…'}
                </span>
                <span className="text-xs text-brand-muted">
                  Embedding retinal images and clinical data
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selectable Options */}
                <div className="space-y-2.5 text-left">
                  {/* Option: English */}
                  <div
                    onClick={() => handleDownloadPDF('en')}
                    className="flex items-center justify-between p-3.5 rounded-xl border-2 border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">🇬🇧</span>
                      <div>
                        <div className="font-bold text-sm text-brand-dark group-hover:text-brand-teal transition-colors">
                          English
                        </div>
                        <div className="text-xs text-brand-muted">Standard Clinical Report</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                      Select
                    </span>
                  </div>

                  {/* Option: Hindi */}
                  <div
                    onClick={() => handleDownloadPDF('hi')}
                    className="flex items-center justify-between p-3.5 rounded-xl border-2 border-slate-200 hover:border-brand-teal hover:bg-brand-teal/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">🇮🇳</span>
                      <div>
                        <div className="font-bold text-sm text-brand-dark group-hover:text-brand-teal transition-colors">
                          हिन्दी
                        </div>
                        <div className="text-xs text-brand-muted">आशा कार्यकर्ता हेतु हिंदी रिपोर्ट</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                      चुनें
                    </span>
                  </div>
                </div>

                {/* Explicit Buttons: [ English ] [ हिन्दी ] */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF('en')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-dark font-bold text-sm transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>🇬🇧</span>
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF('hi')}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-sm transition-all shadow-sm shadow-brand-teal/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>🇮🇳</span>
                    <span>हिन्दी</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
