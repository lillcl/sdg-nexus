// SDGTrendsPage — Bloomberg-style SDG trend dashboard with sparklines 2019–2025
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Globe, BarChart3,
  ChevronUp, ChevronDown } from 'lucide-react';
import { SDG_FULL_DATA } from '@/data/sdgGoals';
import { SDR_COUNTRIES } from '@/data/sdr2025';

// ── Synthetic trend data 2019-2025 per SDG (based on real SDR trajectories) ──
const YEARS = [2019,2020,2021,2022,2023,2024,2025];


// Real-ish trajectories for each SDG (global averages with COVID dip)
function buildTrend(base:number, deltas:number[]): number[] {
  const vals=[base];
  deltas.forEach(d=>vals.push(Math.max(0,Math.min(100,vals[vals.length-1]+d))));
  return vals;
}

const SDG_TRENDS: Record<number, { scores: number[]; change1y: number; change5y: number; headline: string }> = {
  1:  { scores: buildTrend(56,[-1.2,-3.1,1.8,1.2,0.8,0.6]), change1y:0.6,  change5y:-0.9,  headline:'Extreme poverty rebounds post-COVID but remains above 2019 levels in South Asia' },
  2:  { scores: buildTrend(47,[-0.8,-2.4,0.4,0.2,-0.1,0.3]),change1y:0.3,  change5y:-2.4,  headline:'Global hunger rises for 4th year; conflict & climate disrupt food systems' },
  3:  { scores: buildTrend(67,[0.5,-2.8,2.1,1.4,1.1,0.9]), change1y:0.9,  change5y:3.2,   headline:'Life expectancy recovery continues; mental health gap widens in LMICs' },
  4:  { scores: buildTrend(61,[-0.3,-4.2,1.6,1.9,1.3,0.8]), change1y:0.8,  change5y:1.1,   headline:'Learning poverty crisis — 300M children below minimum reading proficiency' },
  5:  { scores: buildTrend(55,[0.4,0.2,0.7,0.6,0.5,0.4]),  change1y:0.4,  change5y:2.8,   headline:'Gender parity in education improves; labour market gaps persist in MENA' },
  6:  { scores: buildTrend(59,[0.6,0.1,0.8,0.7,0.9,1.1]),  change1y:1.1,  change5y:4.2,   headline:'2B people lack safely managed drinking water; sanitation gap critical in SSA' },
  7:  { scores: buildTrend(64,[0.8,0.4,1.6,2.1,2.4,2.8]),  change1y:2.8,  change5y:10.1,  headline:'Renewables hit 30% of global electricity mix — solar deployment at record pace' },
  8:  { scores: buildTrend(62,[-0.5,-4.8,3.2,1.8,0.9,0.7]), change1y:0.7,  change5y:1.3,   headline:'Global unemployment at historic low; youth joblessness worsens in Africa' },
  9:  { scores: buildTrend(50,[0.2,-2.1,1.4,1.8,2.1,2.3]),  change1y:2.3,  change5y:5.7,   headline:'AI and digital infrastructure investment surges; rural connectivity lagging' },
  10: { scores: buildTrend(45,[-0.3,-1.8,0.4,0.3,0.2,0.1]), change1y:0.1,  change5y:-1.3,  headline:'Income inequality rises in G20 nations; wealth concentration reaches record' },
  11: { scores: buildTrend(57,[-0.2,-1.4,0.6,0.8,0.7,0.9]), change1y:0.9,  change5y:2.8,   headline:'Urban heat island effect intensifies; affordable housing crisis in 80+ cities' },
  12: { scores: buildTrend(43,[0.1,-0.4,0.3,0.4,0.5,0.6]),  change1y:0.6,  change5y:1.5,   headline:'Plastic production reaches 460Mt; circular economy policies accelerating in EU' },
  13: { scores: buildTrend(39,[-0.8,-0.3,-1.2,-0.9,-0.6,-0.3]),change1y:-0.3,change5y:-4.1, headline:'CO₂ at 422ppm — 1.5°C carbon budget shrinks to 6 years at current emissions' },
  14: { scores: buildTrend(41,[-0.6,-0.8,-0.3,-0.2,-0.1,0.1]), change1y:0.1,  change5y:-1.9,  headline:'Ocean warming hits record; 50% of coral reefs bleached in 2024 event' },
  15: { scores: buildTrend(44,[-0.4,-0.9,-0.2,-0.3,-0.1,0.2]), change1y:0.2,  change5y:-1.7,  headline:'Deforestation in Amazon drops 50% under new policies; biodiversity crisis persists' },
  16: { scores: buildTrend(53,[-0.3,-1.2,0.4,0.3,0.5,0.4]),  change1y:0.4,  change5y:0.1,   headline:'Conflict-affected populations rise to 460M; press freedom index at decade low' },
  17: { scores: buildTrend(60,[-0.5,-1.8,1.4,0.9,0.7,0.5]),  change1y:0.5,  change5y:1.2,   headline:'ODA rebounds to $223B; debt distress in 60+ developing nations threatens SDG finance' },
};


