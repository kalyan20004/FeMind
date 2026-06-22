export default function AssetCard({ asset, selected, onClick }) {
  const statusColors = {
    CRITICAL: { bg: 'bg-red-50 dark:bg-red-500/5', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', ring: 'ring-red-500/50', bar: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
    WARNING:  { bg: 'bg-amber-50 dark:bg-amber-500/5', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', ring: 'ring-amber-500/50', bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
    HEALTHY:  { bg: 'bg-emerald-50 dark:bg-emerald-500/5', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', ring: 'ring-emerald-500/50', bar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  };

  const color = statusColors[asset.status] || statusColors.HEALTHY;
  const healthPct = Math.round(asset.health_score);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer rounded-xl border backdrop-blur-md p-5 transition-all duration-300 ${color.bg} ${color.border}
        ${selected ? `ring-1 ${color.ring} shadow-xl shadow-slate-200 dark:shadow-black/50 -translate-y-1 bg-white dark:bg-slate-800/80` : 'bg-white/80 dark:bg-slate-900/50 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800/80'}`}
    >
      {/* Status dot + ID */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color.dot} ${asset.status === 'CRITICAL' ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-300">{asset.asset_id}</span>
      </div>

      {/* Asset type */}
      <p className="text-sm font-semibold text-slate-800 dark:text-white mb-4 capitalize tracking-wide">
        {asset.asset_type.replace('_', ' ')}
      </p>

      {/* Health score */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <span>Health Score</span>
          <span className={`font-bold ${color.text}`}>{healthPct}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`${color.bar} h-1.5 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${color.bg} ${color.text} border ${color.border}`}>
          {asset.status}
        </span>
      </div>

      {/* Key readings */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-y-2 gap-x-1 items-center">
        <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Vibration</div>
        <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 text-right">{asset.vibration} <span className="text-[10px] text-slate-400 dark:text-slate-500">mm/s</span></div>
        <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Temp</div>
        <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 text-right">{asset.temperature} <span className="text-[10px] text-slate-400 dark:text-slate-500">°C</span></div>
      </div>
    </div>
  );
}
