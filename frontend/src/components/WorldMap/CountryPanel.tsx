// CountryPanel.tsx — country detail sidebar using SDR 2025 data
import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ExternalLink, Globe2 } from 'lucide-react';
import { useMapStore } from '@/store';
import { SDR_COUNTRIES, SDR_INDICATORS_META } from '@/data/sdr2025';
import { SDG_GOALS } from '@/types';

const DASH_COLOR: Record<string, string> = {
  green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444',
};
const DASH_BG: Record<string, string> = {
  green: '#14532d', yellow: '#422006', orange: '#431407', red: '#450a0a',
};
const DASH_LABEL: Record<string, string> = {
  green: 'SDG Achievement', yellow: 'Challenges Remain',
  orange: 'Significant Challenges', red: 'Major Challenges',
};

function Trend({ t }: { t?: string }) {
  if (!t) return <Minus size={11} className="text-slate-600"/>;
  if (t === '↑' || t === '➚') return <TrendingUp size={11} className="text-green-400"/>;
  if (t === '↓' || t === '➘') return <TrendingDown size={11} className="text-red-400"/>;
  return <Minus size={11} className="text-slate-500"/>;
}

// SDG indicator groups: which sdr_codes belong to which goal
const GOAL_INDICATOR_PREFIX: Record<number, string> = {};
for (let g = 1; g <= 17; g++) GOAL_INDICATOR_PREFIX[g] = `sdg${g}_`;

