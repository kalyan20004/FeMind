export default function DecisionPanel({ analysis, assetId }) {
  if (!analysis) return null;

  const { option_a, option_b, decision_summary, recommendation } = analysis;
  const recommendStop = recommendation === 'STOP_AND_MAINTAIN';

  return (
    <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md p-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-wide">Decision Cost Analysis — {assetId}</h3>

      <div className="space-y-4 mb-5">
        {/* Option A */}
        <div className={`relative overflow-hidden rounded-xl p-5 border transition-all ${recommendStop ? 'border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200">{option_a?.label}</span>
            {recommendStop && <span className="text-[10px] uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-500/30 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]">Recommended</span>}
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{option_a?.total_cost}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">{option_a?.description}</p>
        </div>

        {/* Option B */}
        <div className={`relative overflow-hidden rounded-xl p-5 border transition-all ${recommendStop ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' : 'border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200">{option_b?.label}</span>
            <span className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded border border-amber-300 dark:border-amber-500/20 font-bold">
              {option_b?.failure_probability_pct}% failure risk
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{option_b?.expected_cost}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">Expected cost · {option_b?.rul_days} days remaining</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
        <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
          Acting now saves <span className="font-bold text-indigo-900 dark:text-indigo-200">{decision_summary?.acting_now_saves}</span> ({decision_summary?.savings_pct}%)
        </p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400/80 mt-1.5">{decision_summary?.verdict}</p>
      </div>
    </div>
  );
}
