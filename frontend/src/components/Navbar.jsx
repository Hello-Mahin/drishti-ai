import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DrishtiLogo from './DrishtiLogo';
import ASHAProfilePanel from './ASHAProfilePanel';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { user, logout, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/upload" className="flex items-center hover:opacity-95 transition-opacity">
            <DrishtiLogo size="sm" showTagline={false} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/upload')
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-tealLight/60 hover:text-brand-teal'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('nav.newScan', 'New Scan')}</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-tealLight/60 hover:text-brand-teal'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </Link>
          </nav>

          {/* User Info & Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Demo indicator tag */}
            {isDemoMode && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {t('nav.demoMode', 'Demo Mode')}
              </span>
            )}

            {/* ASHA Worker Access Portal Dropdown Container */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-brand-border hover:border-brand-teal/40 bg-white hover:bg-brand-tealLight/30 transition-all cursor-pointer group shadow-2xs text-left"
                title="Toggle ASHA Worker Access Portal & Profile"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-brand-coral/15 text-brand-coral border border-brand-coral/30 flex items-center justify-center font-display font-bold text-xs uppercase shadow-2xs group-hover:scale-105 transition-transform">
                    {user?.displayName ? user.displayName.charAt(0) : 'A'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-brand-dark group-hover:text-brand-teal transition-colors line-clamp-1 max-w-[130px]">
                      {user?.displayName || 'ASHA Worker'}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-tealLight text-brand-teal rounded border border-brand-teal/20">
                      Portal
                    </span>
                  </div>
                  <span className="text-[10px] text-brand-muted font-medium flex items-center gap-1">
                    <span>ASHA Access Portal</span>
                    <svg
                      className={`w-3 h-3 text-slate-400 group-hover:text-brand-teal transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180 text-brand-teal' : 'group-hover:translate-y-0.5'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* Dropdown Floating Popover directly BELOW the ASHA Worker Button */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-[340px] max-w-[calc(100vw-24px)] z-50 animate-panelExpand rounded-3xl shadow-2xl max-h-[min(85vh,640px)] overflow-y-auto"
                  style={{ filter: 'drop-shadow(0 20px 25px rgba(11, 42, 50, 0.15))' }}
                >
                  <ASHAProfilePanel
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    defaultName={user?.displayName || 'ASHA Worker'}
                  />
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              title="Log out"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isDemoMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Demo
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-dark hover:bg-brand-tealLight/50 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 pt-3 pb-4 space-y-2 animate-fadeUp">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-brand-bg hover:bg-brand-tealLight/40 border border-brand-border hover:border-brand-teal/40 transition-all text-left group cursor-pointer mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-coral/15 text-brand-coral flex items-center justify-center font-bold text-sm border border-brand-coral/30">
                    {user?.displayName ? user.displayName.charAt(0) : 'A'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                    <span>{user?.displayName || 'ASHA Worker'}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-tealLight text-brand-teal rounded">
                      Portal
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted">{user?.center || 'Rural Health Sub-Centre'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-teal">
                <span>Access Portal</span>
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {isProfileOpen && (
              <div className="w-full mb-3 animate-panelExpand rounded-3xl shadow-lg border border-slate-200/90 bg-white overflow-hidden max-h-[75vh] overflow-y-auto">
                <ASHAProfilePanel
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  defaultName={user?.displayName || 'ASHA Worker'}
                />
              </div>
            )}
          </div>

          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-brand-dark flex items-center gap-1.5">
              <span>🌐</span>
              <span>{t('lang.select', 'Language / भाषा')}:</span>
            </span>
            <LanguageSelector />
          </div>

          <Link
            to="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/upload') ? 'bg-brand-teal text-white' : 'text-brand-dark hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('nav.newRetinalScan', 'New Retinal Scan')}
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/dashboard') ? 'bg-brand-teal text-white' : 'text-brand-dark hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t('nav.screeningDashboard', 'Screening Dashboard')}
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('nav.logout', 'Logout')}
          </button>
        </div>
      )}
    </header>
  );
}
