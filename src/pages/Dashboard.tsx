import React from 'react';
import { PatientData, CardiacRiskResult, AssessmentRecord } from '../types/cardiac';
import { RiskGauge } from '../components/RiskGauge';
import { ThreeDAnatomy } from '../components/ThreeDAnatomy';
import { ExplainableAI } from '../components/ExplainableAI';
import { RiskTrendsChart } from '../components/RiskTrendsChart';
import { DEMO_PATIENTS } from '../data/demoPatients';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  ShieldCheck,
  Brain, 
  Sliders, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  UserCheck, 
  Sparkles,
  AlertTriangle,
  PlayCircle,
  History
} from 'lucide-react';

interface DashboardProps {
  currentPatient: PatientData;
  result: CardiacRiskResult;
  onNavigate: (page: string) => void;
  onSelectDemoPatient: (patientId: string) => void;
  historyRecords?: AssessmentRecord[];
  onSelectRecord?: (record: AssessmentRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentPatient,
  result,
  onNavigate,
  onSelectDemoPatient,
  historyRecords = [],
  onSelectRecord,
}) => {
  const elevatedFactorsCount = result.contributingFactors.filter(f => !f.isPositive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Presentation Banner (Compact High-Impact) */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Interactive 3D Cardiovascular Risk Intelligence
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            See Your Cardiovascular Risk. <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Understand & Simulate It.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            CardioSynex AI turns static clinical scores into an explainable 3D spatial story. Pinpoint where risk originates, uncover root contributors, and simulate how lifestyle interventions alter predictive outcomes.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('simulator')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition shadow-md glow-cyan flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>LAUNCH WHAT-IF SIMULATOR</span>
            </button>

            <button
              onClick={() => onNavigate('assessment')}
              className="px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#0F1728] text-cyan-300 border border-cyan-500/30 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Intake Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Patients Pills for Judges */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo:</span>
              <button
                onClick={() => onSelectDemoPatient('demo-3-high')}
                className={`text-[11px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  currentPatient.id === 'demo-3-high' ? 'bg-rose-500 text-white shadow' : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                High (Robert)
              </button>
              <button
                onClick={() => onSelectDemoPatient('demo-2-mod')}
                className={`text-[11px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  currentPatient.id === 'demo-2-mod' ? 'bg-amber-500 text-white shadow' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                Mod (David)
              </button>
              <button
                onClick={() => onSelectDemoPatient('demo-1-low')}
                className={`text-[11px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  currentPatient.id === 'demo-1-low' ? 'bg-emerald-500 text-white shadow' : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                }`}
              >
                Low (Sarah)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards (Section 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CAD Risk */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 glass-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">CAD RISK ESTIMATION</span>
            <Heart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{result.cadRisk}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              result.overallRisk === 'HIGH' || result.overallRisk === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : result.overallRisk === 'MODERATE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {result.overallRisk} RISK
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Coronary Artery Disease 10-Yr Equivalent
          </span>
        </div>

        {/* Card 2: Overall Risk Tier */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 glass-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">OVERALL CARDIAC RISK</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${
              result.overallRisk === 'HIGH' || result.overallRisk === 'CRITICAL'
                ? 'text-rose-400'
                : result.overallRisk === 'MODERATE'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {result.overallRisk}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Stratified Clinical Risk Category
          </span>
        </div>

        {/* Card 3: Detected Risk Factors */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 glass-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">RISK FACTORS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-400">{elevatedFactorsCount}</span>
            <span className="text-xs font-semibold text-slate-300">detected</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Contributing atherogenic drivers
          </span>
        </div>

        {/* Card 4: Model Confidence */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 glass-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">MODEL CONFIDENCE</span>
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-cyan-300">{result.modelConfidence}%</span>
            <span className="text-[10px] text-slate-400 font-mono">(Prototype)</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Multi-axial biomarker coherence score
          </span>
        </div>
      </div>

      {/* Core Split: 3D Anatomical Twin (Left) & Risk Gauge + Patient Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 3D Human Anatomy Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                INTERACTIVE 3D ANATOMICAL TWIN
              </h3>
            </div>
            <button
              onClick={() => onNavigate('anatomy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Expand Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ThreeDAnatomy
            riskScore={result.cadRisk}
            riskCategory={result.overallRisk}
            restingHeartRate={currentPatient.restingHeartRate}
            compact={false}
          />
        </div>

        {/* Right: Risk Gauge & Patient Clinical Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Circular Risk Gauge (Section 12) */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              COMPUTATIONAL RISK DIAL
            </span>
            <RiskGauge
              score={result.cadRisk}
              category={result.overallRisk}
              confidence={result.modelConfidence}
              size="md"
            />
          </div>

          {/* Patient Summary Card (Section 14) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  PATIENT SUMMARY CARD
                </span>
                <h4 className="text-base font-bold text-white">{currentPatient.name}</h4>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {currentPatient.age} yrs • {currentPatient.sex}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <strong className="text-slate-200 font-mono">{currentPatient.systolicBp}/{currentPatient.diastolicBp} mmHg</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Lipid Profile</span>
                <strong className="text-slate-200 font-mono">LDL {currentPatient.ldlCholesterol} / HDL {currentPatient.hdlCholesterol}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Body Mass Index</span>
                <strong className="text-slate-200 font-mono">{result.bmi} kg/m² ({result.bmiCategory})</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Smoking & Glucose</span>
                <strong className="text-slate-200 font-mono">
                  {currentPatient.smoking ? 'Smoker' : 'Non-Smoker'} • {currentPatient.bloodGlucose} mg/dL
                </strong>
              </div>
            </div>

            {/* Top 3 Contributors */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Top Mathematical Risk Contributors:
              </span>
              <div className="space-y-1">
                {result.contributingFactors.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/40">
                    <span className="text-slate-300 font-medium">{i + 1}. {f.factor}</span>
                    <span className="font-mono text-cyan-400 font-semibold">{f.contribution}% impact</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN WHAT-IF SIMULATOR FOR THIS PROFILE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Risk Trends Component Section */}
      {historyRecords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              LONGITUDINAL RISK PROGRESSION
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View History Log ({historyRecords.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <RiskTrendsChart
            records={historyRecords}
            selectedPatientName={currentPatient.name}
            onSelectRecord={onSelectRecord}
          />
        </div>
      )}

      {/* Explainable AI Full Section (Section 11) */}
      <ExplainableAI patientData={currentPatient} result={result} />

      {/* Medical Safety Disclaimer (Section 26) */}
      <div className="p-3.5 rounded-xl bg-[#080F1E] border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
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
