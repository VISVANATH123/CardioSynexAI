import React from 'react';
import { AssessmentRecord, PatientData, CardiacRiskResult } from '../types/cardiac';
import { RiskTrendsChart } from '../components/RiskTrendsChart';
import { 
  History, 
  Trash2, 
  Eye, 
  RotateCcw, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertOctagon,
  ShieldAlert,
  Info,
  Sparkles
} from 'lucide-react';

interface HistoryViewProps {
  historyRecords: AssessmentRecord[];
  onLoadRecord: (record: AssessmentRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyRecords,
  onLoadRecord,
  onDeleteRecord,
  onClearHistory,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Audit Trail & Longitudinal Progression
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">PREDICTION ASSESSMENT HISTORY</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Logged evaluation records stored locally in browser session storage. Review past trajectories, monitor risk changes over time, or reload profiles for comparative What-If simulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historyRecords.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-500/30 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Interactive Risk Trends Progression Chart Component */}
      <RiskTrendsChart
        records={historyRecords}
        onSelectRecord={onLoadRecord}
      />

      {/* Historical Records Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            EVALUATION LOGS ({historyRecords.length} SAVED)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Click 'Load Profile' to inspect any evaluation in the 3D Twin & Simulator
          </span>
        </div>

        {historyRecords.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <History className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Historical Assessments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run an assessment from the Intake tab to save timestamped predictive records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyRecords.map((record) => {
              const riskCat = record.result.overallRisk;
              const badgeClass =
                riskCat === 'CRITICAL' || riskCat === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : riskCat === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              return (
                <div
                  key={record.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{record.patientName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          {new Date(record.date).toLocaleDateString()} at{' '}
                          {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {record.result.cadRisk}% {riskCat}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Blood Pressure:</span>
                        <span className="font-mono">{record.patientData.systolicBp}/{record.patientData.diastolicBp} mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">LDL-C / Total:</span>
                        <span className="font-mono">{record.patientData.ldlCholesterol} / {record.patientData.totalCholesterol} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">BMI / Glucose:</span>
                        <span className="font-mono">{record.result.bmi} / {record.patientData.bloodGlucose} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Smoking Status:</span>
                        <span className="font-mono font-medium">{record.patientData.smoking ? 'Current Smoker' : 'Non-Smoker'}</span>
                      </div>
                    </div>

                    {/* Top Drivers */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Top Drivers</span>
                      <div className="flex flex-wrap gap-1">
                        {record.result.contributingFactors.slice(0, 2).map((f, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] font-mono">
                            {f.factor.split(' ')[0]} ({f.contribution}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onLoadRecord(record)}
                      className="flex-1 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Load Profile
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
