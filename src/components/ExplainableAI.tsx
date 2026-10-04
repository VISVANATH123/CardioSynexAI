import React, { useState } from 'react';
import { ContributingFactor, PatientData, CardiacRiskResult } from '../types/cardiac';
import { fetchAiRiskExplanation } from '../services/geminiService';
import { 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Stethoscope, 
  RefreshCw,
  FileText,
  Info
} from 'lucide-react';

interface ExplainableAIProps {
  patientData: PatientData;
  result: CardiacRiskResult;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ patientData, result }) => {
  const [aiText, setAiText] = useState<string>(result.aiExplanation || result.explanation);
  const [aiSource, setAiSource] = useState<'gemini' | 'engine'>('engine');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const handleFetchAi = async () => {
    setLoadingAi(true);
    try {
      const response = await fetchAiRiskExplanation(patientData, result);
      setAiText(response.text);
      setAiSource(response.source);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const getImpactColor = (impact: ContributingFactor['impact'], isPositive: boolean) => {
    if (isPositive) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (impact === 'HIGH') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (impact === 'MODERATE') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  };

  const getBarColor = (impact: ContributingFactor['impact'], isPositive: boolean) => {
    if (isPositive) return 'from-emerald-600 to-teal-400';
    if (impact === 'HIGH') return 'from-rose-600 to-red-400';
    if (impact === 'MODERATE') return 'from-amber-600 to-orange-400';
    return 'from-sky-600 to-cyan-400';
  };

  return (
    <div className="space-y-6">
      {/* Primary Explainability Card */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HelpCircle className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">WHY THIS PREDICTION?</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ranked mathematical feature contributions derived from the model's weighting matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {result.contributingFactors.length} Factors Analyzed
            </span>
          </div>
        </div>

        {/* Natural Language Synthesis Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-white block mb-0.5">Model Attribution Summary:</span>
            {result.explanation}
          </div>
        </div>

        {/* Ranked Horizontal Contribution Bars */}
        <div className="mt-6 space-y-4">
          {result.contributingFactors.map((factor, index) => {
            return (
              <div key={factor.factor} className="group p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 w-5">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-slate-200 text-sm">{factor.factor}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({factor.category})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Current: <strong className="text-slate-200">{factor.currentValue}</strong>
                    </span>
                    <span className="text-xs text-slate-500">|</span>
                    <span className="text-xs text-slate-400">
                      Target: <span className="text-cyan-400">{factor.targetValue}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getImpactColor(factor.impact, factor.isPositive)}`}>
                      {factor.isPositive ? 'PROTECTIVE' : `${factor.impact} IMPACT`}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${getBarColor(factor.impact, factor.isPositive)}`}
                    style={{ width: `${factor.contribution}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1.5 text-slate-400">
                  <span className="line-clamp-1">{factor.description}</span>
                  <span className="font-mono font-bold text-slate-300 ml-2 flex-shrink-0">
                    {factor.contribution}% influence
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Health Explanation Panel (Gemini API Integration) */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">AI CLINICAL NARRATIVE EXPLANATION</h4>
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {aiSource === 'gemini' ? (
                  <span className="text-cyan-400 font-semibold">● Powered by Gemini 3.8 Flash</span>
                ) : (
                  <span className="text-slate-400">● Deterministic Clinical Reasoning Engine</span>
                )}
              </span>
            </div>
          </div>

          <button
            onClick={handleFetchAi}
            disabled={loadingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            {loadingAi ? 'Generating...' : 'Regenerate Narrative'}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-cyan-500/15 leading-relaxed text-sm text-slate-300">
          <p className="italic">{aiText}</p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>AI-generated educational synthesis.</span>
          <span className="text-cyan-400/80">Model output is for exploration, not clinical guidance.</span>
        </div>
      </div>

      {/* Clinical Discussion Recommendations (Section 16) */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">
              AREAS TO DISCUSS WITH A HEALTH PROFESSIONAL
            </h4>
            <p className="text-xs text-slate-400">
              Evidence-based talking points suggested by this prototype's factor attribution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-normal">
                {rec}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
          CardioSynex AI does not provide medication dosages or diagnostic prescriptions. Consider discussing these parameters with your certified cardiologist or primary care provider.
        </div>
      </div>
    </div>
  );
};
