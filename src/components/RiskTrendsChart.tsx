import React, { useState, useMemo } from 'react';
import { AssessmentRecord, RiskCategory } from '../types/cardiac';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  Heart, 
  Filter, 
  Layers, 
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine,
  Legend
} from 'recharts';

interface RiskTrendsChartProps {
  records: AssessmentRecord[];
  selectedPatientName?: string;
  onSelectRecord?: (record: AssessmentRecord) => void;
  className?: string;
}

type MetricMode = 'risk' | 'hemodynamics' | 'lipids' | 'multi';

export const RiskTrendsChart: React.FC<RiskTrendsChartProps> = ({
  records,
  selectedPatientName,
  onSelectRecord,
  className = '',
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('risk');
  const [patientFilter, setPatientFilter] = useState<string>(selectedPatientName || 'ALL');

  // Extract distinct patient names from records
  const patientNames = useMemo(() => {
    const names = new Set<string>();
    records.forEach(r => names.add(r.patientName));
    return Array.from(names);
  }, [records]);

  // Filter and sort chronologically (oldest to newest)
  const sortedRecords = useMemo(() => {
    let filtered = records;
    if (patientFilter !== 'ALL') {
      filtered = records.filter(r => r.patientName === patientFilter);
    }
    return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, patientFilter]);

  // Prepare data points for Recharts
  const chartData = useMemo(() => {
    return sortedRecords.map((r, index) => {
      const dateObj = new Date(r.date);
      const formattedDate = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const topFactor = r.result.contributingFactors?.[0]?.factor || 'Hemodynamics';

      return {
        id: r.id,
        index: index + 1,
        dateLabel: `${formattedDate} (${formattedTime})`,
        shortDate: formattedDate,
        rawDate: r.date,
        patientName: r.patientName,
        cadRisk: r.result.cadRisk,
        riskCategory: r.result.overallRisk,
        systolicBp: r.patientData.systolicBp,
        diastolicBp: r.patientData.diastolicBp,
        ldlCholesterol: r.patientData.ldlCholesterol,
        hdlCholesterol: r.patientData.hdlCholesterol,
        bloodGlucose: r.patientData.bloodGlucose,
        bmi: r.result.bmi,
        topFactor,
        recordRef: r,
      };
    });
  }, [sortedRecords]);

  // Compute key summary statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const firstScore = chartData[0].cadRisk;
    const latestScore = chartData[chartData.length - 1].cadRisk;
    const delta = latestScore - firstScore;

    let minScore = 100;
    let maxScore = 0;
    chartData.forEach(d => {
      if (d.cadRisk < minScore) minScore = d.cadRisk;
      if (d.cadRisk > maxScore) maxScore = d.cadRisk;
    });

    return {
      firstScore,
      latestScore,
      delta,
      minScore,
      maxScore,
      totalCount: chartData.length,
    };
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const riskCat: RiskCategory = data.riskCategory;

      const badgeColor =
        riskCat === 'CRITICAL' || riskCat === 'HIGH'
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : riskCat === 'MODERATE'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 max-w-[260px] animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-200">{data.patientName}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.dateLabel}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">CAD Risk Score:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white font-mono text-sm">{data.cadRisk}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                {data.riskCategory}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-300 border-t border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Blood Pressure</span>
              <span>{data.systolicBp}/{data.diastolicBp} mmHg</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LDL Cholesterol</span>
              <span>{data.ldlCholesterol} mg/dL</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">BMI</span>
              <span>{data.bmi} kg/m²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Top Driver</span>
              <span className="truncate block text-cyan-400">{data.topFactor}</span>
            </div>
          </div>

          {onSelectRecord && (
            <div className="pt-1 text-[10px] text-cyan-400 font-medium text-center">
              Click node to load profile
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-5 ${className}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">HISTORICAL RISK TRENDS</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Longitudinal progression of cardiovascular risk scores across logged clinical evaluations.
          </p>
        </div>

        {/* View Metric Toggles & Patient Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Patient Selector Filter */}
          {patientNames.length > 1 && (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
              <select
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900">All Patients</option>
                {patientNames.map(name => (
                  <option key={name} value={name} className="bg-slate-900">{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Metric Selector Mode */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('risk')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                metricMode === 'risk' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk %
            </button>
            <button
              onClick={() => setMetricMode('hemodynamics')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                metricMode === 'hemodynamics' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setMetricMode('lipids')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                metricMode === 'lipids' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lipids
            </button>
            <button
              onClick={() => setMetricMode('multi')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                metricMode === 'multi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Multi-Track
            </button>
          </div>
        </div>
      </div>

      {/* Longitudinal Statistics Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Baseline Milestone</span>
            <span className="text-lg font-black text-white font-mono">{stats.firstScore}%</span>
            <span className="text-[10px] text-slate-500 block">Initial evaluation</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Latest Assessment</span>
            <span className="text-lg font-black text-cyan-300 font-mono">{stats.latestScore}%</span>
            <span className="text-[10px] text-slate-500 block">Most recent state</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Net Risk Delta</span>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-black font-mono ${stats.delta < 0 ? 'text-emerald-400' : stats.delta > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {stats.delta > 0 ? `+${stats.delta}` : stats.delta}%
              </span>
              {stats.delta < 0 ? (
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              ) : stats.delta > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {stats.delta < 0 ? 'Favorable reduction' : stats.delta > 0 ? 'Elevated trajectory' : 'No net change'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Score Extremes</span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-emerald-400 font-bold text-sm">Min {stats.minScore}%</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold text-sm">Max {stats.maxScore}%</span>
            </div>
            <span className="text-[10px] text-slate-500 block">{stats.totalCount} evaluations recorded</span>
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
          <Activity className="w-8 h-8 text-slate-600" />
          <h4 className="text-sm font-bold text-slate-300">No Assessment Records to Plot</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Save evaluations from the intake form to generate a longitudinal risk timeline.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'risk' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onSelectRecord) {
                    onSelectRecord(e.activePayload[0].payload.recordRef);
                  }
                }}
              >
                <defs>
                  <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="shortDate"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Clinical Threshold Lines */}
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (80%)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'High Risk (55%)', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={25} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Moderate (25%)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                <Area
                  type="monotone"
                  dataKey="cadRisk"
                  name="CAD Risk Score (%)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#trendAreaGradient)"
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : metricMode === 'hemodynamics' ? (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onSelectRecord) {
                    onSelectRecord(e.activePayload[0].payload.recordRef);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 200]} stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'HTN Stage 2', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal SBP', fill: '#10b981', fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="systolicBp" name="Systolic BP (mmHg)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="diastolicBp" name="Diastolic BP (mmHg)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : metricMode === 'lipids' ? (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onSelectRecord) {
                    onSelectRecord(e.activePayload[0].payload.recordRef);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[20, 240]} stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target LDL (<100)', fill: '#10b981', fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="ldlCholesterol" name="LDL-C (mg/dL)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="hdlCholesterol" name="HDL-C (mg/dL)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onSelectRecord) {
                    onSelectRecord(e.activePayload[0].payload.recordRef);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 180]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="cadRisk" name="CAD Risk (%)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="systolicBp" name="Systolic BP" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ldlCholesterol" name="LDL-C" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Annotation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>Interactive timeline built from browser-stored assessment sessions.</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;25% Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 25-55% Mod
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;55% High
          </span>
        </div>
      </div>
    </div>
  );
};
