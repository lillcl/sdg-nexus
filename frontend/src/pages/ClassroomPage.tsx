// TopicGeneratorPage (ClassroomPage) — real SDR data flow: country → SDG indicators → AI topics
import { useState, useMemo } from 'react';
import { Bot, Globe, Search, ChevronDown, BarChart2, Lightbulb, Info } from 'lucide-react';
import { useStream } from '@/hooks/useStream';
import StreamingOutput from '@/components/shared/StreamingOutput';
import { SDG_GOALS } from '@/types';
import { EMBEDDED_SDG_DATA } from '@/data/sdr2025';
import { SDG_FULL_DATA } from '@/data/sdgGoals';

const SDG_COLORS: Record<number,string> = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',6:'#26BDE2',
  7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',11:'#FD9D24',12:'#BF8B2E',
  13:'#3F7E44',14:'#0A97D9',15:'#56C02B',16:'#00689D',17:'#19486A',
};
const ALL_COUNTRIES = Object.values(EMBEDDED_SDG_DATA).sort((a,b) => a.name.localeCompare(b.name));

// Build real indicator context from SDR data for a country + SDG
function buildIndicatorContext(country: any, sdgGoal: number): { label: string; value: string; status: string }[] {
  if (!country) return [];
  const indicators: { label: string; value: string; status: string }[] = [];

  // Overall goal score
  const goalScore = country.goal_scores?.[String(sdgGoal)];
  if (goalScore !== undefined) {
    indicators.push({ label: `SDG ${sdgGoal} Overall Score`, value: goalScore.toFixed(1) + '/100', status: goalScore >= 70 ? 'good' : goalScore >= 50 ? 'moderate' : 'poor' });
  }

  // Individual indicator values from SDR data
  const sdgData = SDG_FULL_DATA.find(g => g.goal === sdgGoal);
  if (sdgData && country.indicators) {
    sdgData.targets.forEach(t => {
      t.indicators.forEach(ind => {
        if (ind.sdr_code && country.indicators[ind.sdr_code] !== undefined) {
          const val = country.indicators[ind.sdr_code];
          indicators.push({
            label: ind.label,
            value: `${val.toFixed(1)} ${ind.unit}`,
            status: ind.direction === 'higher_better' ? (val > 70 ? 'good' : val > 40 ? 'moderate' : 'poor') : (val < 5 ? 'good' : val < 15 ? 'moderate' : 'poor')
          });
        }
      });
    });
  }

  return indicators.slice(0, 8); // top 8 most relevant
}