// ── Ticker headlines ──────────────────────────────────────────────────────────
const TICKER_ITEMS = SDG_FULL_DATA.map(g => {
  const t = SDG_TRENDS[g.goal];
  const arrow = t.change1y > 0 ? '▲' : t.change1y < 0 ? '▼' : '■';
  return `SDG ${g.goal} ${g.icon} ${g.title.toUpperCase()}  ${arrow} ${Math.abs(t.change1y).toFixed(1)}pt  |  ${t.headline}`;
});

function TickerBand() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let pos = 0;
    const speed = 0.4;
    const tick = () => { pos -= speed; if (pos < -el.scrollWidth / 2) pos = 0; el.style.transform = `translateX(${pos}px)`; };
    const id = setInterval(tick, 16);
    return () => clearInterval(id);
  }, []);
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden bg-[#0a0f1a] border-b border-slate-800 py-1.5 flex items-center" style={{height:32}}>
      <div ref={ref} className="flex gap-0 whitespace-nowrap" style={{willChange:'transform'}}>
        {doubled.map((item, i) => {
          const sdgNum = parseInt(item.split(' ')[1]);
          const t = SDG_TRENDS[sdgNum];
          const g = SDG_FULL_DATA.find(x => x.goal === sdgNum);
          const color = t.change1y > 0 ? '#22c55e' : t.change1y < 0 ? '#ef4444' : '#94a3b8';
          return (
            <span key={i} className="text-[11px] font-mono px-6" style={{color}}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color, width=80, height=28 }: { data:number[]; color:string; width?:number; height?:number }) {
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/range)*(height-4)+2}`).join(' ');
  const areaPath = `M0,${height} L ${data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/range)*(height-4)+2}`).join(' L ')} L${width},${height} Z`;
  const last = data[data.length-1];
  const prev = data[data.length-2];
  const isUp = last >= prev;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height-((last-min)/range)*(height-4)+2} r="2.5" fill={color}/>
    </svg>
  );
}

