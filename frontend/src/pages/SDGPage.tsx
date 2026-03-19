// SDGPage.tsx — full SDG explorer with targets, indicators, and country data
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, ExternalLink, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { SDG_FULL_DATA } from '@/data/sdgGoals';
import { SDR_INDICATORS_META, SDR_COUNTRIES, SDR_COUNTRY_LIST } from '@/data/sdr2025';

const DASH_COLOR: Record<string, string> = {
  green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444',
};
const DASH_LABEL: Record<string, string> = {
  green: 'SDG Achievement', yellow: 'Challenges Remain',
  orange: 'Significant Challenges', red: 'Major Challenges',
};

function TrendArrow({ t }: { t: string }) {
  if (t === '↑' || t === '➚') return <TrendingUp size={12} className="text-green-400"/>;
  if (t === '↓' || t === '➘') return <TrendingDown size={12} className="text-red-400"/>;
  return <Minus size={12} className="text-slate-500"/>;
}

// SDG icon tile — uses official open-sdg.org PNG images
function SdgIcon({ goal, size = 40 }: { goal: number; size?: number }) {
  const data = SDG_FULL_DATA.find(g => g.goal === goal);
  const color = data?.color ?? '#19486A';
  return (
    <img
      src={`https://open-sdg.org/sdg-translations/assets/img/goals/en/${goal}.png`}
      alt={`SDG ${goal}`}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 6, display: 'block' }}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = 'none';
        const div = document.createElement('div');
        div.style.cssText = `width:${size}px;height:${size}px;background:${color};border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:${Math.round(size*0.3)}px`;
        div.textContent = String(goal);
        img.parentNode?.insertBefore(div, img);
      }}
    />
  );
}

function GoalCard({ g, isActive, onClick }: { g: typeof SDG_FULL_DATA[0]; isActive: boolean; onClick: () => void }) {
  const countryCount = Object.values(SDR_COUNTRIES).filter(c => c.goal_scores?.[String(g.goal)] != null).length;
  const scores = Object.values(SDR_COUNTRIES).map(c => c.goal_scores?.[String(g.goal)]).filter(Boolean) as number[];
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <button onClick={onClick}
      className={`text-left p-3 rounded-2xl border-2 transition-all hover:scale-[1.01] ${
        isActive ? 'shadow-lg scale-[1.01]' : 'hover:opacity-90'
      }`}
      style={isActive
        ? { borderColor: g.color, background: g.color + '22', boxShadow: `0 0 20px ${g.color}44` }
        : { borderColor: g.color + '55', background: '#0f172a' }}>
      {/* SDG Icon — official image */}
      <div className="w-full rounded-xl overflow-hidden mb-2 flex items-center justify-center bg-white/5" style={{ height: 100 }}>
        <SdgIcon goal={g.goal} size={90}/>
      </div>
      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[9px]">Avg</span>
          <span className="text-white font-mono text-[10px] font-bold">{avg.toFixed(0)}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, background: g.color }}/>
        </div>
      </div>
    </button>
  );
}

