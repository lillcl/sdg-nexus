// src/components/WorldMap/MapLegend.tsx
import { useMapStore } from '@/store';
import { SDG_GOALS } from '@/types';

export function MapLegend() {
  const { selectedGoal } = useMapStore();
  const label = selectedGoal
    ? SDG_GOALS.find((g) => g.goal === selectedGoal)?.short
    : 'Overall SDG Score';

  return (
    <div className="absolute bottom-6 left-4 z-20 bg-black/70 backdrop-blur rounded-xl border border-slate-700 p-3">
      <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {[
        ['> 80',    '#22c55e'],
        ['70–80',   '#84cc16'],
        ['60–70',   '#eab308'],
        ['50–60',   '#f97316'],
        ['< 50',    '#ef4444'],
        ['No data', '#1e2d42'],
      ].map(([l, c]) => (
        <div key={l} className="flex items-center gap-2 mb-1">
          <span className="w-4 h-3 rounded-sm flex-shrink-0" style={{ background: c }} />
          <span className="text-[11px] text-slate-300">{l}</span>
        </div>
      ))}
    </div>
  );
}
