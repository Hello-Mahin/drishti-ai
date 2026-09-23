import React from 'react';

export const STAGE_CONFIGS = {
  'No DR': {
    label: 'No DR',
    subtext: 'Normal Retina',
    color: '#16A34A',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    ringColor: '#16A34A',
    severityIndex: 0,
    actionNeeded: 'Routine annual re-screening recommended.',
  },
  'Mild': {
    label: 'Mild',
    subtext: 'Microaneurysms Only',
    color: '#84CC16',
    textColor: 'text-lime-800',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    dotColor: 'bg-lime-500',
    ringColor: '#84CC16',
    severityIndex: 1,
    actionNeeded: 'Follow-up screening in 6–9 months. Glycemic monitoring.',
  },
  'Moderate': {
    label: 'Moderate',
    subtext: 'More than microaneurysms',
    color: '#F97316',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    dotColor: 'bg-orange-500',
    ringColor: '#F97316',
    severityIndex: 2,
    actionNeeded: 'Refer to District Hospital Ophthalmologist within 4–6 weeks.',
  },
  'Severe': {
    label: 'Severe',
    subtext: '4-2-1 Rule Met',
    color: '#EF4444',
    textColor: 'text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
    ringColor: '#EF4444',
    severityIndex: 3,
    actionNeeded: 'Urgent Ophthalmology referral within 1–2 weeks. High risk of vision loss.',
  },
  'Proliferative': {
    label: 'Proliferative',
    subtext: 'Neovascularization / Vitreous Hemorrhage',
    color: '#991B1B',
    textColor: 'text-rose-950',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-400',
    dotColor: 'bg-rose-700',
    ringColor: '#991B1B',
    severityIndex: 4,
    actionNeeded: 'CRITICAL: Immediate specialist intervention required (Panretinal Photocoagulation / Anti-VEGF).',
  },
};

export default function StageBadge({ stage = 'No DR', size = 'md', showUrgent = true, className = '' }) {
  const config = STAGE_CONFIGS[stage] || STAGE_CONFIGS['No DR'];
  const isProliferative = stage === 'Proliferative';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-semibold',
    md: 'text-sm px-3 py-1 font-semibold',
    lg: 'text-base px-4 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border shadow-sm ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} flex-shrink-0`} />
      <span>{config.label}</span>
      {isProliferative && showUrgent && (
        <span className="ml-1 text-[11px] font-extrabold uppercase tracking-wider bg-rose-700 text-white px-2 py-0.5 rounded-full animate-pulseSubtle">
          URGENT
        </span>
      )}
    </span>
  );
}
