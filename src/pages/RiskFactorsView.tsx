import React from 'react';
import { PatientData, CardiacRiskResult } from '../types/cardiac';
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Heart, 
  ShieldCheck, 
  AlertTriangle,
  Award,
  Layers,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';

interface RiskFactorsViewProps {
  currentPatient: PatientData;
  result: CardiacRiskResult;
}

export const RiskFactorsView: React.FC<RiskFactorsViewProps> = ({
  currentPatient,
  result,
}) => {
  // Simulated timeline of risk over preceding months for this patient (Section 13)
  const baseRisk = result.cadRisk;
  const trendData = [
    { month: '6 Mos Ago', risk: Math.min(95, Math.max(10, baseRisk - 6)), systolic: currentPatient.systolicBp - 4, ldl: currentPatient.ldlCholesterol - 8 },
    { month: '4 Mos Ago', risk: Math.min(95, Math.max(10, baseRisk - 2)), systolic: currentPatient.systolicBp - 2, ldl: currentPatient.ldlCholesterol - 4 },
    { month: '2 Mos Ago', risk: Math.min(95, Math.max(10, baseRisk + 3)), systolic: currentPatient.systolicBp + 4, ldl: currentPatient.ldlCholesterol + 6 },
    { month: 'Current Evaluation', risk: baseRisk, systolic: currentPatient.systolicBp, ldl: currentPatient.ldlCholesterol },
  ];

  // Clinical reference range matrix
  const clinicalMatrix = [
    {
      marker: 'Systolic Blood Pressure',
      current: `${currentPatient.systolicBp} mmHg`,
      optimal: '< 120 mmHg',
      status: currentPatient.systolicBp >= 140 ? 'High (Stage 2)' : currentPatient.systolicBp >= 130 ? 'Elevated' : 'Optimal',
      statusColor: currentPatient.systolicBp >= 140 ? 'text-rose-400 bg-rose-500/10' : currentPatient.systolicBp >= 130 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: 'AHA / ACC 2017 Guidelines for Prevention & Management',
    },
    {
      marker: 'Diastolic Blood Pressure',
      current: `${currentPatient.diastolicBp} mmHg`,
      optimal: '< 80 mmHg',
      status: currentPatient.diastolicBp >= 90 ? 'High' : currentPatient.diastolicBp >= 80 ? 'Pre-HTN' : 'Optimal',
      statusColor: currentPatient.diastolicBp >= 90 ? 'text-rose-400 bg-rose-500/10' : currentPatient.diastolicBp >= 80 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: 'AHA / ACC 2017 Guidelines',
    },
    {
      marker: 'LDL-C (Atherogenic Lipoprotein)',
      current: `${currentPatient.ldlCholesterol} mg/dL`,
      optimal: '< 100 mg/dL (< 70 high risk)',
      status: currentPatient.ldlCholesterol >= 160 ? 'High' : currentPatient.ldlCholesterol >= 130 ? 'Borderline' : 'Desirable',
      statusColor: currentPatient.ldlCholesterol >= 160 ? 'text-rose-400 bg-rose-500/10' : currentPatient.ldlCholesterol >= 130 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: '2019 ESC / EAS Dyslipidemia Guidelines',
    },
    {
      marker: 'HDL-C (Protective Fraction)',
      current: `${currentPatient.hdlCholesterol} mg/dL`,
      optimal: '≥ 50 mg/dL (Female) / ≥ 40 (Male)',
      status: currentPatient.hdlCholesterol < 40 ? 'Suboptimal' : 'Protective',
      statusColor: currentPatient.hdlCholesterol < 40 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: 'National Lipid Association Expert Consensus',
    },
    {
      marker: 'Fasting Blood Glucose',
      current: `${currentPatient.bloodGlucose} mg/dL`,
      optimal: '< 100 mg/dL',
      status: currentPatient.bloodGlucose >= 126 || currentPatient.diabetes ? 'Diabetic Threshold' : currentPatient.bloodGlucose >= 100 ? 'Impaired Fasting' : 'Normal',
      statusColor: currentPatient.bloodGlucose >= 126 || currentPatient.diabetes ? 'text-rose-400 bg-rose-500/10' : currentPatient.bloodGlucose >= 100 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: 'ADA Standards of Care in Diabetes',
    },
    {
      marker: 'Body Mass Index (BMI)',
      current: `${result.bmi} kg/m²`,
      optimal: '18.5 – 24.9 kg/m²',
      status: result.bmiCategory,
      statusColor: result.bmi >= 30 ? 'text-rose-400 bg-rose-500/10' : result.bmi >= 25 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
      guideline: 'WHO International Classification of Weight',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart2 className="w-4 h-4" />
          Factor Diagnostics & Evidence Matrix
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">CARDIOVASCULAR RISK FACTORS & ANALYTICS</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Detailed multi-axial breakdown of detected biomarkers mapped against international clinical consensus guidelines (AHA/ACC, ESC, ADA).
        </p>
      </div>

      {/* Simulated Historical Risk Trend (Section 13) */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              SIMULATED HISTORICAL RISK TRAJECTORY
            </h3>
            <span className="text-xs text-slate-400">
              Hypothetical risk progression over recent timeline intervals based on longitudinal input trends.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400">
            *Prototype / Simulated History
          </span>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(value: any) => [`${value}% Predicted CAD Risk`, 'Risk']}
              />
              <Area type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#riskAreaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Note: Longitudinal tracking is educational in this prototype. Does not represent actual certified diagnostic records.</span>
        </div>
      </div>

      {/* Clinical Evidence Guideline Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            CLINICAL BIOMARKER REFERENCE MATRIX
          </h3>
          <span className="text-xs text-slate-400 font-mono">Current vs Optimal Standards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Biomarker / Factor</th>
                <th className="py-2.5 px-3">Current Patient Value</th>
                <th className="py-2.5 px-3">Target Reference Range</th>
                <th className="py-2.5 px-3">Calculated Clinical Tier</th>
                <th className="py-2.5 px-3">Standard Guideline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clinicalMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3 font-semibold text-slate-200">{item.marker}</td>
                  <td className="py-3 px-3 font-mono font-bold text-white">{item.current}</td>
                  <td className="py-3 px-3 text-cyan-400 font-mono">{item.optimal}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border border-current/20 ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{item.guideline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
