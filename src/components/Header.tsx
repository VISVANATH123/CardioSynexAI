import React, { useEffect, useState } from 'react';
import { PatientData, CardiacRiskResult } from '../types/cardiac';
import { DEMO_PATIENTS } from '../data/demoPatients';
import { 
  Heart, 
  Activity, 
  User, 
  ChevronDown, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  currentPatient: PatientData;
  result: CardiacRiskResult;
  onSelectPatient: (patientId: string) => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  result,
  onSelectPatient,
  onNavigate,
}) => {
  // Smooth animated count for risk score
  const [displayScore, setDisplayScore] = useState<number>(result.cadRisk);

  useEffect(() => {
    let start = displayScore;
    const end = result.cadRisk;
    if (start === end) return;
    
    const duration = 400; // ms
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [result.cadRisk]);

  const riskBadgeClass =
    result.overallRisk === 'CRITICAL' || result.overallRisk === 'HIGH'
      ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
      : result.overallRisk === 'MODERATE'
      ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080F1E]/90 backdrop-blur-xl border-b border-cyan-500/15 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition duration-200">
            <div className="w-full h-full bg-[#070e1c] rounded-[10px] flex items-center justify-center">
              <Heart className="w-4 h-4 text-cyan-400 group-hover:text-rose-400 transition" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-sans">
                CARDIOSYNEX<span className="text-cyan-400 ml-0.5">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block leading-tight font-medium">
              Explainable Cardiovascular Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Center Status Indicator */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-semibold tracking-wide text-[11px]">AI ENGINE ONLINE</span>
        <span className="text-slate-700">|</span>
        <span className="text-cyan-400 font-mono text-[10px]">v2.4 RESEARCH</span>
      </div>

      {/* Right Controls: Compact Patient Selector & Visual CAD Risk Indicator */}
      <div className="flex items-center gap-3">
        {/* Compact Patient Selector */}
        <div className="relative flex items-center bg-[#0B1220] hover:bg-[#0F1728] border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl px-3 py-1.5 transition text-xs shadow-sm">
          <User className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
          <div className="flex flex-col text-left">
            <select
              value={currentPatient.id}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {DEMO_PATIENTS.map(dp => {
                const sub = dp.id.includes('low') ? 'Low Risk Profile' : dp.id.includes('mod') ? 'Moderate Risk Profile' : dp.id.includes('crit') ? 'Critical Profile' : 'High Risk Profile';
                return (
                  <option key={dp.id} value={dp.id} className="bg-[#0B1220] text-slate-200">
                    {dp.name.split(' (')[0]} — {sub}
                  </option>
                );
              })}
            </select>
            <span className="text-[10px] text-slate-400 font-medium">
              {currentPatient.id.includes('low') ? 'Low Risk Profile' : currentPatient.id.includes('mod') ? 'Moderate Risk Profile' : currentPatient.id.includes('crit') ? 'Critical Risk Profile' : 'High Risk Profile'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 pointer-events-none" />
        </div>

        {/* Visually Stronger CAD Risk Indicator */}
        <div 
          onClick={() => onNavigate('simulator')}
          className={`cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition shadow-sm hover:scale-[1.02] active:scale-[0.98] ${riskBadgeClass}`}
          title="Click to launch What-If Simulator"
        >
          <Heart className="w-4 h-4 text-current animate-pulse" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">CAD RISK</span>
            <span className="text-base font-black font-mono tracking-tight text-white mt-0.5">
              {displayScore}%
            </span>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/30 border border-current/20">
            {result.overallRisk}
          </span>
        </div>
      </div>
    </header>
  );
};
