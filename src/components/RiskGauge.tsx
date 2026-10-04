import React from 'react';
import { RiskCategory } from '../types/cardiac';
import { ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 - 100
  category: RiskCategory;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  category,
  confidence = 88,
  size = 'md',
}) => {
  const [animatedScore, setAnimatedScore] = React.useState<number>(score);

  React.useEffect(() => {
    let start = animatedScore;
    const end = Math.min(100, Math.max(0, score));
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const cur = Math.round(start + (end - start) * progress);
      setAnimatedScore(cur);
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, [score]);

  // SVG semi-circle gauge calculations
  const radius = 90;
  const strokeWidth = 14;
  const normalizedScore = animatedScore;

  // Circumference of 240-degree arc
  const arcLength = (240 / 360) * (2 * Math.PI * radius);
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  const getThemeColor = () => {
    switch (category) {
      case 'CRITICAL':
        return {
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: AlertOctagon,
        };
      case 'HIGH':
        return {
          stroke: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.4)',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: ShieldAlert,
        };
      case 'MODERATE':
        return {
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.35)',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
        };
      case 'LOW':
      default:
        return {
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.35)',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: CheckCircle2,
        };
    }
  };

  const theme = getThemeColor();
  const IconComponent = theme.icon;

  const sizeDimensions = {
    sm: { width: 180, height: 150, text: 'text-3xl' },
    md: { width: 240, height: 200, text: 'text-5xl' },
    lg: { width: 300, height: 250, text: 'text-6xl' },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative flex items-center justify-center" style={{ width: sizeDimensions.width, height: sizeDimensions.height }}>
        <svg
          viewBox="0 0 240 200"
          className="w-full h-full transform -rotate-10"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={theme.stroke} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 35 165 A 90 90 0 1 1 205 165"
            fill="none"
            stroke="rgba(30, 41, 59, 0.7)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Calibrated Tick Marks */}
          <circle cx="35" cy="165" r="3" fill="#10b981" />
          <circle cx="120" cy="30" r="3" fill="#f59e0b" />
          <circle cx="205" cy="165" r="3" fill="#ef4444" />

          {/* Active Risk Score Arc */}
          <path
            d="M 35 165 A 90 90 0 1 1 205 165"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center pointer-events-none">
          <div className="flex items-baseline justify-center">
            <span className={`${sizeDimensions.text} font-black tracking-tight text-white transition-all duration-700`}>
              {normalizedScore}
            </span>
            <span className="text-xl font-bold text-slate-400 ml-1">%</span>
          </div>

          <div className={`mt-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-1.5 shadow-sm ${theme.badge}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {category} RISK
          </div>

          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Model Confidence: {confidence}%*
          </span>
        </div>
      </div>

      {/* Baseline Range Legend */}
      <div className="w-full max-w-[220px] flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 -mt-2">
        <span className="text-emerald-400">0% (Low)</span>
        <span className="text-amber-400">50%</span>
        <span className="text-rose-400">100% (High)</span>
      </div>
    </div>
  );
};
