import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function ASHAProfilePanel({
  isOpen,
  onClose,
  defaultName = 'Priya Sharma',
  onNameChange,
}) {
  const { user, loginWithDemo, updateProfile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'profile' | 'settings'
  const [isClosing, setIsClosing] = useState(false);

  // ASHA Worker Profile Options
  const [profileData, setProfileData] = useState({
    name: user?.displayName || defaultName,
    workerId: user?.workerId || 'MH-2026-ASHA-042',
    role: user?.role || 'Lead ASHA Screener',
    center: user?.center || 'Primary Health Sub-Centre, Koregaon',
    village: user?.village || 'Koregaon, Rahimatpur',
    device: user?.device || 'Remidio FundusCam v2.1',
    phone: user?.phone || '+91 98765 43210',
  });

  // Common ASHA worker profiles for rapid testing and field operation
  const ASHA_PRESETS = [
    {
      name: 'Priya Sharma',
      workerId: 'MH-2026-ASHA-042',
      role: 'Lead ASHA Screener',
      center: 'Primary Health Sub-Centre, Koregaon',
      village: 'Koregaon, Rahimatpur',
      device: 'Remidio FundusCam v2.1',
      phone: '+91 98765 43210',
    },
    {
      name: 'Sunita Devi',
      workerId: 'MH-2026-ASHA-108',
      role: 'Senior Field ASHA',
      center: 'PHC Wai Block, Satara',
      village: 'Bhilawadi, Shirwal',
      device: 'Forus 3nethra Classic',
      phone: '+91 98234 56789',
    },
    {
      name: 'Anjali More',
      workerId: 'MH-2026-ASHA-224',
      role: 'Community Health Worker',
      center: 'Rural Health Post, Arvi',
      village: 'Arvi, Dahiwadi',
      device: 'Smartphone MII RetCam',
      phone: '+91 97654 32100',
    },
  ];

  // Sync profileData when user or defaultName changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.displayName || defaultName,
        workerId: user.workerId || 'MH-2026-ASHA-042',
        role: user.role || 'Lead ASHA Screener',
        center: user.center || 'Primary Health Sub-Centre, Koregaon',
        village: user.village || 'Koregaon, Rahimatpur',
        device: user.device || 'Remidio FundusCam v2.1',
        phone: user.phone || '+91 98765 43210',
      });
    } else if (defaultName) {
      setProfileData((prev) => ({ ...prev, name: defaultName }));
    }
  }, [user, defaultName]);

  const displayName = profileData.name || defaultName;

  // Reset states on mount or when reopened
  useEffect(() => {
    setIsClosing(false);
    setActiveTab('menu');
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Animated close handler: 280ms reverse animation before firing onClose
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  // If isOpen is explicitly passed as false and we are not closing, don't render
  if (isOpen === false && !isClosing) {
    return null;
  }

  const handleApplyPreset = (preset) => {
    setProfileData(preset);
    if (updateProfile) {
      updateProfile({
        displayName: preset.name,
        workerId: preset.workerId,
        role: preset.role,
        center: preset.center,
        village: preset.village,
        device: preset.device,
        phone: preset.phone,
      });
    } else if (loginWithDemo) {
      loginWithDemo(preset.name, preset);
    }
    if (onNameChange) {
      onNameChange(preset.name);
    }
    toast.success(`Active screener changed to ${preset.name}`);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('ASHA Worker Name cannot be empty');
      return;
    }
    const trimmed = {
      name: profileData.name.trim(),
      workerId: profileData.workerId.trim(),
      role: profileData.role.trim(),
      center: profileData.center.trim(),
      village: profileData.village.trim(),
      device: profileData.device.trim(),
      phone: profileData.phone.trim(),
    };
    if (updateProfile) {
      updateProfile({
        displayName: trimmed.name,
        workerId: trimmed.workerId,
        role: trimmed.role,
        center: trimmed.center,
        village: trimmed.village,
        device: trimmed.device,
        phone: trimmed.phone,
      });
    } else if (loginWithDemo) {
      loginWithDemo(trimmed.name, trimmed);
    }
    if (onNameChange) {
      onNameChange(trimmed.name);
    }
    toast.success('ASHA Worker Profile updated successfully!');
    setActiveTab('menu');
  };

  const handleNavigate = (path, message) => {
    if (!user) {
      loginWithDemo(displayName, profileData);
    }
    if (message) {
      toast.info(message);
    }
    handleClose();
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out from ASHA session.');
    handleClose();
    navigate('/');
  };

  return (
    <div
      className={`w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-280 ease-out transform ${
        isClosing
          ? 'opacity-0 scale-98 pointer-events-none'
          : 'opacity-100 scale-100 animate-panelExpand'
      }`}
      role="region"
      aria-labelledby="asha-profile-panel-title"
    >
      {/* Teal Healthcare Header Banner */}
        <div className="h-20 bg-gradient-to-r from-brand-teal to-brand-tealDark relative flex items-center justify-between px-6">
          <div className="text-white font-semibold text-xs tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            ASHA Health Mission
          </div>

          {/* Close (X) Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 cursor-pointer"
            aria-label="Close profile panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Avatar & Status Section */}
        <div className="px-6 pb-4 pt-0 relative -mt-10">
          <div className="flex items-end justify-between">
            <div className="relative">
              {/* Circular Profile Avatar */}
              <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-brand-coral to-brand-coralHover text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-md">
                {displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              {/* Green Online / Active Indicator Dot */}
              <span
                className="absolute bottom-1 right-1 flex h-4 w-4"
                title={t('profile.online', 'Online • Ready for Screening')}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
              </span>
            </div>

            {/* Green Online Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('profile.online', 'Online • Ready for Screening')}
            </div>
          </div>

          {/* User Name & Health Worker Titles */}
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 id="asha-profile-panel-title" className="text-xl font-display font-extrabold text-brand-dark">
                  {displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-brand-tealLight text-brand-teal text-[11px] font-bold tracking-wide uppercase truncate max-w-[120px]">
                  {profileData.role || 'Screener'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'profile' ? 'menu' : 'profile')}
                className="text-xs font-semibold text-brand-teal hover:text-brand-tealDark flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-tealLight/60 hover:bg-brand-tealLight transition-colors cursor-pointer"
                title="Edit ASHA Worker Profile Options"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{activeTab === 'profile' ? t('profile.viewMenu', 'View Menu') : t('profile.editProfile', 'Edit Profile')}</span>
              </button>
            </div>
            <p className="text-xs text-brand-muted font-medium mt-0.5">
              {profileData.role} • {profileData.center}
            </p>

            {/* Quick Metadata Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">
                ID: {profileData.workerId}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium">
                📷 {profileData.device}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium">
                📍 {profileData.village}
              </span>
            </div>
          </div>
        </div>

        {/* Menu View: The 6 Options */}
        {activeTab === 'menu' && (
          <div className="px-5 pb-6 pt-2 space-y-1.5">
            {/* 1. My Profile */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-tealLight text-brand-teal flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark group-hover:text-brand-teal transition-colors flex items-center gap-2">
                    <span>{t('profile.myProfile', 'My Profile & Screener Options')}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-tealLight text-brand-teal rounded">Edit</span>
                  </div>
                  <div className="text-[11px] text-brand-muted">
                    Name, Worker ID ({profileData.workerId}), Sub-Centre &amp; Camera
                  </div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 2. New Retinal Screening */}
            <button
              type="button"
              onClick={() => handleNavigate('/upload', 'Starting New Retinal Screening')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-tealLight/40 border border-transparent hover:border-brand-teal/30 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark group-hover:text-brand-teal transition-colors">
                    {t('profile.newScreening', 'New Retinal Screening')}
                  </div>
                  <div className="text-[11px] text-brand-muted">Upload fundus camera photo for instant AI triage</div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-brand-teal transform transition-transform group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 3. Screening History */}
            <button
              type="button"
              onClick={() => handleNavigate('/dashboard', 'Opening Screening History')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark group-hover:text-amber-700 transition-colors">
                    {t('profile.screeningHistory', 'Screening History')}
                  </div>
                  <div className="text-[11px] text-brand-muted">Review past patient scans and PDF reports</div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 4. Dashboard */}
            <button
              type="button"
              onClick={() => handleNavigate('/dashboard', 'Opening Population Dashboard')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark group-hover:text-purple-700 transition-colors">
                    {t('profile.dashboard', 'Dashboard')}
                  </div>
                  <div className="text-[11px] text-brand-muted">Prevalence metrics and urgent referral tracker</div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 5. Settings */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark group-hover:text-slate-900 transition-colors">
                    {t('profile.settings', 'Settings')}
                  </div>
                  <div className="text-[11px] text-brand-muted">Fundus camera pairing & offline storage</div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Divider */}
            <div className="pt-2 border-t border-slate-100">
              {/* 6. Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rose-600">{t('profile.logout', 'Logout')}</div>
                    <div className="text-[11px] text-rose-400">Exit active ASHA worker session</div>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Sub-view: My Profile Details & Screener Options */}
        {activeTab === 'profile' && (
          <div className="p-5 sm:p-6 pt-2 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                {t('profile.backToMenu', 'Back to Menu')}
              </button>
              <span className="text-[11px] font-semibold text-slate-500">ASHA Screener Profile &amp; Options</span>
            </div>

            {/* Quick Preset Screener Selector */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                  {t('profile.quickPresets', 'Quick Screener Presets:')}
                </span>
                <span className="text-[10px] text-slate-400">1-click switch</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ASHA_PRESETS.map((preset) => {
                  const isSelected = profileData.name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-2 py-2 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-teal/40 hover:bg-teal-50/40'
                      }`}
                    >
                      <div className="truncate font-bold">{preset.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {preset.workerId}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Profile Options Form */}
            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Option 1: Worker Full Name */}
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  {t('profile.fullName', 'ASHA Worker Full Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                />
              </div>

              {/* Option 2: Worker ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.workerId', 'ASHA Worker ID')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.workerId}
                    onChange={(e) => setProfileData({ ...profileData, workerId: e.target.value })}
                    placeholder="e.g. MH-2026-ASHA-042"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.phone', 'Contact Phone Number')}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
              </div>

              {/* Option 3: Primary Facility & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.center', 'Primary Health Sub-Centre / PHC')}
                  </label>
                  <input
                    type="text"
                    value={profileData.center}
                    onChange={(e) => setProfileData({ ...profileData, center: e.target.value })}
                    placeholder="e.g. Primary Health Sub-Centre, Koregaon"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.role', 'Designation / Role')}
                  </label>
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    placeholder="e.g. Lead ASHA Screener"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
              </div>

              {/* Option 4: Catchment Village & Paired Camera Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.village', 'Assigned Village / Area')}
                  </label>
                  <input
                    type="text"
                    value={profileData.village}
                    onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                    placeholder="e.g. Koregaon, Rahimatpur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t('profile.device', 'Paired Fundus Camera Device')}
                  </label>
                  <input
                    type="text"
                    value={profileData.device}
                    onChange={(e) => setProfileData({ ...profileData, device: e.target.value })}
                    placeholder="e.g. Remidio FundusCam v2.1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('profile.saveApply', 'Save & Apply Profile')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/upload', `Starting screening as ${profileData.name}`)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-brand-teal text-brand-teal hover:bg-brand-tealLight font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{t('profile.startScreening', 'Start Screening')}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sub-view: Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 pt-2 space-y-4 animate-fadeIn">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline mb-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Menu
            </button>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-brand-dark">Offline Screening Cache</div>
                  <div className="text-[11px] text-slate-500">Store up to 50 fundus scans when offline</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Enabled
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-brand-dark">Audio Voice Guidance</div>
                  <div className="text-[11px] text-slate-500">Voice prompts for rural patient positioning</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-tealLight text-brand-teal">
                  Hindi / Marathi
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-brand-dark">High-Precision Grad-CAM</div>
                  <div className="text-[11px] text-slate-500">Render lesion localization overlays</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success('Settings synchronized.');
                setActiveTab('menu');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
  );
}
