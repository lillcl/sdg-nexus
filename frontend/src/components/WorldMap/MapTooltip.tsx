// MapTooltip — shows country name, score, SDG rating indicator
import { useMapStore } from '@/store';

const DASH_COLOR: Record<string, string> = {
  green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444',
};
const DASH_LABEL: Record<string, string> = {
  green: 'On Track', yellow: 'Moderately Improving',
  orange: 'Significant Challenges', red: 'Major Challenges',
};

export function MapTooltip() {
  const { tooltip, countryData, selectedGoal } = useMapStore();
  if (!tooltip.visible) return null;

  // Get goal dash color for selected goal
  const cd = Object.values(countryData).find(c => c.name === tooltip.name);
  const dashColor = selectedGoal && cd ? (cd as any).goal_dashes?.[String(selectedGoal)] : null;
  const tags: string[] = (cd as any)?.tags || [];

  return (
    <div
      className="fixed z-50 pointer-events-none bg-[#0a1525]/95 border border-slate-700 rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-sm min-w-[160px]"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className="flex items-center gap-2 mb-1">
        <p className="text-white text-sm font-semibold">{tooltip.name}</p>
        {tags.map(t => (
          <span key={t} className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
            t === 'LDC' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-800/60' :
            t === 'LLDC' ? 'bg-blue-900/50 text-blue-400 border-blue-800/60' :
            'bg-cyan-900/50 text-cyan-400 border-cyan-800/60'
          }`}>{t}</span>
        ))}
      </div>
      {tooltip.score != null ? (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            {selectedGoal ? `SDG ${selectedGoal}` : 'SDG Index'}:
          </span>
          <span className="text-white font-mono font-bold text-xs">{tooltip.score.toFixed(1)}</span>
          {dashColor && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: DASH_COLOR[dashColor] + '22', color: DASH_COLOR[dashColor], border: `1px solid ${DASH_COLOR[dashColor]}44` }}>
              {DASH_LABEL[dashColor] || dashColor}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 mt-0.5">No SDR 2025 data</p>
      )}
    </div>
  );
}
