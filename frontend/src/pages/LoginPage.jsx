import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import DrishtiLogo from '../components/DrishtiLogo';
import ASHAProfilePanel from '../components/ASHAProfilePanel';
import LanguageSelector from '../components/LanguageSelector';

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithDemo, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const [signingIn, setSigningIn] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // If already logged in, redirect to upload
  if (user) {
    return <Navigate to="/upload" replace />;
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google successfully.');
      navigate('/upload');
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized! In your browser, use http://localhost:3000 (NOT 127.0.0.1).');
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in popup was closed.');
      } else if (err.code === 'auth/operation-not-allowed') {
        toast.error('Google provider is not enabled in Firebase Console > Authentication.');
      } else if (err.code === 'auth/network-request-failed') {
        toast.error('Network request failed. Check internet connection.');
      } else {
        toast.error(err.message || 'Google sign-in failed. Check browser console.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleDemoSignIn = (name) => {
    const activeName = (typeof name === 'string' ? name : workerName).trim() || 'ASHA Worker';
    loginWithDemo(activeName);
    toast.success(`Welcome, ${activeName}! Signed in as ASHA Health Worker`);
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative">
      {/* Soft floating background blobs (smooth, non-distracting, warm healthcare theme) */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none animate-floatSlow" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-brand-coral/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-brand-teal/4 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between relative z-10 flex-shrink-0 animate-fadeUp">
        <DrishtiLogo size="md" showTagline={false} />
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {isDemoMode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t('nav.demoMode', 'Demo Mode')}
            </div>
          )}
        </div>
      </header>

      {/* Hero & Main Content Section — Natural flex-1 layout without my-auto scroll clipping */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12 sm:pt-6 sm:pb-16 flex flex-col items-center text-center relative z-10 flex-1">
        {/* Healthcare Mission Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-tealLight border border-brand-teal/20 text-brand-teal text-xs sm:text-sm font-semibold mb-5 animate-fadeUp">
          <span className="w-2 h-2 rounded-full bg-brand-teal" />
          {t('hero.mission', 'Rural Community Healthcare Initiative')}
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-brand-dark leading-tight max-w-3xl mb-4 animate-fadeUp animate-delay-100">
          {t('hero.title1', 'Preventing Blindness in')}{' '}
          <span className="text-brand-teal">
            {t('hero.title2', 'Rural India')}
          </span>
        </h1>

        {/* Mission Statement */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed mb-8 animate-fadeUp animate-delay-200">
          {t('hero.desc', 'DrishtiAI empowers accredited ASHA health workers to screen rural communities for diabetic retinopathy using retinal fundus images captured with portable fundus cameras — bridging the specialist gap before vision loss becomes irreversible.')}
        </p>

        {/* 3 Key Stats Badges with Lift & Glow Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mb-8 animate-fadeUp animate-delay-300">
          <div className="p-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300 flex flex-col items-center group cursor-default">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-brand-teal group-hover:scale-105 transition-transform duration-300">
              {t('stats.stages', '5 DR Stages')}
            </span>
            <span className="text-xs text-brand-muted mt-1 font-medium">
              {t('stats.stagesSub', 'Standard ICDR Grading')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-coral/40 transition-all duration-300 flex flex-col items-center group cursor-default">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-brand-coral group-hover:scale-105 transition-transform duration-300">
              {t('stats.ai', 'AI-Assisted')}
            </span>
            <span className="text-xs text-brand-muted mt-1 font-medium">
              {t('stats.aiSub', 'Field Screening & Triage')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300 flex flex-col items-center group cursor-default">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-brand-dark group-hover:scale-105 transition-transform duration-300">
              {t('stats.speed', '< 2 Seconds')}
            </span>
            <span className="text-xs text-brand-muted mt-1 font-medium">
              {t('stats.speedSub', 'Fast Retinal Image Analysis')}
            </span>
          </div>
        </div>

        {/* ASHA Worker Access Portal Card */}
        <div className="w-full max-w-md mx-auto mb-6 animate-fadeUp animate-delay-300">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full bg-white p-4 sm:p-5 rounded-3xl border border-brand-border hover:border-brand-teal/50 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-3 text-left group cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-label="Toggle ASHA Worker Access Portal and Profile"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-brand-tealLight text-brand-teal flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-display font-bold text-brand-dark group-hover:text-brand-teal transition-colors">
                    {t('login.portalTitle', 'ASHA Worker Access Portal')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('login.portalActive', 'Active')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {t('login.portalSubtitle', 'Sign in to start new retinal screenings or inspect population records')}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-teal group-hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 flex-shrink-0">
              <svg className={`w-4 h-4 transform transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Expandable ASHA Worker Profile Panel — Directly Below Portal Card */}
          {isProfileOpen && (
            <div className="mt-3 text-left animate-panelExpand">
              <ASHAProfilePanel
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                defaultName={workerName.trim() || 'Priya Sharma'}
                onNameChange={(name) => setWorkerName(name)}
              />
            </div>
          )}
        </div>

        {/* ASHA Health Worker Sign-In Card */}
        <div className="w-full max-w-md mx-auto space-y-4 animate-fadeUp animate-delay-400">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border/90 shadow-md space-y-5 text-left relative overflow-hidden">
            {/* Subtle top accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-teal via-brand-tealLight to-brand-coral" />

            <div>
              <h2 className="text-lg font-display font-bold text-brand-dark">
                {t('login.cardTitle', 'ASHA Health Worker Sign In')}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('login.cardSubtitle', 'Enter your name to access the retinal fundus screening terminal.')}
              </p>
            </div>

            {/* ASHA Worker Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="worker-input" className="block text-xs font-bold text-brand-dark">
                {t('login.workerNameLabel', 'ASHA Health Worker Name')} <span className="text-brand-teal">*</span>
              </label>
              <input
                id="worker-input"
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDemoSignIn(workerName);
                  }
                }}
                placeholder={t('login.workerNamePlaceholder', 'Enter your name (e.g. Priya Sharma, Sunita Devi, Anjali...)')}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/50 text-sm font-semibold text-brand-dark focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-brand-muted leading-relaxed">
                {t('login.workerNameHelper', 'The name you write here will be the active ASHA worker on all retinal screening records, audit trails, and clinical triage reports.')}
              </p>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="button"
              onClick={() => handleDemoSignIn(workerName)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-sm shadow-md shadow-brand-teal/20 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              <span>{t('login.signInAs', 'Sign In as')} {workerName.trim() || t('nav.ashaWorker', 'ASHA Worker')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-1 h-[1px] bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('login.orSignInWith', 'or sign in with')}</span>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm hover:-translate-y-0.5 active:scale-98 transition-all duration-200 shadow-2xs cursor-pointer"
            >
              {signingIn ? (
                <span className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-700 animate-spin" />
                  {t('login.connecting', 'Connecting Google account…')}
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t('login.googleSignIn', 'Sign in with Google')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Medical Disclaimer Note */}
        <p className="mt-8 text-[11px] text-slate-400 max-w-lg leading-relaxed">
          {t('login.disclaimer', 'Notice: DrishtiAI is an AI-assisted screening and clinical triage support tool, not a confirmed medical diagnosis. Designed for primary eye-care screening in resource-limited rural clinics.')}
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-2 relative z-10 flex-shrink-0">
        <div>{t('login.footerHackathon', 'DrishtiAI • College Hackathon Edition')}</div>
        <div>{t('login.footerDatasets', 'Trained on Kaggle APTOS 2019 & EyePACS Retinal Datasets')}</div>
      </footer>
    </div>
  );
}