export default function ClassroomPage() {
  const [config, setConfig] = useState({ sdg_goal: 13, level: 'secondary', difficulty: 3, domain: 'tech', count: 5 });
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const topicStream = useStream();

  const domains = ['tech','policy','design','science','social','business','art','health'];
  const levels = [{ key:'primary', label:'Primary (K-8)' },{ key:'secondary', label:'Secondary' },{ key:'university', label:'University' },{ key:'professional', label:'Professional' }];

  const country = selectedCountry ? EMBEDDED_SDG_DATA[selectedCountry] : null;
  const indicators = useMemo(() => buildIndicatorContext(country, config.sdg_goal), [country, config.sdg_goal]);
  const goalColor = SDG_COLORS[config.sdg_goal];
  const goalInfo = SDG_GOALS[config.sdg_goal - 1];

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const parseTopics = (text: string) => {
    try { const m = text.match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : []; } catch { return []; }
  };

  const generate = () => {
    // Build enriched prompt with real SDR data
    const indicatorText = indicators.length > 0
      ? `\n\nREAL SDR 2025 DATA FOR ${country?.name?.toUpperCase()}:\n` + indicators.map(i => `- ${i.label}: ${i.value} [${i.status}]`).join('\n')
      : '';

    const countryContext = country
      ? `Country: ${country.name} (Region: ${(country as any).region || 'N/A'}, Overall SDG score: ${country.overall_score?.toFixed(1)}/100)${indicatorText}`
      : 'No specific country selected — generate globally applicable topics';

    topicStream.run('/ai/classroom/topics', {
      ...config,
      country: selectedCountry || undefined,
      country_context: countryContext,
      indicator_data: indicators,
    });
  };

  const topics = parseTopics(topicStream.output || '');

  return (
    <div className="min-h-screen bg-[#080c14] overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-bold text-white text-2xl flex items-center gap-2">
            <Lightbulb size={22} className="text-yellow-400"/>Topic Generator
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real SDR 2025 country data → AI-generated SDG project topics for your class</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Left: Config */}
          <div className="space-y-4">
            {/* SDG selector */}
            <div>
              <label className="text-slate-400 text-xs mb-2 block font-medium">SDG Goal</label>
              <div className="grid grid-cols-6 gap-1.5">
                {SDG_GOALS.map((g, i) => (
                  <button key={i+1} onClick={() => setConfig(c => ({...c, sdg_goal: i+1}))}
                    className="h-9 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                    style={{ background: config.sdg_goal === i+1 ? SDG_COLORS[i+1] : SDG_COLORS[i+1] + '33', border: config.sdg_goal === i+1 ? `2px solid ${SDG_COLORS[i+1]}` : '2px solid transparent' }}>
                    {i+1}
                  </button>
                ))}
              </div>
              {goalInfo && (
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: goalColor }}>
                  <span className="font-bold">{goalInfo}</span>
                </div>
              )}
            </div>

            {/* Country picker */}
            <div>
              <label className="text-slate-400 text-xs mb-2 block font-medium">Country <span className="text-slate-600">(uses real SDR data)</span></label>
              <div className="relative">
                <button onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-sm text-white rounded-xl px-3 py-2.5 hover:border-slate-600 transition-colors">
                  <span className="flex items-center gap-2">
                    <Globe size={13} className="text-slate-400"/>
                    {country ? country.name : 'Select a country (optional)'}
                  </span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`}/>
                </button>
                {showCountryPicker && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-[#0a1525] border border-slate-700 rounded-xl mt-1 shadow-2xl">
                    <div className="p-2 border-b border-slate-800">
                      <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Search countries…" autoFocus
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"/>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button onClick={() => { setSelectedCountry(''); setShowCountryPicker(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 transition-colors">
                        🌍 No specific country
                      </button>
                      {filteredCountries.map(c => (
                        <button key={c.iso3} onClick={() => { setSelectedCountry(c.iso3); setShowCountryPicker(false); setCountrySearch(''); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${selectedCountry === c.iso3 ? 'text-white bg-slate-800' : 'text-slate-300'}`}>
                          <span>{c.name}</span>
                          {c.overall_score && <span className="text-slate-500 font-mono">{c.overall_score.toFixed(0)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Real data preview */}
            {indicators.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={12} className="text-blue-400"/>
                  <span className="text-blue-400 text-xs font-bold">Real SDR 2025 Data → {country?.name}</span>
                </div>
                <div className="space-y-1">
                  {indicators.map((ind, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate flex-1 mr-2">{ind.label}</span>
                      <span className={`font-mono font-bold flex-shrink-0 ${ind.status === 'good' ? 'text-green-400' : ind.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {ind.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-600 text-[10px] mt-2 flex items-center gap-1">
                  <Info size={9}/>AI will generate topics based on these real indicators
                </p>
              </div>
            )}

            {/* Other settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Level</label>
                <select value={config.level} onChange={e => setConfig(c => ({...c, level: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none">
                  {levels.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Domain</label>
                <select value={config.domain} onChange={e => setConfig(c => ({...c, domain: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none">
                  {domains.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Difficulty (1-5)</label>
                <input type="range" min={1} max={5} value={config.difficulty}
                  onChange={e => setConfig(c => ({...c, difficulty: Number(e.target.value)}))}
                  className="w-full accent-blue-500"/>
                <div className="flex justify-between text-[10px] text-slate-600"><span>Easy</span><span className="text-blue-400 font-bold">{config.difficulty}</span><span>Hard</span></div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Topics to generate</label>
                <select value={config.count} onChange={e => setConfig(c => ({...c, count: Number(e.target.value)}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none">
                  {[3,5,8,10].map(n => <option key={n} value={n}>{n} topics</option>)}
                </select>
              </div>
            </div>

            <button onClick={generate} disabled={topicStream.loading}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: topicStream.loading ? '#374151' : goalColor }}>
              {topicStream.loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating with real data…</>
                : <><Bot size={16}/>Generate {config.count} Topics</>
              }
            </button>
          </div>

          {/* Right: Output */}
          <div>
            {topicStream.output ? (
              topics.length > 0 ? (
                <div className="space-y-3">
                  {topics.map((t: any, i: number) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: goalColor }}>{i+1}</span>
                        <h3 className="text-white font-bold text-sm">{t.title}</h3>
                      </div>
                      {t.problem && <p className="text-slate-400 text-xs leading-relaxed mb-2"><span className="text-red-400 font-medium">Problem: </span>{t.problem}</p>}
                      {t.approach && <p className="text-slate-400 text-xs leading-relaxed mb-2"><span className="text-blue-400 font-medium">Approach: </span>{t.approach}</p>}
                      {t.skills && <div className="flex flex-wrap gap-1 mt-2">{(Array.isArray(t.skills) ? t.skills : []).slice(0,4).map((s:string,j:number) => (<span key={j} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{s}</span>))}</div>}
                      {t.data_sources && <p className="text-[10px] text-slate-600 mt-1.5">📊 Data: {t.data_sources}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <StreamingOutput text={topicStream.output} loading={topicStream.loading}/>
                </div>
              )
            ) : (
              <div className="h-full min-h-[300px] border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <Bot size={40} className="text-slate-700 mb-3"/>
                <p className="text-slate-500 text-sm">
                  {country
                    ? `Ready to generate topics for ${country.name} — SDG ${config.sdg_goal}`
                    : 'Select a country to use real SDR data, or generate global topics'}
                </p>
                {indicators.length > 0 && (
                  <p className="text-green-400 text-xs mt-2">✓ {indicators.length} real data points loaded</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
