import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Activity, 
  Sliders, 
  BarChart2, 
  History, 
  Info, 
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { RiskCategory } from '../types/cardiac';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cadRisk: number;
  riskCategory: RiskCategory;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  cadRisk,
  riskCategory,
}) => {
  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { id: 'assessment', label: 'Risk Assessment', icon: ClipboardCheck, badge: 'Intake' },
        { id: 'anatomy', label: '3D Anatomy', icon: Activity, badge: 'Spatial' },
        { id: 'simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Live' },
        { id: 'factors', label: 'Risk Factors', icon: BarChart2, badge: null },
      ],
    },
    {
      title: 'DATA',
      items: [
        { id: 'history', label: 'History', icon: History, badge: null },
      ],
    },
    {
      title: 'INFO',
      items: [
        { id: 'about', label: 'About & Disclaimer', icon: Info, badge: null },
      ],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 hidden md:flex flex-col justify-between bg-[#080F1E]/95 backdrop-blur-xl border-r border-cyan-500/15 p-3.5 min-h-[calc(100vh-62px)] select-none">
      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5 block">
              {sec.title}
            </span>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-sm shadow-cyan-500/5 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Live Patient Quick Telemetry Widget */}
        <div className="p-3.5 rounded-2xl bg-[#0B1220] border border-cyan-500/15 space-y-2 mt-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Assessment
            </span>
            <span className={`w-2 h-2 rounded-full ${
              riskCategory === 'CRITICAL' || riskCategory === 'HIGH' ? 'bg-rose-500 animate-ping' : riskCategory === 'MODERATE' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-medium">CAD Risk</span>
            <span className="text-xl font-black text-white font-mono">{cadRisk}%</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                cadRisk >= 55 ? 'bg-rose-500' : cadRisk >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${cadRisk}%` }}
            />
          </div>

          <button
            onClick={() => onNavigate('simulator')}
            className="w-full py-1.5 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 rounded-lg border border-cyan-500/30 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Simulate What-If</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hackathon Demo Platform</span>
        </div>
        <p className="leading-tight">Deterministic Heuristic Engine + Gemini 3.8 Flash</p>
      </div>
    </aside>
  );
};
