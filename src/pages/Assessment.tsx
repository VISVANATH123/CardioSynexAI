import React, { useState } from 'react';
import { PatientData, CardiacRiskResult, Sex, ActivityLevel, ChestPainType } from '../types/cardiac';
import { calculateBmi, calculateCardiacRisk } from '../utils/calculations';
import { DEMO_PATIENTS } from '../data/demoPatients';
import { 
  ClipboardCheck, 
  Sparkles, 
  UserCheck, 
  Heart, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  FileText
} from 'lucide-react';

interface AssessmentProps {
  currentPatient: PatientData;
  onUpdatePatient: (patient: PatientData, result: CardiacRiskResult) => void;
  onNavigateToResults?: () => void;
}

export const Assessment: React.FC<AssessmentProps> = ({
  currentPatient,
  onUpdatePatient,
  onNavigateToResults,
}) => {
  const [formData, setFormData] = useState<PatientData>({ ...currentPatient });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live BMI preview
  const bmiInfo = calculateBmi(formData.weightKg, formData.heightCm);

  // Load demo profile
  const handleLoadDemo = (demoId: string) => {
    const found = DEMO_PATIENTS.find(p => p.id === demoId);
    if (found) {
      setFormData({ ...found });
      setSuccessMessage(`Loaded sample profile: ${found.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 400);
    setTimeout(() => setAnalysisStep(3), 900);
    setTimeout(() => setAnalysisStep(4), 1400);

    setTimeout(() => {
      const result = calculateCardiacRisk(formData);
      onUpdatePatient(formData, result);
      setIsAnalyzing(false);
      setAnalysisStep(0);
      setSuccessMessage('Cardiovascular assessment completed successfully.');
      if (onNavigateToResults) {
        onNavigateToResults();
      }
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* Premium Model Inference Loading Overlay (Section 25) */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#050A14]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1220] border border-cyan-500/40 p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                INFERENCE PIPELINE
              </span>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                ANALYZING CARDIOVASCULAR PROFILE
              </h3>
            </div>

            {/* Animated Heartbeat ECG SVG Line */}
            <div className="w-full h-16 flex items-center justify-center overflow-hidden py-1">
              <svg viewBox="0 0 300 60" className="w-full h-full">
                <path
                  d="M 10 30 L 70 30 L 85 10 L 95 50 L 110 5 L 125 45 L 135 30 L 190 30 L 205 15 L 215 45 L 225 30 L 290 30"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-ecg"
                />
              </svg>
            </div>

            {/* Multi-Step Checklist */}
            <div className="w-full space-y-2 text-xs text-left bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  analysisStep >= 1 ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600'
                }`}>
                  {analysisStep >= 1 ? '✓' : '○'}
                </span>
                <span className={analysisStep >= 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  Clinical parameters verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  analysisStep >= 2 ? 'bg-emerald-500/20 text-emerald-400' : analysisStep === 1 ? 'text-cyan-400 animate-pulse' : 'text-slate-600'
                }`}>
                  {analysisStep >= 2 ? '✓' : analysisStep === 1 ? '●' : '○'}
                </span>
                <span className={analysisStep >= 2 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  Risk factors normalization
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  analysisStep >= 3 ? 'bg-emerald-500/20 text-emerald-400' : analysisStep === 2 ? 'text-cyan-400 animate-pulse' : 'text-slate-600'
                }`}>
                  {analysisStep >= 3 ? '✓' : analysisStep === 2 ? '●' : '○'}
                </span>
                <span className={analysisStep >= 3 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  Model inference execution
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  analysisStep >= 4 ? 'bg-emerald-500/20 text-emerald-400' : analysisStep === 3 ? 'text-cyan-400 animate-pulse' : 'text-slate-600'
                }`}>
                  {analysisStep >= 4 ? '✓' : analysisStep === 3 ? '●' : '○'}
                </span>
                <span className={analysisStep >= 4 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  3D visualization mesh binding
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Calibrating multi-axial score...
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            Clinical Intake & Parameter Matrix
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">CARDIOVASCULAR RISK ASSESSMENT</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Input comprehensive biometric, hemodynamic, and metabolic markers to evaluate multivariable coronary artery disease risk.
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Quick Demo Profiles
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_PATIENTS.map(dp => (
              <button
                key={dp.id}
                type="button"
                onClick={() => handleLoadDemo(dp.id)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-slate-300 font-medium transition"
              >
                {dp.name.split(' ')[0]} ({dp.id.includes('low') ? 'Low' : dp.id.includes('mod') ? 'Mod' : dp.id.includes('crit') ? 'Crit' : 'High'})
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics & Biometrics */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">01</span>
              Demographics & Anthropometrics
            </h3>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Derived BMI:</span>
              <strong className="text-white font-mono">{bmiInfo.bmi}</strong>
              <span className={`font-semibold text-[11px] ${bmiInfo.color}`}>({bmiInfo.category})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Patient Name / Identifier</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                min="18"
                max="99"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Biological Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="120"
                max="230"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="250"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chest Pain Symptoms</label>
              <select
                value={formData.chestPainType}
                onChange={(e) => setFormData({ ...formData, chestPainType: e.target.value as ChestPainType })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="none">Asymptomatic (None)</option>
                <option value="typical_angina">Typical Angina</option>
                <option value="atypical_angina">Atypical Angina</option>
                <option value="non_anginal">Non-Anginal Discomfort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Family History of CAD</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, familyHistory: false })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    !formData.familyHistory ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Negative
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, familyHistory: true })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    formData.familyHistory ? 'bg-rose-600/30 text-rose-300 border-rose-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Positive (1st deg)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hemodynamics & Vitals */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">02</span>
              Hemodynamics & Vital Signs
            </h3>
            <span className="text-xs text-slate-400">Cuff measurement standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Systolic BP (mmHg)</label>
                <span className={`text-[11px] font-mono font-semibold ${
                  formData.systolicBp >= 140 ? 'text-rose-400' : formData.systolicBp >= 130 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {formData.systolicBp >= 140 ? 'Stage 2 HTN' : formData.systolicBp >= 130 ? 'Stage 1 HTN' : 'Normal'}
                </span>
              </div>
              <input
                type="number"
                min="80"
                max="220"
                value={formData.systolicBp}
                onChange={(e) => setFormData({ ...formData, systolicBp: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Diastolic BP (mmHg)</label>
                <span className="text-[11px] font-mono text-slate-400">Target &lt; 80</span>
              </div>
              <input
                type="number"
                min="50"
                max="130"
                value={formData.diastolicBp}
                onChange={(e) => setFormData({ ...formData, diastolicBp: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Resting Heart Rate (bpm)</label>
                <span className="text-[11px] font-mono text-slate-400">Normal 60-100</span>
              </div>
              <input
                type="number"
                min="40"
                max="150"
                value={formData.restingHeartRate}
                onChange={(e) => setFormData({ ...formData, restingHeartRate: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lipid & Metabolic Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">03</span>
              Lipid & Metabolic Biomarkers
            </h3>
            <span className="text-xs text-slate-400">Fasting serum concentrations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                min="100"
                max="450"
                value={formData.totalCholesterol}
                onChange={(e) => setFormData({ ...formData, totalCholesterol: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">LDL Cholesterol (mg/dL)</label>
              <input
                type="number"
                min="40"
                max="300"
                value={formData.ldlCholesterol}
                onChange={(e) => setFormData({ ...formData, ldlCholesterol: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">HDL Cholesterol (mg/dL)</label>
              <input
                type="number"
                min="15"
                max="120"
                value={formData.hdlCholesterol}
                onChange={(e) => setFormData({ ...formData, hdlCholesterol: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fasting Blood Glucose (mg/dL)</label>
              <input
                type="number"
                min="60"
                max="350"
                value={formData.bloodGlucose}
                onChange={(e) => setFormData({ ...formData, bloodGlucose: Number(e.target.value) })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lifestyle Factors */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">04</span>
              Lifestyle & Clinical History
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Tobacco / Smoking Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, smoking: false })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    !formData.smoking ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Non-Smoker
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, smoking: true })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    formData.smoking ? 'bg-rose-600/30 text-rose-300 border-rose-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Active Smoker
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Diagnosed Diabetes Mellitus</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, diabetes: false })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    !formData.diabetes ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, diabetes: true })}
                  className={`flex-1 py-2 text-xs rounded-xl font-semibold border transition ${
                    formData.diabetes ? 'bg-rose-600/30 text-rose-300 border-rose-500/50' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Yes (Type 1 or 2)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Weekly Physical Activity</label>
              <select
                value={formData.physicalActivity}
                onChange={(e) => setFormData({ ...formData, physicalActivity: e.target.value as ActivityLevel })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 capitalize"
              >
                <option value="sedentary">Sedentary (&lt; 30 min/wk)</option>
                <option value="moderate">Moderate (60 - 150 min/wk)</option>
                <option value="active">Active (&gt; 150 min/wk aerobic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Execution Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-base tracking-wide transition shadow-xl glow-cyan flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyzing cardiovascular profile...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>RUN CARDIOVASCULAR ASSESSMENT</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
