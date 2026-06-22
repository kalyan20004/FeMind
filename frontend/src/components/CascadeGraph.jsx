export default function CascadeGraph({ cascade }) {
  if (!cascade || !cascade.cascade_chain) return null;

  return (
    <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md p-5 overflow-y-auto">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-wide">Failure Cascade Prediction</h3>
      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{cascade.summary}</p>
      </div>
      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-red-500 before:via-orange-500 before:to-amber-500">
        {cascade.cascade_chain.map((step, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-900 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
              {idx + 1}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-slate-900 dark:text-slate-200 tracking-wide">{step.asset_id}</div>
                <time className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20">In {step.time_to_impact_hours} hrs</time>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">{step.reason}</div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded w-fit border border-amber-200 dark:border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                Risk: {step.failure_probability_pct}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
