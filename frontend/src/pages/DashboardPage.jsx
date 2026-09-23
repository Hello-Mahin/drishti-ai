import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StageBadge from '../components/StageBadge';
import { useLanguage } from '../context/LanguageContext';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { generateFundusImage, generateGradCAMHeatmap } from '../lib/sampleFundusData';

// 5 Realistic Base Mock Rows as required
const INITIAL_MOCK_ROWS = [
  {
    id: 'mock-1',
    patientId: 'MH-STR-2026-0041',
    patientName: 'Rameshwar Patil',
    patientAge: 48,
    drStage: 'No DR',
    confidence: 96.4,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reportText: 'Clean retinal vasculature, optic disc margins intact, normal foveal avascular zone. Routine annual screening recommended.',
  },
  {
    id: 'mock-2',
    patientId: 'MH-STR-2026-0078',
    patientName: 'Kamala Bai Deshmukh',
    patientAge: 54,
    drStage: 'Mild',
    confidence: 88.2,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    reportText: 'Isolated microaneurysms detected in temporal quadrant. No macular edema. Scheduled re-screening in 6–9 months.',
  },
  {
    id: 'mock-3',
    patientId: 'MH-STR-2026-0112',
    patientName: 'Anand Rao Shinde',
    patientAge: 61,
    drStage: 'Moderate',
    confidence: 89.5,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    reportText: 'Scattered blot hemorrhages and hard lipid exudates near macula. Referral to District Hospital Ophthalmologist within 4–6 weeks.',
  },
  {
    id: 'mock-4',
    patientId: 'MH-STR-2026-0164',
    patientName: 'Sunita Devi More',
    patientAge: 67,
    drStage: 'Severe',
    confidence: 92.1,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reportText: 'Severe 4-quadrant intraretinal hemorrhages and venous beading. Urgent ophthalmology consultation within 1–2 weeks required.',
  },
  {
    id: 'mock-5',
    patientId: 'MH-STR-2026-0205',
    patientName: 'Bapu Rao Jadhav',
    patientAge: 72,
    drStage: 'Proliferative',
    confidence: 94.8,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    reportText: 'CRITICAL: Neovascularization at the disc with vitreous hemorrhage threat. Immediate specialist laser photocoagulation recommended.',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [stageFilter, setStageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Animated counts
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedUrgent, setAnimatedUrgent] = useState(0);
  const [animatedClear, setAnimatedClear] = useState(0);

  // Load screenings (from Firestore real-time listener OR fallback local/mock rows)
  useEffect(() => {
    let unsubscribe = null;

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'screenings'), orderBy('createdAt', 'desc'), limit(100));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const firestoreRows = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                patientId: data.patientId || 'MH-UNKNOWN',
                patientName: data.patientName || 'Anonymous',
                patientAge: data.patientAge || 50,
                drStage: data.drStage || 'No DR',
                confidence: Number(data.confidence) || 85,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                reportText: data.reportText || '',
              };
            });

            if (firestoreRows.length > 0) {
              setScreenings(firestoreRows);
            } else {
              // Merge local screenings if Firestore collection is initially empty
              loadLocalFallback();
            }
            setLoading(false);
          },
          (err) => {
            console.warn('Firestore snapshot error, using local mock state:', err);
            loadLocalFallback();
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn('Failed to listen to Firestore:', err);
        loadLocalFallback();
        setLoading(false);
      }
    } else {
      loadLocalFallback();
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadLocalFallback = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('drishti_screenings_registry') || '[]');
      // Combine newly completed scans with the 5 realistic mock baseline rows
      const combined = [...saved, ...INITIAL_MOCK_ROWS.filter((m) => !saved.some((s) => s.patientId === m.patientId))];
      setScreenings(combined);
    } catch {
      setScreenings(INITIAL_MOCK_ROWS);
    }
  };

  // Compute stats
  const totalCount = screenings.length;
  const urgentCount = screenings.filter((s) => s.drStage === 'Severe' || s.drStage === 'Proliferative').length;
  const clearCount = screenings.filter((s) => s.drStage === 'No DR').length;

  // Animate statistics (0 -> actual number)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedTotal(totalCount);
      setAnimatedUrgent(urgentCount);
      setAnimatedClear(clearCount);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();
    let frameId;

    const animateCounts = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedTotal(Math.round(ease * totalCount));
      setAnimatedUrgent(Math.round(ease * urgentCount));
      setAnimatedClear(Math.round(ease * clearCount));

      if (progress < 1) {
        frameId = requestAnimationFrame(animateCounts);
      }
    };

    frameId = requestAnimationFrame(animateCounts);
    return () => cancelAnimationFrame(frameId);
  }, [totalCount, urgentCount, clearCount]);

  // Filtered rows
  const filteredScreenings = screenings.filter((row) => {
    const matchesStage = stageFilter === 'All' || row.drStage.toLowerCase() === stageFilter.toLowerCase();
    const matchesSearch =
      row.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  // Action: View Details
  const handleViewDetails = (row) => {
    const fundusImg = row.original_image_url || generateFundusImage(row.drStage);
    const heatmapImg = row.heatmap_base64 || generateGradCAMHeatmap(fundusImg, row.drStage);

    const fullResult = {
      patient_id: row.patientId,
      patient_name: row.patientName,
      patient_age: row.patientAge,
      dr_stage: row.drStage,
      confidence: row.confidence,
      report_text: row.reportText,
      original_image_url: fundusImg,
      heatmap_base64: heatmapImg,
      created_at: row.createdAt,
    };

    sessionStorage.setItem('drishti_latest_result', JSON.stringify(fullResult));
    navigate('/result', { state: { resultData: fullResult } });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeUp">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
              {t('hero.mission', 'Population Health Surveillance')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-dark tracking-tight">
              {t('dash.title', 'Rural Screening Registry')}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t('dash.subtitle', 'Real-time monitoring of diabetic retinopathy prevalence across village sub-centres.')}
            </p>
          </div>

          <button
            onClick={() => navigate('/upload')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-brand-teal/20 flex items-center gap-2 transform active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('result.newScan', 'Conduct New Screening')}</span>
          </button>
        </div>

        {/* Animated Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fadeUp animate-delay-100">
          {/* Total Screenings */}
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                {t('dash.totalScreened', 'Total Screenings')}
              </span>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-brand-dark mt-1">
                {animatedTotal}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Logged across community drives
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-tealLight text-brand-teal flex items-center justify-center font-bold text-xl">
              👁
            </div>
          </div>

          {/* Cases Needing Urgent Care (Severe + Proliferative) */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  {t('dash.referrals', 'Urgent Care Needed')}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              </div>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-rose-700 mt-1">
                {animatedUrgent}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Severe & Proliferative DR cases
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
              ⚠
            </div>
          </div>

          {/* Clear Cases (No DR) */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {t('dash.noDrCount', 'Clear Cases')}
              </span>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-700 mt-1">
                {animatedClear}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                No diabetic retinopathy detected
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
          </div>
        </div>

        {/* Screening Table Container */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden animate-fadeUp animate-delay-200">
          {/* Table Controls (Search & Filter) */}
          <div className="p-5 border-b border-brand-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-display font-bold text-brand-dark">
                {t('dash.recentRecords', 'Recent Patient Screenings')}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredScreenings.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dash.searchPlaceholder', 'Search patient name or ID…')}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Stage Filter Dropdown */}
              <div className="w-full sm:w-auto">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-dark bg-white focus:outline-none focus:border-brand-teal transition-all cursor-pointer"
                >
                  <option value="All">All Stages</option>
                  <option value="No DR">No DR</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Proliferative">Proliferative</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border/60 bg-brand-bg/60 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  <th className="py-3 px-4 sm:px-6">{t('dash.colDate', 'Date')}</th>
                  <th className="py-3 px-4 sm:px-6">{t('upload.patientId', 'Patient ID')}</th>
                  <th className="py-3 px-4 sm:px-6">{t('dash.colPatient', 'Patient Name')}</th>
                  <th className="py-3 px-4 sm:px-6">{t('dash.colStage', 'DR Stage')}</th>
                  <th className="py-3 px-4 sm:px-6 text-right">{t('dash.colActions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                      Loading screening registry…
                    </td>
                  </tr>
                ) : filteredScreenings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                      {t('dash.noRecords', 'No matching patient screening records found.')}
                    </td>
                  </tr>
                ) : (
                  filteredScreenings.map((row) => {
                    const rowDate = new Date(row.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr
                        key={row.id || row.patientId}
                        className="hover:bg-brand-tealLight/20 transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-medium whitespace-nowrap">
                          {rowDate}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-brand-teal whitespace-nowrap">
                          {row.patientId}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-brand-dark whitespace-nowrap">
                          {row.patientName}{' '}
                          <span className="text-[11px] font-normal text-slate-400">
                            ({row.patientAge}y)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          <StageBadge stage={row.drStage} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(row)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-teal hover:bg-brand-teal hover:text-white border border-brand-teal/30 transition-all shadow-2xs cursor-pointer"
                          >
                            {t('dash.viewReport', 'View Details')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
