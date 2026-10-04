import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Eye, 
  Brain, 
  Sliders, 
  ShieldAlert, 
  Award, 
  Cpu, 
  FileCode, 
  Stethoscope 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-cyan-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon Intelligence Demonstration
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ABOUT CARDIOSYNEX AI
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CardioSynex AI bridges the chasm between raw statistical risk calculators and patient comprehension. Instead of delivering a static percentage, it generates an explainable, 3D anatomical narrative empowering exploratory health literacy.
          </p>
          <div className="pt-2">
            <blockquote className="border-l-2 border-cyan-400 pl-3 italic text-cyan-200 text-sm font-medium">
              “Don't just predict cardiac risk. Show where the risk is, explain why it exists, and let users explore how changing health factors could alter the predicted risk.”
            </blockquote>
          </div>
        </div>
      </div>

      {/* WHY CARDIOSYNEX? (Section 21) */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-2xl font-black text-white tracking-tight">WHY CARDIOSYNEX?</h3>
          <p className="text-xs text-slate-400">
            From an opaque risk number to an interactive, explainable 3D risk story.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: SEE */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">1. SEE</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Visualize cardiovascular risk on an interactive 3D anatomical model. Inspect the coronary arterial tree, great vessels, and observe live rhythmic pulsation calibrated to cardiac telemetry.
            </p>
          </div>

          {/* Card 2: UNDERSTAND */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">2. UNDERSTAND</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Discover which biomarkers contribute most to the predicted risk through ranked feature attribution and natural-language educational narratives powered by Gemini 3.8 Flash.
            </p>
          </div>

          {/* Card 3: EXPLORE */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Sliders className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">3. EXPLORE</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modify health parameters dynamically and compare predicted outcomes using the What-If Risk Simulator, immediately viewing the 3D twin reflect risk attenuation in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          TECHNICAL STACK & ARCHITECTURE
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-mono block">Frontend Runtime</span>
            <strong className="text-white">React 19 + TypeScript</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-mono block">3D Graphics Engine</span>
            <strong className="text-white">Three.js + Shaders</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-mono block">Explainable AI</span>
            <strong className="text-white">Gemini 3.8 Flash SDK</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-mono block">Fullstack Server</span>
            <strong className="text-white">Express + Vite Middleware</strong>
          </div>
        </div>
      </div>

      {/* Prominent Safety & Research Disclaimer (Section 25) */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <h4 className="text-sm font-bold uppercase tracking-wider">
            MANDATORY MEDICAL SAFETY & RESEARCH DISCLAIMER
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          CardioSynex AI is a hackathon prototype, educational research demonstration, and proof-of-concept. It does <strong>not</strong> constitute medical advice, clinical diagnosis, patient management guidance, or pharmacological prescription.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Calculations are generated via client-side heuristic algorithmic weighting inspired by pooled cohort cardiovascular equations and are intended solely to demonstrate explainable AI principles and interactive 3D spatial health communication. Users experiencing chest discomfort, shortness of breath, or cardiac symptoms must immediately contact certified medical emergency services or their qualified personal physician.
        </p>
      </div>
    </div>
  );
};