function IndicatorCountryBar({ sdrCode, goal }: { sdrCode: string; goal: number }) {
  const meta = SDR_INDICATORS_META[sdrCode];
  if (!meta) return null;

  const countries = SDR_COUNTRY_LIST.filter(c => c.indicators?.[sdrCode]?.v != null);
  const top3 = [...countries].sort((a, b) => {
    const av = a.indicators[sdrCode].n ?? 0;
    const bv = b.indicators[sdrCode].n ?? 0;
    return bv - av;
  }).slice(0, 3);
  const bottom3 = [...countries].sort((a, b) => {
    const av = a.indicators[sdrCode].n ?? 0;
    const bv = b.indicators[sdrCode].n ?? 0;
    return av - bv;
  }).slice(0, 3);

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div>
        <p className="text-[9px] text-slate-600 mb-1.5 flex items-center gap-1"><ArrowUp size={9} className="text-green-500"/> Best performing</p>
        <div className="space-y-1">
          {top3.map(c => (
            <div key={c.iso3} className="flex items-center gap-1.5">
              <img src={`https://flagcdn.com/16x12/${c.iso2}.png`} alt="" className="w-4 h-3 object-cover rounded-[2px]"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
              <span className="text-slate-400 text-[10px] flex-1 truncate">{c.name}</span>
              <span className="text-green-400 font-mono text-[10px]">{c.indicators[sdrCode].v?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[9px] text-slate-600 mb-1.5 flex items-center gap-1"><ArrowDown size={9} className="text-red-500"/> Needs improvement</p>
        <div className="space-y-1">
          {bottom3.map(c => (
            <div key={c.iso3} className="flex items-center gap-1.5">
              <img src={`https://flagcdn.com/16x12/${c.iso2}.png`} alt="" className="w-4 h-3 object-cover rounded-[2px]"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
              <span className="text-slate-400 text-[10px] flex-1 truncate">{c.name}</span>
              <span className="text-red-400 font-mono text-[10px]">{c.indicators[sdrCode].v?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SDGPage() {
  const [activeGoal, setActiveGoal] = useState<number | null>(null);
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'overview' | 'detail'>('overview');

  const goal = SDG_FULL_DATA.find(g => g.goal === activeGoal);

  const toggleTarget = (code: string) => {
    setExpandedTargets(prev => {
      const n = new Set(prev);
      n.has(code) ? n.delete(code) : n.add(code);
      return n;
    });
  };
  const toggleIndicator = (code: string) => {
    setExpandedIndicators(prev => {
      const n = new Set(prev);
      n.has(code) ? n.delete(code) : n.add(code);
      return n;
    });
  };

  // Top 3 and bottom 3 countries per goal for overview
  const goalRanks = useMemo(() => {
    const result: Record<number, { top: typeof SDR_COUNTRY_LIST; bottom: typeof SDR_COUNTRY_LIST }> = {};
    for (let g = 1; g <= 17; g++) {
      const withScore = SDR_COUNTRY_LIST.filter(c => c.goal_scores?.[String(g)] != null);
      const sorted = [...withScore].sort((a, b) => (b.goal_scores[String(g)] ?? 0) - (a.goal_scores[String(g)] ?? 0));
      result[g] = { top: sorted.slice(0, 3), bottom: sorted.slice(-3).reverse() };
    }
    return result;
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#040810]">
      {/* Left sidebar: goal grid */}
      <div className="w-96 flex-shrink-0 border-r border-slate-800 overflow-y-auto p-4 bg-[#060b14]">
        <div className="mb-4">
          <h2 className="text-white font-bold text-base">UN SDG Explorer</h2>
          <p className="text-slate-500 text-xs mt-1">17 Goals · 169 Targets · SDR 2025 Data</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SDG_FULL_DATA.map(g => (
            <GoalCard key={g.goal} g={g} isActive={activeGoal === g.goal}
              onClick={() => { setActiveGoal(g.goal); setView('detail'); }}/>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!activeGoal ? (
          // Overview: global SDG stats
          <div>
            <h1 className="text-white font-bold text-2xl mb-2">2030 Agenda for Sustainable Development</h1>
            <p className="text-slate-400 text-sm mb-8 max-w-3xl">
              The 17 Sustainable Development Goals were adopted by all UN Member States in 2015 as a universal call to action
              to end poverty, protect the planet and ensure that all people enjoy peace and prosperity by 2030.
              Data from the SDSN Sustainable Development Report 2025.
            </p>

            {/* Global summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { val: '17', label: 'Global Goals', color: '#26BDE2' },
                { val: '169', label: 'Targets', color: '#4C9F38' },
                { val: '232', label: 'Indicators', color: '#FCC30B' },
                { val: '193', label: 'Countries', color: '#E5243B' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-slate-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-goal mini leaderboards */}
            <h2 className="text-white font-bold text-lg mb-4">Top & Bottom Performers by Goal (SDR 2025)</h2>
            <div className="space-y-4">
              {SDG_FULL_DATA.map(g => {
                const { top, bottom } = goalRanks[g.goal];
                const scores = Object.values(SDR_COUNTRIES).map(c => c.goal_scores?.[String(g.goal)]).filter(Boolean) as number[];
                const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                return (
                  <div key={g.goal} className="border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors cursor-pointer"
                    onClick={() => { setActiveGoal(g.goal); }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ background: g.color }}>
                        {g.goal}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{g.title}</p>
                        <p className="text-slate-600 text-[10px]">Global avg: <span className="font-mono">{avg.toFixed(1)}</span></p>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="h-full rounded-full" style={{ width: `${avg}%`, background: g.color }}/>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-green-600 mb-1">🏆 Leaders</p>
                        {top.map(c => (
                          <div key={c.iso3} className="flex items-center gap-1.5 mb-0.5">
                            <img src={`https://flagcdn.com/16x12/${c.iso2}.png`} alt=""
                              className="w-4 h-3 object-cover rounded-[2px] flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                            <span className="text-slate-400 text-[10px] flex-1 truncate">{c.name}</span>
                            <span className="text-green-400 font-mono text-[10px]">{c.goal_scores[String(g.goal)]?.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[9px] text-red-600 mb-1">⚠️ Needs Support</p>
                        {bottom.map(c => (
                          <div key={c.iso3} className="flex items-center gap-1.5 mb-0.5">
                            <img src={`https://flagcdn.com/16x12/${c.iso2}.png`} alt=""
                              className="w-4 h-3 object-cover rounded-[2px] flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                            <span className="text-slate-400 text-[10px] flex-1 truncate">{c.name}</span>
                            <span className="text-red-400 font-mono text-[10px]">{c.goal_scores[String(g.goal)]?.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : goal ? (
          // Goal detail view
          <div>
            {/* Goal header */}
            <div className="flex items-start gap-4 mb-8 p-6 rounded-2xl border"
              style={{ background: goal.color + '11', borderColor: goal.color + '44' }}>
              <SdgIcon goal={goal.goal} size={64}/>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full text-white/70"
                    style={{ background: goal.color + '44' }}>SDG {goal.goal}</span>
                </div>
                <h1 className="text-white font-bold text-2xl mb-2">{goal.title}</h1>
                {/* Short tagline */}
                <p className="text-white/80 text-sm font-medium mb-3 italic" style={{ color: goal.color }}>
                  {goal.description.split('.')[0]}.
                </p>
                <div className="w-16 h-px mb-3" style={{ background: goal.color + '80' }}/>
                {/* Full description */}
                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                  {goal.description.split('.').slice(1).join('.').trim()}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-slate-500 text-xs">{goal.targets.length} targets</span>
                  <span className="text-slate-500 text-xs">
                    {goal.targets.reduce((s, t) => s + t.indicators.length, 0)} SDR indicators
                  </span>
                </div>
              </div>
            </div>

            {/* Top / Bottom countries for this goal */}
            {goalRanks[goal.goal] && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    🏆 SDG {goal.goal} Leaders
                  </h3>
                  {goalRanks[goal.goal].top.map((c, i) => (
                    <div key={c.iso3} className="flex items-center gap-2 mb-2">
                      <span className="text-slate-600 text-xs w-4">{i+1}</span>
                      <img src={`https://flagcdn.com/20x15/${c.iso2}.png`} alt="" className="w-5 h-4 object-cover rounded-sm"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                      <span className="text-slate-300 text-xs flex-1">{c.name}</span>
                      <span className="text-green-400 font-mono text-xs font-bold">{c.goal_scores[String(goal.goal)]?.toFixed(1)}</span>
                      {c.goal_trends?.[String(goal.goal)] && <TrendArrow t={c.goal_trends[String(goal.goal)]}/>}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    ⚠️ Needs Most Support
                  </h3>
                  {goalRanks[goal.goal].bottom.map((c, i) => (
                    <div key={c.iso3} className="flex items-center gap-2 mb-2">
                      <img src={`https://flagcdn.com/20x15/${c.iso2}.png`} alt="" className="w-5 h-4 object-cover rounded-sm"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                      <span className="text-slate-300 text-xs flex-1">{c.name}</span>
                      <span className="text-red-400 font-mono text-xs font-bold">{c.goal_scores[String(goal.goal)]?.toFixed(1)}</span>
                      {c.goal_trends?.[String(goal.goal)] && <TrendArrow t={c.goal_trends[String(goal.goal)]}/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targets & Indicators */}
            <h2 className="text-white font-bold text-base mb-4">Targets & Indicators</h2>
            <div className="space-y-2">
              {goal.targets.map(target => (
                <div key={target.code} className="border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleTarget(target.code)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-slate-800/30 transition-colors text-left">
                    <div className="w-14 flex-shrink-0">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{ background: goal.color + '22', color: goal.color }}>
                        {target.code}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed flex-1">{target.description}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {target.indicators.length > 0 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                          {target.indicators.length} ind.
                        </span>
                      )}
                      {expandedTargets.has(target.code)
                        ? <ChevronDown size={14} className="text-slate-500"/>
                        : <ChevronRight size={14} className="text-slate-600"/>}
                    </div>
                  </button>

                  {expandedTargets.has(target.code) && target.indicators.length > 0 && (
                    <div className="border-t border-slate-800 bg-slate-900/30 divide-y divide-slate-800/50">
                      {target.indicators.map(ind => {
                        const meta = ind.sdr_code ? SDR_INDICATORS_META[ind.sdr_code] : null;
                        const isExpandedInd = expandedIndicators.has(ind.code);
                        return (
                          <div key={ind.code}>
                            <button
                              onClick={() => toggleIndicator(ind.code)}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-800/20 transition-colors text-left">
                              <span className="text-[9px] font-mono text-slate-600 w-10 flex-shrink-0 mt-0.5">{ind.code}</span>
                              <div className="flex-1">
                                <p className="text-slate-400 text-xs">{ind.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-mono text-slate-600">{ind.unit}</span>
                                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                                    ind.direction === 'higher_better'
                                      ? 'text-green-600 bg-green-900/20'
                                      : 'text-red-600 bg-red-900/20'
                                  }`}>
                                    {ind.direction === 'higher_better' ? '↑ higher = better' : '↓ lower = better'}
                                  </span>
                                  {meta?.source && (
                                    <span className="text-[9px] text-slate-700 truncate max-w-[120px]">{meta.source}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {ind.sdr_code && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-blue-600 bg-blue-900/20">
                                    SDR data
                                  </span>
                                )}
                                <BarChart3 size={12} className="text-slate-600"/>
                              </div>
                            </button>

                            {isExpandedInd && ind.sdr_code && (
                              <div className="px-4 pb-3 ml-14 border-t border-slate-800/40 pt-3">
                                <IndicatorCountryBar sdrCode={ind.sdr_code} goal={goal.goal}/>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* External links */}
            <div className="mt-8 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <p className="text-slate-500 text-xs mb-3">External Resources</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://sdgs.un.org/goals/goal${goal.goal}`} target="_blank" rel="noopener"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink size={10}/> UN SDG {goal.goal} Page
                </a>
                <a href="https://www.sdgindex.org/" target="_blank" rel="noopener"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink size={10}/> SDSN SDR 2025
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
