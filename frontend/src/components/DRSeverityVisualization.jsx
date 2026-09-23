import React from 'react';
import { STAGE_CONFIGS } from './StageBadge';

const STAGES_LIST = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];

export default function DRSeverityVisualization({ currentStage = 'No DR', className = '' }) {
  return (
    <div className={`p-4 bg-white rounded-2xl border border-brand-border/80 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
          Diabetic Retinopathy Severity Scale
        </span>
        <span className="text-[11px] font-medium text-brand-muted">
          ICDR Classification
        </span>
      </div>

      {/* 5-stage compact track */}
      <div className="space-y-1.5">
        {STAGES_LIST.map((stageName, index) => {
          const config = STAGE_CONFIGS[stageName];
          const isActive = currentStage === stageName;

          return (
            <div
              key={stageName}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? `${config.bgColor} border border-current shadow-sm`
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
              style={{
                borderColor: isActive ? config.color : 'transparent',
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Stage number & status indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isActive ? 'text-white' : 'text-slate-400 bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? config.color : undefined,
                  }}
                >
                  {index}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-brand-dark' : 'text-slate-600'
                    }`}
                  >
                    {config.label}
                  </span>
                  <span className="text-[10px] text-brand-muted leading-tight">
                    {config.subtext}
                  </span>
                </div>
              </div>

              {/* Active Indicator Pin */}
              {isActive && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: config.color }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: config.color }}
                    />
                  </span>
                  <span
                    className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    Detected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidance summary box */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <p className="text-[11px] text-brand-muted leading-relaxed">
          <span className="font-semibold text-brand-dark">Clinical Recommendation: </span>
          {STAGE_CONFIGS[currentStage]?.actionNeeded || 'Standard observation.'}
        </p>
      </div>
    </div>
  );
}
