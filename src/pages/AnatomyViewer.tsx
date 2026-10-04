import React, { useState } from 'react';
import { PatientData, CardiacRiskResult } from '../types/cardiac';
import { ThreeDAnatomy } from '../components/ThreeDAnatomy';
import { 
  Heart, 
  Layers, 
  Activity, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface AnatomyViewerProps {
  currentPatient: PatientData;
  result: CardiacRiskResult;
}

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  currentPatient,
  result,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('coronary');
  const [testHeartRate, setTestHeartRate] = useState<number>(currentPatient.restingHeartRate);

  const regionInfoMap: Record<string, {
    title: string;
    risk: string;
    riskClass: string;
    description: string;
    vessels: string[];
    mechanisms: string[];
  }> = {
    coronary: {
      title: 'Coronary Arteries (LAD, LCx & RCA)',
      risk: result.cadRisk >= 55 ? 'HIGH RISK' : result.cadRisk >= 25 ? 'MODERATE RISK' : 'LOW RISK',
      riskClass: result.cadRisk >= 55 ? 'text-rose-400 bg-rose-500/20 border-rose-500/30' : result.cadRisk >= 25 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'The Left Anterior Descending (LAD) and Right Coronary Artery (RCA) provide vital perfusion to active myocardial tissues.',
      vessels: ['Left Anterior Descending (LAD)', 'Left Circumflex (LCx)', 'Right Coronary Artery (RCA)', 'Diagonal Branches'],
      mechanisms: [
        'Atherosclerotic lipid accumulation in subendothelial intima',
        'Endothelial shear stress from elevated systolic pressure',
        'Platelet hyper-reactivity potentiated by nicotine and combustion hydrocarbons',
      ],
    },
    aorta: {
      title: 'Ascending Aorta & Aortic Arch',
      risk: currentPatient.systolicBp >= 140 ? 'ELEVATED SHEAR' : 'NORMAL COMPLIANCE',
      riskClass: currentPatient.systolicBp >= 140 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'The aorta buffers ventricular ejection pulses through the Windkessel effect. Prolonged systolic hypertension stiffens aortic elastic lamellae.',
      vessels: ['Ascending Aorta', 'Brachiocephalic Artery', 'Left Common Carotid', 'Left Subclavian', 'Descending Thoracic Aorta'],
      mechanisms: [
        'Elevated pulse wave velocity due to arterial elastance loss',
        'Increased left ventricular afterload causing compensatory concentric remodeling',
      ],
    },
    myocardium: {
      title: 'Ventricular Myocardium',
      risk: `${result.overallRisk} RISK`,
      riskClass: result.overallRisk === 'HIGH' || result.overallRisk === 'CRITICAL' ? 'text-rose-400 bg-rose-500/20 border-rose-500/30' : 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
      description: 'Cardiac myocytes contract rhythmically under calcium-mediated excitation-contraction coupling.',
      vessels: ['Left Ventricular Free Wall', 'Interventricular Septum', 'Apex', 'Right Ventricle'],
      mechanisms: [
        'Vulnerability to oxygen demand-supply mismatch during physical or hemodynamic stress',
        'Microvascular perfusion reserves depend on diastolic filling time',
      ],
    },
    pulmonary: {
      title: 'Pulmonary Arterial Circulation',
      risk: 'LOW RESISTANCE',
      riskClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'Carries right ventricular stroke volume to alveolar capillary networks for gas exchange.',
      vessels: ['Pulmonary Trunk', 'Right Pulmonary Artery', 'Left Pulmonary Artery'],
      mechanisms: [
        'Low-pressure vascular circuit sensitive to pulmonary parenchymal health and aerobic capacity',
      ],
    },
  };

  const activeInfo = regionInfoMap[selectedRegion] || regionInfoMap.coronary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Spatial Anatomical Intelligence
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">3D CARDIOVASCULAR ANATOMY LAB</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Inspect the high-fidelity procedural cardiac model, visualize arterial hotspots, and correlate spatial anatomy with multi-factor risk scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Heart Rate Sync</span>
              <span className="font-bold text-white font-mono text-sm">{testHeartRate} BPM</span>
            </div>
            <input
              type="range"
              min="50"
              max="130"
              value={testHeartRate}
              onChange={(e) => setTestHeartRate(Number(e.target.value))}
              className="accent-cyan-400 w-24 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main 3D Canvas + Region Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 3D Model Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <ThreeDAnatomy
            riskScore={result.cadRisk}
            riskCategory={result.overallRisk}
            restingHeartRate={testHeartRate}
            compact={false}
            selectedAnatomicalRegion={selectedRegion}
            onSelectRegion={(reg) => setSelectedRegion(reg)}
          />

          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Quick Region Filter:</span>
              {(['coronary', 'myocardium', 'aorta', 'pulmonary'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    selectedRegion === reg
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Rotate: Click + Drag | Zoom: Scroll | Pan: Right-Click
            </span>
          </div>
        </div>

        {/* Region Clinical Detail Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Focused Anatomical Structure
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeInfo.title}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeInfo.riskClass}`}>
                {activeInfo.risk}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">Functional Description</span>
              <p className="text-xs text-slate-400 leading-relaxed">{activeInfo.description}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">Constituent Structures</span>
              <div className="flex flex-wrap gap-1.5">
                {activeInfo.vessels.map((v, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">Model-Associated Mechanisms</span>
              <div className="space-y-1.5">
                {activeInfo.mechanisms.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Visualization Legend */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              VISUAL CODING SYSTEM
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/50" />
                  <span className="text-slate-300 font-medium">Cyan / Emerald Glow</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">&lt; 25% Low Risk</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
                  <span className="text-slate-300 font-medium">Amber / Orange Glow</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold">25 - 55% Moderate</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
                  <span className="text-slate-300 font-medium">Crimson / Red Glow</span>
                </div>
                <span className="text-[11px] text-rose-400 font-bold">&gt; 55% High / Critical</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 pt-1 leading-normal italic">
              Pulsing speed corresponds dynamically to real resting heart rate telemetry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
