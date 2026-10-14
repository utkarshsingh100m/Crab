import React from 'react';
import { cn } from '../../lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { outer: 48, inner: 36, stroke: 5, fontSize: 'text-xs', labelSize: 'text-[10px]' },
  md: { outer: 64, inner: 50, stroke: 6, fontSize: 'text-sm', labelSize: 'text-[10px]' },
  lg: { outer: 88, inner: 70, stroke: 8, fontSize: 'text-lg', labelSize: 'text-xs' },
  xl: { outer: 120, inner: 96, stroke: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
};

function getScoreGradient(score: number) {
  if (score >= 80) return { stroke: '#22c55e', text: 'text-green-600' };
  if (score >= 60) return { stroke: '#2563EB', text: 'text-electric-600' };
  if (score >= 40) return { stroke: '#f59e0b', text: 'text-amber-600' };
  return { stroke: '#ef4444', text: 'text-red-500' };
}

export function ScoreRing({ score, size = 'md', showLabel = true, className }: ScoreRingProps) {
  const config = sizeConfig[size];
  const { stroke, text } = getScoreGradient(score);
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = config.outer / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        role="img"
        aria-label={`Profile score: ${score} out of 100`}
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={config.stroke}
        />
        {/* Score ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={config.stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', config.fontSize, text)}>
          {score}
        </span>
        {showLabel && (
          <span className={cn('text-slate-400 font-medium leading-none mt-0.5', config.labelSize)}>
            /100
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  description?: string;
}

export function ScoreBar({ label, value, max, description }: ScoreBarProps) {
  const percentage = (value / max) * 100;
  const { stroke } = getScoreGradient(percentage);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-600">{value}/{max}</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: stroke }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${value} of ${max}`}
        />
      </div>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}
