import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { predictRetina } from '../api';
import { SAMPLE_CASES, generateFundusImage } from '../lib/sampleFundusData';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UploadPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // Form State
  const [patientName, setPatientName] = useState('Rameshwar Patil');
  const [patientAge, setPatientAge] = useState(48);
  const [patientId, setPatientId] = useState(() => `MH-STR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [selectedSampleStage, setSelectedSampleStage] = useState(null);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);

  // Submission / Loading State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle Drag Events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Please upload a valid retinal fundus image (.jpg, .jpeg, .png).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Retinal image file size must be less than 15 MB.');
      return;
    }

    setImageFile(file);
    setSelectedSampleStage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target.result);
      toast.success('Retinal fundus image loaded.');
    };
    reader.readAsDataURL(file);
  };

  // Quick APTOS 2019 Dataset Sample Selector
  const handleSelectSample = (sampleCase) => {
    const dataUrl = generateFundusImage(sampleCase.stage);
    setImageDataUrl(dataUrl);
    setImageFile(null);
    setSelectedSampleStage(sampleCase.stage);
    setPatientName(sampleCase.patientName);
    setPatientAge(sampleCase.patientAge);
    setPatientId(sampleCase.patientId);
    toast.info(`Loaded Kaggle APTOS sample: ${sampleCase.label}`);
  };

  const clearSelectedImage = () => {
    setImageFile(null);
    setImageDataUrl(null);
    setSelectedSampleStage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!imageDataUrl && !imageFile) {
      toast.error('Please upload a retinal fundus image captured using a fundus camera.');
      return;
    }

    if (!patientName.trim()) {
      toast.error('Please enter the patient name.');
      return;
    }

    if (!patientAge || patientAge <= 0 || patientAge > 120) {
      toast.error('Please enter a valid patient age.');
      return;
    }

    if (!patientId.trim()) {
      toast.error('Please enter or generate a patient ID.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await predictRetina({
        imageFile,
        imageDataUrl,
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        patientId: patientId.trim(),
        sampleStage: selectedSampleStage,
      });

      // Save to Firestore if available
      if (isFirebaseConfigured && db) {
        try {
          await addDoc(collection(db, 'screenings'), {
            patientId: result.patient_id,
            patientName: result.patient_name,
            patientAge: Number(result.patient_age),
            drStage: result.dr_stage,
            confidence: Number(result.confidence),
            createdAt: serverTimestamp(),
            reportText: result.report_text,
          });
        } catch (dbErr) {
          console.warn('Firestore write skipped or failed:', dbErr);
        }
      }

      // Also persist to local recent screenings so dashboard reflects it immediately in demo mode
      try {
        const existingLocal = JSON.parse(localStorage.getItem('drishti_screenings_registry') || '[]');
        const newRecord = {
          id: 'scan_' + Date.now(),
          patientId: result.patient_id,
          patientName: result.patient_name,
          patientAge: Number(result.patient_age),
          drStage: result.dr_stage,
          confidence: Number(result.confidence),
          createdAt: result.created_at,
          reportText: result.report_text,
          original_image_url: result.original_image_url,
          heatmap_base64: result.heatmap_base64,
        };
        localStorage.setItem(
          'drishti_screenings_registry',
          JSON.stringify([newRecord, ...existingLocal.slice(0, 49)])
        );
      } catch {}

      // Cache latest result in sessionStorage for ResultPage
      sessionStorage.setItem('drishti_latest_result', JSON.stringify(result));

      toast.success('Retinal analysis complete.');
      navigate('/result', { state: { resultData: result } });
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to complete retinal image analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title Section */}
        <div className="mb-8 animate-fadeUp">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
            {t('upload.badge', 'Primary Eye Care Screening')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-dark tracking-tight">
            {t('upload.title', 'Upload Retinal Fundus Image')}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {t('upload.desc', 'Upload a clear retinal image captured using a fundus camera. DrishtiAI will perform automated ICDR Diabetic Retinopathy screening and highlight vascular pathology with Grad-CAM.')}
          </p>
        </div>

        {/* Form and Upload Grid */}
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Drag & Drop Upload Zone (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {t('upload.fundusImage', 'Fundus Camera Image')}
                </label>
                {imageDataUrl && (
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    {t('upload.changeImage', 'Change Image')}
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
                id="fundus-file-input"
              />

              {/* Drag-and-Drop Area */}
              {!imageDataUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-brand-teal bg-brand-tealLight/40 scale-[1.01] shadow-md'
                      : 'border-slate-300 hover:border-brand-teal/80 hover:bg-slate-50/70 bg-brand-bg/50'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                      isDragging
                        ? 'bg-brand-teal text-white scale-110'
                        : 'bg-brand-tealLight text-brand-teal group-hover:scale-105'
                    }`}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <h3 className="text-base font-bold text-brand-dark mb-1">
                    {isDragging ? t('upload.dropTitle', 'Drop retinal image here') : t('upload.dropTitle', 'Drag & drop retinal fundus image here')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    {t('upload.dropSubtitle', 'Or click to browse from your device. Supported formats: .jpg, .jpeg, .png (max 15MB)')}
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-600 shadow-2xs">
                    <svg className="w-3.5 h-3.5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('upload.supportedFormats', 'Must be a retinal fundus image from a fundus camera')}
                  </div>
                </div>
              ) : (
                /* Preview Container */
                <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-slate-950 flex flex-col items-center p-4 animate-scaleIn">
                  <div className="relative max-h-80 w-full flex items-center justify-center">
                    <img
                      src={imageDataUrl}
                      alt="Retinal Fundus Preview"
                      className="max-h-72 object-contain rounded-xl shadow-lg"
                    />
                  </div>
                  <div className="w-full mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Retinal Fundus Image Loaded
                    </span>
                    {selectedSampleStage && (
                      <span className="text-[11px] font-semibold text-brand-coral bg-brand-coral/10 px-2 py-0.5 rounded">
                        Kaggle Sample: {selectedSampleStage}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sample Fundus Cases for Demonstration */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    {t('upload.sampleImages', 'Or Select Kaggle APTOS 2019 Demo Case:')}
                  </span>
                  <span className="text-[11px] text-brand-muted">Click to auto-populate</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SAMPLE_CASES.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectSample(sc)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                        selectedSampleStage === sc.stage
                          ? 'border-brand-teal bg-brand-tealLight/50 text-brand-teal font-bold shadow-2xs'
                          : 'border-slate-200 hover:border-brand-teal/40 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-semibold line-clamp-1">{sc.stage}</span>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{sc.patientName.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Patient Information Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border shadow-xs">
              <h2 className="text-base font-display font-bold text-brand-dark mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t('upload.patientDetails', 'Patient Registry Form')}
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Ensure patient identification is correct before clinical DR classification
              </p>

              <div className="space-y-4">
                {/* Patient ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="patient-id" className="text-xs font-semibold text-brand-dark">
                      {t('upload.patientId', 'Patient ID')} <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPatientId(`MH-STR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[11px] text-brand-teal hover:underline cursor-pointer"
                    >
                      Generate New
                    </button>
                  </div>
                  <input
                    id="patient-id"
                    type="text"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="e.g. MH-STR-2026-0042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all font-mono"
                  />
                </div>

                {/* Patient Name */}
                <div>
                  <label htmlFor="patient-name" className="block text-xs font-semibold text-brand-dark mb-1">
                    {t('upload.patientName', 'Patient Full Name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t('upload.patientNamePlaceholder', 'e.g. Rameshwar Patil')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                  />
                </div>

                {/* Patient Age */}
                <div>
                  <label htmlFor="patient-age" className="block text-xs font-semibold text-brand-dark mb-1">
                    {t('upload.patientAge', 'Patient Age (Years)')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="patient-age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 52"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                  />
                </div>

                {/* ASHA Screener Meta */}
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">{t('upload.activeScreener', 'Field Screener:')}</span>
                    <span className="font-semibold text-brand-dark">{user?.displayName || 'ASHA Worker'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">{t('result.facility', 'Primary Facility:')}</span>
                    <span className="font-semibold text-brand-dark">{user?.center || 'Rural Health Sub-Centre'}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isAnalyzing || !imageDataUrl}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all transform active:scale-98 shadow-md cursor-pointer ${
                    isAnalyzing || !imageDataUrl
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-brand-teal hover:bg-brand-tealDark text-white shadow-brand-teal/25 hover:shadow-lg'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>{t('upload.analyzing', 'Analyzing retina…')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{t('upload.analyzeBtn', 'Analyze Retina')}</span>
                    </>
                  )}
                </button>
                {!imageDataUrl && (
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Please upload or select a retinal image above to begin screening
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
