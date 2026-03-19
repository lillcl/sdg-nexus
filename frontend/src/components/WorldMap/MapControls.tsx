// src/components/WorldMap/MapControls.tsx
import { Globe } from 'lucide-react';
import { useMapStore } from '@/store';
import { SDG_GOALS } from '@/types';

export function MapControls() {
  const { selectedGoal, setSelectedGoal } = useMapStore();
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-xs">
      <button
        onClick={() => setSelectedGoal(null)}
        title="Overall Score"
        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
          selectedGoal === null ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
        }`}
        style={{ background: '#1e3a5f' }}
      >
        <Globe size={14} className="text-white" />
      </button>
      {SDG_GOALS.map((g) => (
        <button
          key={g.goal}
          onClick={() => setSelectedGoal(g.goal)}
          title={g.title}
          className={`w-8 h-8 rounded text-xs font-bold text-white transition-all ${
            selectedGoal === g.goal ? 'ring-2 ring-white scale-110' : 'opacity-65 hover:opacity-100'
          }`}
          style={{ background: g.color }}
        >
          {g.goal}
        </button>
      ))}
    </div>
  );
}
