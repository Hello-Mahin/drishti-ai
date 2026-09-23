import React, { useState, useEffect } from 'react';
import { STAGE_CONFIGS } from './StageBadge';

export default function ConfidenceRing({ stage = 'No DR', confidence = 0, size = 180 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [strokeOffset, setStrokeOffset] = useState(414.7); // initial full offset

  const targetConfidence = Math.min(Math.max(Number(confidence) || 0, 0), 100);
  const stageConfig = STAGE_CONFIGS[stage] || STAGE_CONFIGS['No DR'];

  const radius = 66;
  const circumference = 2 * Math.PI * radius; // ~414.69

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedValue(targetConfidence);
      const targetOffset = circumference - (targetConfidence / 100) * circumference;
      setStrokeOffset(targetOffset);
      return;
    }

    const duration = 1500; // 1.5 seconds animation
    const startTime = performance.now();

    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeOut * targetConfidence);
      setAnimatedValue(currentVal);

      const targetOffset = circumference - ((easeOut * targetConfidence) / 100) * circumference;
      setStrokeOffset(targetOffset);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetConfidence, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-brand-border/80 shadow-sm">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 160 160">
          {/* Background track circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="10"
            fill="transparent"
            className="opacity-40"
          />
          {/* Animated progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={stageConfig.ringColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-brand-muted">
            DR Stage
          </span>
          <span
            className="text-lg sm:text-xl font-display font-extrabold tracking-tight mt-0.5"
            style={{ color: stageConfig.color }}
          >
            {stageConfig.label}
          </span>
          
          <div className="w-8 h-[1px] bg-slate-200 my-1"></div>

          <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">
            Confidence
          </span>
          <span className="text-xl sm:text-2xl font-display font-bold text-brand-dark">
            {animatedValue}%
          </span>
        </div>
      </div>
      
      {/* Short clinical subtext */}
      <span className="mt-2 text-xs font-medium text-brand-muted text-center max-w-[200px]">
        {stageConfig.subtext}
      </span>
    </div>
  );
}
