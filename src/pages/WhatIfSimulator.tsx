import React, { useState, useMemo, useEffect } from 'react';
import { PatientData, CardiacRiskResult, ContributingFactor } from '../types/cardiac';
import { calculateCardiacRisk, calculateBmi } from '../utils/calculations';
import { ThreeDAnatomy } from '../components/ThreeDAnatomy';
import { 
  Sliders, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  RotateCcw, 
  Heart, 
  ShieldCheck, 
  AlertTriangle,
  Activity,
  CheckCircle2,
  Info,
  Check,
  Zap,
  ArrowDown,
  ArrowUp,
  Brain,
  HelpCircle,
  Stethoscope
} from 'lucide-react';

interface WhatIfSimulatorProps {
  currentPatient: PatientData;
  currentResult: CardiacRiskResult;
}

type ScenarioType = 'none' | 'bp' | 'lipids' | 'lifestyle' | 'multitarget';

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentPatient,
  currentResult,
}) => {
  // Simulator State: initialized with current patient values
  const [simulatedData, setSimulatedData] = useState<PatientData>({ ...currentPatient });
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('none');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Sync when patient changes
  useEffect(() => {
    setSimulatedData({ ...currentPatient });
    setActiveScenario('none');
  }, [currentPatient]);

  // Calculate live simulated result whenever simulated data changes
  const simulatedResult = useMemo(() => {
    return calculateCardiacRisk(simulatedData);
  }, [simulatedData]);

  // Delta between current and simulated
  const riskDelta = simulatedResult.cadRisk - currentResult.cadRisk;
  const isReduced = riskDelta < 0;

  // Reset to original patient baseline
  const handleReset = () => {
    setSimulatedData({ ...currentPatient });
    setActiveScenario('none');
  };

  // Quick Scenarios with predictable deltas (Section 6)
  const applyScenario = (type: ScenarioType) => {
    setActiveScenario(type);
    if (type === 'bp') {
      setSimulatedData(prev => ({
        ...prev,
        systolicBp: 120,
        diastolicBp: 78,
      }));
    } else if (type === 'lipids') {
      setSimulatedData(prev => ({
        ...prev,
        ldlCholesterol: 85,
        totalCholesterol: Math.max(140, prev.totalCholesterol - 65),
        hdlCholesterol: Math.min(72, prev.hdlCholesterol + 10),
      }));
    } else if (type === 'lifestyle') {
      setSimulatedData(prev => ({
        ...prev,
        smoking: false,
        physicalActivity: 'active',
        weightKg: Math.max(52, Math.round(prev.weightKg * 0.93)),
        systolicBp: Math.max(118, prev.systolicBp - 12),
      }));
    } else if (type === 'multitarget') {
      setSimulatedData(prev => ({
        ...prev,
        systolicBp: 118,
        diastolicBp: 76,
        ldlCholesterol: 80,
        totalCholesterol: 155,
        hdlCholesterol: 58,
        smoking: false,
        bloodGlucose: prev.diabetes ? 110 : 88,
        physicalActivity: 'active',
        weightKg: Math.round(22.2 * Math.pow(prev.heightCm / 100, 2)), // target BMI 22.2
      }));
    }
  };

  const currentBmi = calculateBmi(currentPatient.weightKg, currentPatient.heightCm);
  const simBmi = calculateBmi(simulatedData.weightKg, simulatedData.heightCm);

  // Dynamic natural language statement (Section 12)
  const dynamicModelResponse = useMemo(() => {
    const changes: string[] = [];
    if (simulatedData.systolicBp !== currentPatient.systolicBp) {
      changes.push(`systolic BP ${currentPatient.systolicBp} → ${simulatedData.systolicBp} mmHg`);
    }
    if (simulatedData.ldlCholesterol !== currentPatient.ldlCholesterol) {
      changes.push(`LDL ${currentPatient.ldlCholesterol} → ${simulatedData.ldlCholesterol} mg/dL`);
    }
    if (currentPatient.smoking && !simulatedData.smoking) {
      changes.push(`smoking cessation`);
    }
    if (simBmi.bmi !== currentBmi.bmi) {
      changes.push(`BMI ${currentBmi.bmi} → ${simBmi.bmi}`);
    }
    if (simulatedData.physicalActivity !== currentPatient.physicalActivity) {
      changes.push(`physical activity to ${simulatedData.physicalActivity}`);
    }

    if (changes.length === 0) {
      return "Baseline profile active. Adjust any parameter below to evaluate how clinical modifications alter the model's predicted cardiovascular risk trajectory.";
    }

    if (riskDelta < 0) {
      return `Modifying ${changes.slice(0, 3).join(', ')} decreases the prototype model's predicted CAD risk by approximately ${Math.abs(riskDelta)} percentage points (from ${currentResult.cadRisk}% to ${simulatedResult.cadRisk}%).`;
    } else if (riskDelta > 0) {
      return `Modifying ${changes.slice(0, 3).join(', ')} increases the prototype model's predicted CAD risk by +${riskDelta} percentage points.`;
    }
    return `The current parameter adjustments produce an identical net predicted risk of ${simulatedResult.cadRisk}%.`;
  }, [simulatedData, currentPatient, riskDelta, currentResult.cadRisk, simulatedResult.cadRisk, simBmi.bmi, currentBmi.bmi]);

  // "Why did the model change?" checkmarks (Section 16)
  const changeExplanations = useMemo(() => {
    const items: { label: string; positive: boolean }[] = [];
    if (simulatedData.systolicBp < currentPatient.systolicBp) {
      items.push({ label: `Lower simulated blood pressure (-${currentPatient.systolicBp - simulatedData.systolicBp} mmHg SBP)`, positive: true });
    } else if (simulatedData.systolicBp > currentPatient.systolicBp) {
      items.push({ label: `Elevated systolic blood pressure (+${simulatedData.systolicBp - currentPatient.systolicBp} mmHg)`, positive: false });
    }

    if (simulatedData.ldlCholesterol < currentPatient.ldlCholesterol) {
      items.push({ label: `Reduced atherogenic LDL (-${currentPatient.ldlCholesterol - simulatedData.ldlCholesterol} mg/dL)`, positive: true });
    } else if (simulatedData.ldlCholesterol > currentPatient.ldlCholesterol) {
      items.push({ label: `Higher circulating LDL (+${simulatedData.ldlCholesterol - currentPatient.ldlCholesterol} mg/dL)`, positive: false });
    }

    if (currentPatient.smoking && !simulatedData.smoking) {
      items.push({ label: 'Complete tobacco cessation (attenuates acute endothelial stress)', positive: true });
    } else if (!currentPatient.smoking && simulatedData.smoking) {
      items.push({ label: 'Active smoking status introduced', positive: false });
    }

    if (simBmi.bmi < currentBmi.bmi) {
      items.push({ label: `Reduced adiposity & visceral load (BMI ${simBmi.bmi} vs ${currentBmi.bmi})`, positive: true });
    }

    if (simulatedData.physicalActivity === 'active' && currentPatient.physicalActivity !== 'active') {
      items.push({ label: 'Enhanced aerobic conditioning (≥ 150 min/wk cardioprotective stimulus)', positive: true });
    }

    if (simulatedData.bloodGlucose < currentPatient.bloodGlucose) {
      items.push({ label: `Glycemic control optimization (${simulatedData.bloodGlucose} vs ${currentPatient.bloodGlucose} mg/dL)`, positive: true });
    }

    return items;
  }, [simulatedData, currentPatient, simBmi.bmi, currentBmi.bmi]);

  // Scenario Cards Data (Section 6)
  const scenarioCards = [
    {
      id: 'bp' as ScenarioType,
      title: 'BP CONTROL',
      icon: Heart,
      desc: '120 / 78 mmHg',
      deltaEst: '-8 to -15 pts',
      color: 'text-rose-400',
    },
    {
      id: 'lipids' as ScenarioType,
      title: 'LIPID TARGET',
      icon: Zap,
      desc: 'LDL → 85 mg/dL',
      deltaEst: '-6 to -12 pts',
      color: 'text-cyan-400',
    },
    {
      id: 'lifestyle' as ScenarioType,
      title: 'LIFESTYLE & SMOKING',
      icon: ShieldCheck,
      desc: 'Cessation + Aerobic',
      deltaEst: '-10 to -18 pts',
      color: 'text-emerald-400',
    },
    {
      id: 'multitarget' as ScenarioType,
      title: 'MULTI-FACTOR TARGET',
      icon: Sparkles,
      desc: 'Combined Optimal',
      deltaEst: 'Max Reduction',
      color: 'text-amber-400',
    },
  ];

  // Simulation Trajectory Steps (Section 15)
  const trajectorySteps = [
    { label: 'BASELINE', score: currentResult.cadRisk, active: simulatedResult.cadRisk === currentResult.cadRisk },
    { label: 'BP CONTROL', score: Math.max(10, currentResult.cadRisk - 12), active: activeScenario === 'bp' },
    { label: 'LIPID TARGET', score: Math.max(10, currentResult.cadRisk - 18), active: activeScenario === 'lipids' },
    { label: 'MULTI-FACTOR', score: Math.max(8, currentResult.cadRisk - 30), active: activeScenario === 'multitarget' },
  ];

  // Tooltip descriptions for parameters (Section 22)
  const tooltips: Record<string, string> = {
    sbp: 'Systolic Blood Pressure (mmHg): Peak arterial pressure during left ventricular contraction. SBP > 130 mmHg increases vascular shear stress.',
    dbp: 'Diastolic Blood Pressure (mmHg): Minimum resting pressure in arteries during cardiac ventricular relaxation. Target is < 80 mmHg.',
    ldl: 'Low-Density Lipoprotein Cholesterol (mg/dL): Primary atherogenic lipoprotein contributing directly to arterial intimal plaque formation.',
    hdl: 'High-Density Lipoprotein Cholesterol (mg/dL): Reverse cholesterol transport particle. Values >= 50 mg/dL offer cardioprotective benefit.',
    bmi: 'Body Mass Index: Weight (kg) / Height (m)². Normal range is 18.5 - 24.9. Visceral adiposity promotes chronic systemic inflammation.',
    hr: 'Resting Heart Rate (bpm): Sustained resting rates > 80 bpm correlate with sympathetic tone and increased cardiovascular workload.',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Compact High-Impact Header (Section 5) */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded">
              INTERACTIVE RISK HYPOTHESIS ENGINE
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LIVE MODEL SIMULATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            WHAT-IF RISK SIMULATOR
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Explore how changes in modifiable health factors influence the model's predicted cardiovascular risk in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B1220] hover:bg-[#0F1728] text-xs font-semibold text-slate-300 border border-slate-700/80 hover:border-slate-500 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Scenario Cards (Section 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarioCards.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => applyScenario(sc.id)}
              className={`p-3.5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between border relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/80 to-[#0B1220] border-cyan-400 shadow-md shadow-cyan-500/10 glow-cyan'
                  : 'bg-[#0B1220]/90 hover:bg-[#0F1728] border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${sc.color}`} />
                  <span className="text-[11px] font-extrabold text-white tracking-tight">
                    {sc.title}
                  </span>
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-300 font-medium">
                {sc.desc}
              </div>
              <div className="text-[10px] text-cyan-400/90 font-mono mt-1 font-semibold">
                Est: {sc.deltaEst}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. HERO RISK COMPARISON CENTERPIECE (Sections 7, 8, 14) */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-cyan-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Current Risk */}
          <div className="flex-1 text-center lg:text-left space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              CURRENT BASELINE
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-1">
              <span className="text-5xl sm:text-6xl font-black text-slate-200 tracking-tight font-mono">
                {currentResult.cadRisk}
              </span>
              <span className="text-2xl font-bold text-slate-500">%</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                currentResult.overallRisk === 'HIGH' || currentResult.overallRisk === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : currentResult.overallRisk === 'MODERATE'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentResult.overallRisk} RISK
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentPatient.name.split(' (')[0]}
              </span>
            </div>
          </div>

          {/* Center Transition & Delta Indicator */}
          <div className="flex flex-col items-center justify-center px-4 space-y-2">
            <div className="hidden sm:flex items-center gap-3 text-slate-600">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-cyan-500/40" />
              <ArrowRight className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-cyan-500/40" />
            </div>

            {/* Large Animated Delta Chip (Section 14) */}
            <div className={`px-4 py-2 rounded-2xl border text-center transition-all duration-300 ${
              isReduced
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                : riskDelta > 0
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/10'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="flex items-center justify-center gap-1">
                {isReduced ? (
                  <ArrowDown className="w-4 h-4 text-emerald-400 stroke-[3]" />
                ) : riskDelta > 0 ? (
                  <ArrowUp className="w-4 h-4 text-rose-400 stroke-[3]" />
                ) : null}
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {riskDelta > 0 ? `+${riskDelta}` : riskDelta} pts
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block mt-0.5">
                {isReduced ? 'LOWER PREDICTED RISK' : riskDelta > 0 ? 'HIGHER PREDICTED RISK' : 'NO NET CHANGE'}
              </span>
            </div>
          </div>

          {/* Simulated Risk */}
          <div className="flex-1 text-center lg:text-right space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              SIMULATED PROFILE
            </span>
            <div className="flex items-baseline justify-center lg:justify-end gap-1">
              <span className={`text-5xl sm:text-6xl font-black tracking-tight font-mono transition-all duration-300 ${
                isReduced ? 'text-cyan-300' : 'text-slate-200'
              }`}>
                {simulatedResult.cadRisk}
              </span>
              <span className="text-2xl font-bold text-cyan-500">%</span>
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                simulatedResult.overallRisk === 'HIGH' || simulatedResult.overallRisk === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : simulatedResult.overallRisk === 'MODERATE'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {simulatedResult.overallRisk} RISK
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                Simulated State
              </span>
            </div>
          </div>
        </div>

        {/* 4. Live Model Response Callout (Section 12) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-3 bg-slate-900/40 p-3 rounded-xl">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0 mt-0.5">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-0.5 font-bold tracking-tight">MODEL RESPONSE:</strong>
            {dynamicModelResponse}
          </div>
        </div>
      </div>

      {/* 5. Main Split: Parameter Controls (Left) vs 3D Heart & Comparison (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameter Sliders (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                PARAMETER CONTROLS
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Live slider calculation</span>
          </div>

          {/* Slider 1: Systolic Blood Pressure */}
          <div className="space-y-1.5 bg-[#0B1220] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-200">Systolic Blood Pressure</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'sbp' ? null : 'sbp')}
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Current: <span className="font-mono text-slate-300">{currentPatient.systolicBp}</span></span>
                <span className="text-cyan-400 font-mono font-black text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {simulatedData.systolicBp} mmHg
                </span>
              </div>
            </div>
            {activeTooltip === 'sbp' && (
              <div className="p-2 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                {tooltips.sbp}
              </div>
            )}
            <input
              type="range"
              min="90"
              max="200"
              value={simulatedData.systolicBp}
              onChange={(e) => setSimulatedData({ ...simulatedData, systolicBp: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>90 (Optimal)</span>
              <span className="text-emerald-400">120 (Target)</span>
              <span className="text-amber-400">140 (Stage 2)</span>
              <span>200</span>
            </div>
          </div>

          {/* Slider 2: Diastolic Blood Pressure */}
          <div className="space-y-1.5 bg-[#0B1220] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-200">Diastolic Blood Pressure</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'dbp' ? null : 'dbp')}
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Current: <span className="font-mono text-slate-300">{currentPatient.diastolicBp}</span></span>
                <span className="text-cyan-400 font-mono font-black text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {simulatedData.diastolicBp} mmHg
                </span>
              </div>
            </div>
            {activeTooltip === 'dbp' && (
              <div className="p-2 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                {tooltips.dbp}
              </div>
            )}
            <input
              type="range"
              min="60"
              max="120"
              value={simulatedData.diastolicBp}
              onChange={(e) => setSimulatedData({ ...simulatedData, diastolicBp: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>60</span>
              <span className="text-emerald-400">80 (Target)</span>
              <span className="text-amber-400">90 (HTN)</span>
              <span>120</span>
            </div>
          </div>

          {/* Slider 3: LDL Cholesterol */}
          <div className="space-y-1.5 bg-[#0B1220] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-200">LDL Cholesterol</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'ldl' ? null : 'ldl')}
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Current: <span className="font-mono text-slate-300">{currentPatient.ldlCholesterol}</span></span>
                <span className="text-cyan-400 font-mono font-black text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {simulatedData.ldlCholesterol} mg/dL
                </span>
              </div>
            </div>
            {activeTooltip === 'ldl' && (
              <div className="p-2 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                {tooltips.ldl}
              </div>
            )}
            <input
              type="range"
              min="50"
              max="240"
              value={simulatedData.ldlCholesterol}
              onChange={(e) => {
                const newLdl = Number(e.target.value);
                const diff = newLdl - simulatedData.ldlCholesterol;
                setSimulatedData({
                  ...simulatedData,
                  ldlCholesterol: newLdl,
                  totalCholesterol: Math.max(120, simulatedData.totalCholesterol + diff),
                });
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className="text-emerald-400">50</span>
              <span className="text-cyan-400">100 (Clinical Target)</span>
              <span className="text-amber-400">160 (High)</span>
              <span>240</span>
            </div>
          </div>

          {/* Slider 4: BMI & Weight */}
          <div className="space-y-1.5 bg-[#0B1220] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-200">Weight & BMI</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'bmi' ? null : 'bmi')}
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Current: <span className="font-mono text-slate-300">{currentBmi.bmi}</span></span>
                <span className="text-cyan-400 font-mono font-black text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {simulatedData.weightKg} kg (BMI {simBmi.bmi})
                </span>
              </div>
            </div>
            {activeTooltip === 'bmi' && (
              <div className="p-2 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                {tooltips.bmi}
              </div>
            )}
            <input
              type="range"
              min="45"
              max="140"
              value={simulatedData.weightKg}
              onChange={(e) => setSimulatedData({ ...simulatedData, weightKg: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>45 kg</span>
              <span className="text-emerald-400">Normal Range ({Math.round(22 * Math.pow(currentPatient.heightCm / 100, 2))} kg)</span>
              <span>140 kg</span>
            </div>
          </div>

          {/* Segmented Toggles: Smoking & Physical Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Smoking Toggle */}
            <div className="p-3 rounded-xl bg-[#0B1220] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Smoking Status</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  simulatedData.smoking ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {simulatedData.smoking ? 'SMOKER' : 'NON-SMOKER'}
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  type="button"
                  onClick={() => setSimulatedData({ ...simulatedData, smoking: false })}
                  className={`flex-1 py-1.5 text-xs font-bold transition cursor-pointer ${
                    !simulatedData.smoking ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedData({ ...simulatedData, smoking: true })}
                  className={`flex-1 py-1.5 text-xs font-bold transition cursor-pointer ${
                    simulatedData.smoking ? 'bg-rose-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  YES
                </button>
              </div>
            </div>

            {/* Physical Activity */}
            <div className="p-3 rounded-xl bg-[#0B1220] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Physical Activity</span>
                <span className="text-[9px] font-black uppercase text-cyan-400 font-mono">
                  {simulatedData.physicalActivity}
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                {(['sedentary', 'moderate', 'active'] as const).map(act => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setSimulatedData({ ...simulatedData, physicalActivity: act })}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase transition cursor-pointer ${
                      simulatedData.physicalActivity === act ? 'bg-cyan-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* "Why did the model change?" (Section 16) */}
          {changeExplanations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>WHY DID THE MODEL CHANGE?</span>
              </div>
              <div className="space-y-1.5">
                {changeExplanations.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.positive ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                    }`}>
                      {item.positive ? '✓' : '↑'}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic pt-1">
                These parameter changes alter the mathematical weighting matrix in this prototype.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Connected 3D Heart Spatial Twin & Before/After Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 3D Heart Visualization connected to the Simulation (Sections 9 & 10) */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 space-y-2 relative">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  3D HEART TWIN (SIMULATION)
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                simulatedResult.overallRisk === 'HIGH' || simulatedResult.overallRisk === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : simulatedResult.overallRisk === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {simulatedResult.overallRisk} GLOW ({simulatedResult.cadRisk}%)
              </span>
            </div>

            {/* Live Three.js Connected Canvas */}
            <ThreeDAnatomy
              compact={true}
              riskScore={simulatedResult.cadRisk}
              riskCategory={simulatedResult.overallRisk}
              restingHeartRate={simulatedData.restingHeartRate}
            />

            <div className="text-[10px] text-slate-400 text-center font-mono leading-tight pt-1">
              MODEL VISUALIZATION — Visualization reflects the prototype model's predicted risk.
            </div>
          </div>

          {/* Before / After Comparison Matrix (Section 17) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>BEFORE / AFTER PROFILE</span>
              <span className="text-[10px] text-slate-500 font-mono">Current vs Simulated</span>
            </h4>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="grid grid-cols-2 py-2 items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                  <span className="font-mono text-slate-300">{currentPatient.systolicBp}/{currentPatient.diastolicBp} mmHg</span>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <span className="text-cyan-400 block text-[10px]">Simulated</span>
                  <span className="font-mono font-bold text-cyan-300">{simulatedData.systolicBp}/{simulatedData.diastolicBp} mmHg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 py-2 items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">LDL Cholesterol</span>
                  <span className="font-mono text-slate-300">{currentPatient.ldlCholesterol} mg/dL</span>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <span className="text-cyan-400 block text-[10px]">Simulated</span>
                  <span className="font-mono font-bold text-cyan-300">{simulatedData.ldlCholesterol} mg/dL</span>
                </div>
              </div>

              <div className="grid grid-cols-2 py-2 items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Body Mass Index</span>
                  <span className="font-mono text-slate-300">{currentBmi.bmi} kg/m²</span>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <span className="text-cyan-400 block text-[10px]">Simulated</span>
                  <span className="font-mono font-bold text-cyan-300">{simBmi.bmi} kg/m²</span>
                </div>
              </div>

              <div className="grid grid-cols-2 py-2 items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Smoking</span>
                  <span className="font-mono text-slate-300">{currentPatient.smoking ? 'Yes' : 'No'}</span>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <span className="text-cyan-400 block text-[10px]">Simulated</span>
                  <span className="font-mono font-bold text-cyan-300">{simulatedData.smoking ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 py-2 items-center bg-slate-900/40 px-2 rounded-lg mt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">CAD Risk Score</span>
                  <span className="font-mono font-bold text-slate-200">{currentResult.cadRisk}% ({currentResult.overallRisk})</span>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <span className="text-cyan-400 block text-[10px]">Predicted Target</span>
                  <span className={`font-mono font-black text-sm ${simulatedResult.cadRisk < currentResult.cadRisk ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulatedResult.cadRisk}% ({simulatedResult.overallRisk})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Trajectory (Section 15) */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              SIMULATION TRAJECTORY
            </span>
            <div className="flex items-center justify-between text-center gap-1 font-mono">
              {trajectorySteps.map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div className={`p-2 rounded-xl flex-1 border transition ${
                    step.active
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[9px] block text-slate-400 truncate">{step.label}</span>
                    <span className="text-xs font-black text-white">{step.score}%</span>
                  </div>
                  {idx < trajectorySteps.length - 1 && (
                    <span className="text-slate-600 text-xs">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. AI Contribution Map (Section 13) */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              AI CONTRIBUTION MAP — WHY IS THE RISK {simulatedResult.cadRisk}%?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked mathematical feature influences in the current simulation state.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {simulatedResult.contributingFactors.length} Active Vectors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {simulatedResult.contributingFactors.slice(0, 6).map((factor, index) => {
            const isHigh = factor.impact === 'HIGH';
            const isMed = factor.impact === 'MODERATE';
            return (
              <div key={factor.factor} className="p-3 rounded-xl bg-[#0B1220] border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{index + 1}. {factor.factor}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      factor.isPositive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isHigh
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isMed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {factor.isPositive ? 'PROTECTIVE' : isHigh ? 'HIGH IMPACT' : isMed ? 'MEDIUM IMPACT' : 'LOW IMPACT'}
                    </span>
                    <span className="font-mono font-bold text-white text-xs">{factor.contribution}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      factor.isPositive
                        ? 'bg-emerald-500'
                        : isHigh
                        ? 'bg-rose-500'
                        : isMed
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${factor.contribution}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer (Section 26) */}
      <div className="p-3.5 rounded-xl bg-[#080F1E] border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>CardioSynex AI is a research and educational prototype. Predictions are not medical diagnoses.</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Model-Associated Sensitivity Engine
        </span>
      </div>
    </div>
  );
};
