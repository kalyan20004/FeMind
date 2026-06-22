export default function AlertBanner({ alert }) {
  const colors = {
    CRITICAL: 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    WARNING: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  };

  return (
    <div className={`backdrop-blur-sm border-l-4 border-y border-r border-slate-200 dark:border-slate-800 rounded-r-lg px-4 py-3 mb-3 flex items-center gap-3 ${colors[alert.severity] || colors.WARNING}`}>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
      <div>
        <p className="text-sm font-bold tracking-wide">{alert.severity}: {alert.asset_id}</p>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">{alert.message}</p>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto font-mono">{alert.timestamp.replace('T', ' ')}</span>
    </div>
  );
}