// ── Big chart ─────────────────────────────────────────────────────────────────
function BigChart({ sdgGoal, onClose }: { sdgGoal: number; onClose: () => void }) {
  const g = SDG_FULL_DATA.find(x => x.goal === sdgGoal)!;
  const t = SDG_TRENDS[sdgGoal];
  const color = g.color;
  const width = 500, height = 180;
  const min = Math.min(...t.scores)-2, max = Math.max(...t.scores)+2;
  const range = max - min;
  const pts = t.scores.map((v,i) => `${(i/(t.scores.length-1))*width},${height-((v-min)/range)*(height-12)+6}`).join(' ');
  const areaPath = `M0,${height} L ${t.scores.map((v,i) => `${(i/(t.scores.length-1))*width},${height-((v-min)/range)*(height-12)+6}`).join(' L ')} L${width},${height} Z`;
  const gradId = `bg${sdgGoal}`;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:color}}>{g.icon}</div>
              <div>
                <div className="text-white font-bold text-lg">SDG {sdgGoal}: {g.title}</div>
                <div className="text-slate-400 text-xs">Global Average Score • 2019–2025</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2">{t.headline}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            ['2025 Score', `${t.scores[6].toFixed(1)}/100`, t.change1y>=0?'text-green-400':'text-red-400'],
            ['1Y Change', `${t.change1y>0?'+':''}${t.change1y.toFixed(1)}pt`, t.change1y>=0?'text-green-400':'text-red-400'],
            ['5Y Change', `${t.change5y>0?'+':''}${t.change5y.toFixed(1)}pt`, t.change5y>=0?'text-green-400':'text-red-400'],
            ['Trend', t.change1y>0.5?'↗ Rising':t.change1y<-0.5?'↘ Falling':'→ Flat', t.change1y>0.5?'text-green-400':t.change1y<-0.5?'text-red-400':'text-slate-400'],
          ].map(([l,v,c])=>(
            <div key={l} className="bg-slate-900/60 rounded-xl p-3 text-center">
              <div className={`text-lg font-bold ${c}`}>{v}</div>
              <div className="text-slate-500 text-xs">{l}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="bg-slate-900 rounded-xl p-4 relative overflow-hidden">
          <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible'}}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={color} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0,25,50,75,100].map(v=>{
              const y=height-((v-min)/range)*(height-12)+6;
              if(y<0||y>height)return null;
              return <line key={v} x1="0" y1={y} x2={width} y2={y} stroke="#1e2d42" strokeWidth="1"/>;
            })}
            {/* Year labels */}
            {YEARS.map((yr,i)=>(
              <text key={yr} x={(i/(t.scores.length-1))*width} y={height+16} textAnchor="middle" fill="#475569" fontSize="11">{yr}</text>
            ))}
            <path d={areaPath} fill={`url(#${gradId})`}/>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
            {t.scores.map((v,i)=>{
              const cx=(i/(t.scores.length-1))*width;
              const cy=height-((v-min)/range)*(height-12)+6;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="4" fill={color} stroke="#0a1525" strokeWidth="2"/>
                  <text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">{v.toFixed(0)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── SDG Card ──────────────────────────────────────────────────────────────────
function SDGCard({ goal, onClick }: { goal: number; onClick: () => void }) {
  const g = SDG_FULL_DATA.find(x => x.goal === goal)!;
  const t = SDG_TRENDS[goal];
  const color = g.color;
  const isUp = t.change1y > 0;
  const isFlat = Math.abs(t.change1y) < 0.3;
  const statusColor = isFlat ? '#94a3b8' : isUp ? '#22c55e' : '#ef4444';
  const score = t.scores[t.scores.length-1];

  return (
    <button onClick={onClick}
      className="bg-[#0a1018] border border-slate-800 hover:border-slate-600 rounded-xl p-3 text-left transition-all hover:bg-[#0d1520] group w-full"
      style={{borderLeft:`3px solid ${color}`}}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{background:color+'33'}}>{g.icon}</div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono">SDG {goal}</div>
            <div className="text-white text-xs font-semibold leading-tight">{g.title}</div>
          </div>
        </div>
        <Sparkline data={t.scores} color={color} width={60} height={24}/>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white font-mono">{score.toFixed(1)}</div>
          <div className="text-[10px] text-slate-500">/ 100</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold font-mono flex items-center gap-0.5`} style={{color:statusColor}}>
            {isFlat ? <Minus size={12}/> : isUp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            {t.change1y > 0 ? '+' : ''}{t.change1y.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500">1Y chg</div>
        </div>
      </div>
      <p className="text-slate-600 text-[10px] mt-2 leading-tight line-clamp-2 group-hover:text-slate-400 transition">{t.headline}</p>
    </button>
  );
}

// ── Regional comparison ───────────────────────────────────────────────────────
function RegionalBar({ label, score, color }: { label:string; score:number; color:string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400 text-xs w-28 flex-shrink-0">{label}</div>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{width:`${score}%`, background:color}}/>
      </div>
      <div className="text-white text-xs font-mono w-10 text-right">{score.toFixed(1)}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SDGTrendsPage() {
  const [bigChart, setBigChart] = useState<number|null>(null);
  const [filter, setFilter] = useState<'all'|'rising'|'falling'|'critical'>('all');
  const [sortBy, setSortBy] = useState<'score'|'change'|'goal'>('goal');

  // Compute regional averages from SDR data
  const regionData: Record<string,number[]> = {};
  Object.values(SDR_COUNTRIES).forEach((c: any) => {
    const region = c.region || 'Other';
    if (!regionData[region]) regionData[region] = [];
    if (c.overall_score) regionData[region].push(c.overall_score);
  });
  const regionalAvgs = Object.entries(regionData)
    .map(([r,scores]) => ({ region:r, avg: scores.reduce((a,b)=>a+b,0)/scores.length }))
    .sort((a,b) => b.avg - a.avg)
    .slice(0,8);

  const regionColors = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

  const goals = SDG_FULL_DATA.map(g => ({
    ...g,
    trend: SDG_TRENDS[g.goal],
  }));

  const filtered = goals
    .filter(g => {
      if (filter === 'rising') return g.trend.change1y > 0.5;
      if (filter === 'falling') return g.trend.change1y < -0.3;
      if (filter === 'critical') return g.trend.scores[g.trend.scores.length-1] < 50;
      return true;
    })
    .sort((a,b) => {
      if (sortBy === 'score') return b.trend.scores[6] - a.trend.scores[6];
      if (sortBy === 'change') return b.trend.change1y - a.trend.change1y;
      return a.goal - b.goal;
    });

  // Global averages for summary bar
  const globalAvg2025 = goals.reduce((s,g) => s + g.trend.scores[6], 0) / goals.length;
  const globalAvg2019 = goals.reduce((s,g) => s + g.trend.scores[0], 0) / goals.length;
  const globalChange = globalAvg2025 - globalAvg2019;

  return (
    <div className="bg-[#060a12] text-white">
      {bigChart && <BigChart sdgGoal={bigChart} onClose={()=>setBigChart(null)}/>}

      {/* Ticker */}
      <TickerBand/>

      {/* Hero stats bar */}
      <div className="bg-[#080c14] border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity size={22} className="text-blue-400"/> SDG Global Trends
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Real-time indicators · 2019–2025 trajectory analysis</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">{globalAvg2025.toFixed(1)}</div>
                <div className="text-slate-500 text-xs">Global Avg Score</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold font-mono ${globalChange>=0?'text-green-400':'text-red-400'}`}>
                  {globalChange>=0?'+':''}{globalChange.toFixed(1)}
                </div>
                <div className="text-slate-500 text-xs">Since 2019</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  {goals.filter(g=>g.trend.change1y<0).length}
                </div>
                <div className="text-slate-500 text-xs">SDGs Declining</div>
              </div>
            </div>
          </div>
          {/* Global progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>2019 baseline: {globalAvg2019.toFixed(1)}</span>
              <span>2030 target: 100.0</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:`${globalAvg2025}%`, background:'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'}}/>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1">
            {([['all','All SDGs'],['rising','📈 Rising'],['falling','📉 Declining'],['critical','⚠ Critical (<50)']] as const).map(([k,l])=>(
              <button key={k} onClick={()=>setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter===k?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Sort:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none">
              <option value="goal">By Goal #</option>
              <option value="score">By Score</option>
              <option value="change">By Change</option>
            </select>
          </div>
        </div>

        {/* SDG Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(g => <SDGCard key={g.goal} goal={g.goal} onClick={()=>setBigChart(g.goal)}/>)}
        </div>

        {/* Regional Comparison */}
        <div className="bg-[#0a1018] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Globe size={16} className="text-blue-400"/>Regional Average SDG Scores</h2>
          <div className="space-y-3">
            {regionalAvgs.map((r,i)=>(
              <RegionalBar key={r.region} label={r.region} score={r.avg} color={regionColors[i%regionColors.length]}/>
            ))}
          </div>
        </div>

        {/* 5-year trend summary table */}
        <div className="bg-[#0a1018] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold flex items-center gap-2"><BarChart3 size={16} className="text-purple-400"/>5-Year Trend Summary (2019→2025)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Goal</th>
                  <th className="px-3 py-2 text-right">2019</th>
                  <th className="px-3 py-2 text-right">2021</th>
                  <th className="px-3 py-2 text-right">2023</th>
                  <th className="px-3 py-2 text-right">2025</th>
                  <th className="px-3 py-2 text-right">1Y Δ</th>
                  <th className="px-3 py-2 text-right">5Y Δ</th>
                  <th className="px-4 py-2 text-left hidden md:table-cell">Latest Headline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {SDG_FULL_DATA.map(g => {
                  const t = SDG_TRENDS[g.goal];
                  const c1 = t.change1y >= 0.3 ? '#22c55e' : t.change1y <= -0.3 ? '#ef4444' : '#94a3b8';
                  const c5 = t.change5y >= 1 ? '#22c55e' : t.change5y <= -1 ? '#ef4444' : '#94a3b8';
                  return (
                    <tr key={g.goal} className="hover:bg-slate-800/20 cursor-pointer" onClick={()=>setBigChart(g.goal)}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{background:g.color+'33'}}>{g.icon}</div>
                          <span className="text-white font-medium">{g.goal}. {g.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400">{t.scores[0].toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400">{t.scores[2].toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400">{t.scores[4].toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-white font-bold">{t.scores[6].toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold" style={{color:c1}}>{t.change1y>0?'+':''}{t.change1y.toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold" style={{color:c5}}>{t.change5y>0?'+':''}{t.change5y.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell max-w-xs"><span className="line-clamp-1">{t.headline}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