export default function CountryPanel() {
  const { selectedCountry, setSelectedCountry, selectedGoal, setSelectedGoal } = useMapStore();
  const [activeGoalTab, setActiveGoalTab] = useState<number | null>(null);

  const iso3 = selectedCountry;
  const sdrCountry = iso3 ? SDR_COUNTRIES[iso3] : null;
  const cd = (useMapStore.getState().countryData[iso3 ?? '']) as any;

  useEffect(() => {
    if (selectedGoal) setActiveGoalTab(selectedGoal);
    else setActiveGoalTab(null);
  }, [selectedGoal, selectedCountry]);

  if (!iso3 || !sdrCountry) return null;

  const tags = sdrCountry.tags || (cd?.tags) || [];

  // Compute global avg for comparison
  const globalAvgScore = 67;

  const goalIndicators = activeGoalTab
    ? Object.entries(sdrCountry.indicators).filter(([k]) => k.startsWith(`sdg${activeGoalTab}_`))
    : [];

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-[#060b14]/96 border-l border-slate-800 backdrop-blur-sm flex flex-col z-30 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {sdrCountry.iso2 && (
              <img src={`https://flagcdn.com/40x30/${sdrCountry.iso2}.png`} alt=""
                className="w-10 h-7 object-cover rounded shadow"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            )}
            <div>
              <h2 className="text-white font-bold text-sm">{sdrCountry.name}</h2>
              <p className="text-slate-500 text-[10px]">{sdrCountry.region} · {sdrCountry.income_group}</p>
            </div>
          </div>
          <button onClick={() => setSelectedCountry(null)}
            className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={14}/>
          </button>
        </div>

        {/* Tags: LDC / LLDC / SIDS */}
        {tags.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {tags.map((t: string) => (
              <span key={t} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                t === 'LDC' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40' :
                t === 'LLDC' ? 'bg-blue-900/40 text-blue-400 border-blue-700/40' :
                'bg-cyan-900/40 text-cyan-400 border-cyan-700/40'
              }`}>{t}</span>
            ))}
          </div>
        )}

        {/* Overall score */}
        {sdrCountry.score != null && (
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">2025 SDG Index Score</span>
              <span className="text-white font-mono font-bold text-lg">{sdrCountry.score.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                style={{ width: `${sdrCountry.score}%` }}/>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>Rank #{sdrCountry.rank}</span>
              <span>Global avg ~{globalAvgScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Goal tabs — mini buttons */}
      <div className="flex-shrink-0 p-2 border-b border-slate-800 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button onClick={() => setActiveGoalTab(null)}
            className={`text-[9px] px-2 py-1 rounded-md font-medium transition-all ${
              !activeGoalTab ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-400'
            }`}>All</button>
          {SDG_GOALS.map(g => {
            const dash = sdrCountry.goal_dashes?.[String(g.goal)];
            const score = sdrCountry.goal_scores?.[String(g.goal)];
            return (
              <button key={g.goal}
                onClick={() => { setActiveGoalTab(g.goal); setSelectedGoal(g.goal); }}
                title={`SDG ${g.goal}: ${g.title} — ${score?.toFixed(1) ?? 'N/A'}`}
                className={`text-[9px] px-1.5 py-1 rounded-md font-bold font-mono transition-all ${
                  activeGoalTab === g.goal ? 'text-white scale-110' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  background: activeGoalTab === g.goal ? g.color : g.color + '33',
                  outline: activeGoalTab === g.goal ? `2px solid ${g.color}` : 'none',
                }}>
                {g.goal}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!activeGoalTab ? (
          // All goals overview
          <>
            <p className="text-slate-600 text-[10px] mb-2 px-1">All 17 SDG Goal Scores</p>
            {SDG_GOALS.map(g => {
              const score = sdrCountry.goal_scores?.[String(g.goal)];
              const dash = sdrCountry.goal_dashes?.[String(g.goal)];
              const trend = sdrCountry.goal_trends?.[String(g.goal)];
              const diff = score != null ? score - globalAvgScore : null;
              return (
                <button key={g.goal}
                  onClick={() => setActiveGoalTab(g.goal)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 transition-colors text-left">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                    style={{ background: g.color }}>
                    {g.goal}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-[10px] truncate">{g.short}</p>
                    {score != null && (
                      <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${score}%`, background: g.color }}/>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Trend t={trend}/>
                    {score != null ? (
                      <>
                        <span className="text-white font-mono text-[10px]">{score.toFixed(1)}</span>
                        {diff != null && (
                          <span className={`text-[9px] font-mono ${diff >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-700 text-[9px]">—</span>
                    )}
                    {dash && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: DASH_COLOR[dash] || '#555' }}/>
                    )}
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          // Single goal detail
          <>
            {(() => {
              const g = SDG_GOALS.find(x => x.goal === activeGoalTab)!;
              const score = sdrCountry.goal_scores?.[String(activeGoalTab)];
              const dash = sdrCountry.goal_dashes?.[String(activeGoalTab)];
              const trend = sdrCountry.goal_trends?.[String(activeGoalTab)];
              return (
                <>
                  {/* Goal score card */}
                  <div className="p-3 rounded-xl border mb-3"
                    style={{ background: g.color + '11', borderColor: g.color + '44' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: g.color }}>
                        {g.goal}
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs">{g.title}</p>
                        {dash && (
                          <p className="text-[9px] font-medium" style={{ color: DASH_COLOR[dash] }}>
                            {DASH_LABEL[dash]}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Trend t={trend}/>
                        {score != null && (
                          <span className="text-white font-mono font-bold text-sm">{score.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    {score != null && (
                      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: g.color }}/>
                      </div>
                    )}
                  </div>

                  {/* Indicators for this goal */}
                  {goalIndicators.length > 0 ? (
                    <>
                      <p className="text-slate-600 text-[10px] px-1 mb-1">SDR 2025 Indicators</p>
                      {goalIndicators.map(([code, val]) => {
                        const meta = SDR_INDICATORS_META[code];
                        if (!meta || val.v == null) return null;
                        return (
                          <div key={code} className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <p className="text-slate-400 text-[10px] leading-snug mb-1">{meta.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono font-bold text-xs">{val.v.toFixed(1)}</span>
                              {val.c && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                                  style={{ color: DASH_COLOR[val.c], background: DASH_COLOR[val.c] + '22' }}>
                                  {val.c}
                                </span>
                              )}
                              {val.t && <Trend t={val.t}/>}
                              {val.n != null && (
                                <div className="flex-1 bg-slate-800 rounded-full h-1 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${val.n}%`, background: g.color }}/>
                                </div>
                              )}
                              {val.y && <span className="text-slate-700 text-[9px] font-mono">{val.y}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-slate-600 text-xs text-center py-4">No indicator data for this goal</p>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* SDSN link */}
        <a href={`https://dashboards.sdgindex.org/profiles/${sdrCountry.iso3.toLowerCase()}`}
          target="_blank" rel="noopener"
          className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors mt-2">
          <Globe2 size={12} className="text-blue-400"/>
          <span className="text-blue-400 text-xs">View Full SDR 2025 Profile</span>
          <ExternalLink size={10} className="text-blue-400 ml-auto"/>
        </a>
      </div>
    </div>
  );
}
