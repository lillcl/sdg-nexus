// src/pages/MUNPage.tsx — MUN Builder with free delegate count + SDG picker + working AI
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, FileText, ChevronRight, Search, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { useStream } from '@/hooks/useStream';
import StreamingOutput from '@/components/shared/StreamingOutput';
import api from '@/api/client';
import { EMBEDDED_SDG_DATA } from '@/data/sdr2025';

interface Committee { id:string; name:string; abbr:string; type:string; sdg_links:number[]; desc:string; typical_size:number[]; }
type Step = 'pick'|'configure'|'generate'|'countries'|'bgguide'|'papers';

const SDG_COLORS: Record<number,string> = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',6:'#26BDE2',
  7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',11:'#FD9D24',12:'#BF8B2E',
  13:'#3F7E44',14:'#0A97D9',15:'#56C02B',16:'#00689D',17:'#19486A',
};
const SDG_TITLES: Record<number,string> = {
  1:'No Poverty',2:'Zero Hunger',3:'Good Health',4:'Quality Education',5:'Gender Equality',
  6:'Clean Water',7:'Clean Energy',8:'Decent Work',9:'Industry & Innovation',10:'Reduced Inequalities',
  11:'Sustainable Cities',12:'Responsible Consumption',13:'Climate Action',14:'Life Below Water',
  15:'Life on Land',16:'Peace & Justice',17:'Partnerships',
};
const STEP_LABELS: Record<Step,string> = {
  pick:'Committee', configure:'Configure', generate:'Topics',
  countries:'Delegations', bgguide:'BG Guide', papers:'Papers'
};
const STEPS: Step[] = ['pick','configure','generate','countries','bgguide','papers'];

function tryParseJson(text: string): {topics:any[];recommended_countries:any[]}|null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i+1)); } catch { return null; }
      }
    }
  }
  return null;
}

const ALL_COUNTRIES = Object.values(EMBEDDED_SDG_DATA).sort((a,b)=>a.name.localeCompare(b.name));

export default function MUNPage() {
  const [step, setStep] = useState<Step>('pick');
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selected, setSelected] = useState<Committee|null>(null);
  const [delegationSize, setDelegationSize] = useState(20);
  const [level, setLevel] = useState('university');
  const [formality, setFormality] = useState('academic');
  const [length, setLength] = useState('medium');
  const [customSDGs, setCustomSDGs] = useState<number[]>([]);
  const [savedToDb, setSavedToDb] = useState(false);

  const [topics, setTopics] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any|null>(null);
  const [selectedCountries, setSelectedCountries] = useState<{iso3:string;name:string}[]>([]);
  const [activePaper, setActivePaper] = useState<string|null>(null);
  const [generating, setGenerating] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const autoStream = useStream();
  const bgStream = useStream();
  const paperStream = useStream();
  const prevText = useRef('');

  // Static committees data — always available, no backend needed for browsing
  const STATIC_COMMITTEES: Committee[] = [
    {id:"GA1",name:"General Assembly First Committee",abbr:"GA1",type:"General Assembly",sdg_links:[16,17],desc:"Disarmament and international security issues.",typical_size:[80,193]},
    {id:"GA2",name:"General Assembly Second Committee",abbr:"GA2",type:"General Assembly",sdg_links:[1,2,8,9,10,17],desc:"Economic and financial affairs, sustainable development.",typical_size:[60,193]},
    {id:"GA3",name:"General Assembly Third Committee",abbr:"GA3",type:"General Assembly",sdg_links:[3,4,5,10,16],desc:"Social, humanitarian, and cultural issues.",typical_size:[60,193]},
    {id:"GA4",name:"General Assembly Fourth Committee",abbr:"GA4",type:"General Assembly",sdg_links:[16,17],desc:"Special political and decolonisation.",typical_size:[40,193]},
    {id:"SC",name:"Security Council",abbr:"SC",type:"Security Council",sdg_links:[16,17],desc:"Maintenance of international peace and security.",typical_size:[15,15]},
    {id:"SC-CRISIS",name:"Security Council Crisis",abbr:"SC-CRISIS",type:"Security Council",sdg_links:[16],desc:"Fast-paced crisis simulation.",typical_size:[15,15]},
    {id:"ECOSOC",name:"Economic and Social Council",abbr:"ECOSOC",type:"ECOSOC",sdg_links:[1,2,3,8,10,17],desc:"Economic, social, and environmental coordination.",typical_size:[30,54]},
    {id:"CSW",name:"Commission on the Status of Women",abbr:"CSW",type:"ECOSOC",sdg_links:[5,10],desc:"Gender equality and women's empowerment.",typical_size:[30,45]},
    {id:"CPD",name:"Commission on Population and Development",abbr:"CPD",type:"ECOSOC",sdg_links:[3,5,10,11],desc:"Population, health, and development nexus.",typical_size:[20,47]},
    {id:"UNEP",name:"UN Environment Programme",abbr:"UNEP",type:"Specialised Agency",sdg_links:[13,14,15],desc:"International environmental coordination.",typical_size:[30,193]},
    {id:"WHO",name:"World Health Organization",abbr:"WHO",type:"Specialised Agency",sdg_links:[3],desc:"International public health governance.",typical_size:[30,193]},
    {id:"UNESCO",name:"UNESCO",abbr:"UNESCO",type:"Specialised Agency",sdg_links:[4,5,10],desc:"Education, science, culture, and communication.",typical_size:[30,193]},
    {id:"ILO",name:"International Labour Organization",abbr:"ILO",type:"Specialised Agency",sdg_links:[8,10],desc:"Labour standards, employment, and decent work.",typical_size:[20,187]},
    {id:"FAO",name:"Food and Agriculture Organization",abbr:"FAO",type:"Specialised Agency",sdg_links:[2,15],desc:"Food security, agriculture, and rural development.",typical_size:[30,194]},
    {id:"UNHCR",name:"UN High Commissioner for Refugees",abbr:"UNHCR",type:"Specialised Agency",sdg_links:[10,16],desc:"Protection and support for refugees.",typical_size:[20,100]},
    {id:"UNICEF",name:"UN Children's Fund",abbr:"UNICEF",type:"Specialised Agency",sdg_links:[1,2,3,4,5],desc:"Children's rights, welfare, and development.",typical_size:[20,100]},
    {id:"UNDP",name:"UN Development Programme",abbr:"UNDP",type:"Specialised Agency",sdg_links:[1,8,9,16,17],desc:"Sustainable development and poverty eradication.",typical_size:[30,177]},
    {id:"WFP",name:"World Food Programme",abbr:"WFP",type:"Specialised Agency",sdg_links:[2],desc:"Food assistance and hunger relief.",typical_size:[20,100]},
    {id:"IMF",name:"International Monetary Fund",abbr:"IMF",type:"Specialised Agency",sdg_links:[1,8,17],desc:"International monetary cooperation.",typical_size:[15,190]},
    {id:"WTO",name:"World Trade Organization",abbr:"WTO",type:"Specialised Agency",sdg_links:[8,9,17],desc:"International trade rules and dispute resolution.",typical_size:[20,164]},
    {id:"SOCHUM",name:"SOCHUM (Social, Cultural & Humanitarian)",abbr:"SOCHUM",type:"Special Committee",sdg_links:[3,4,5,10,16],desc:"Social, Cultural and Humanitarian.",typical_size:[30,150]},
    {id:"DISEC",name:"DISEC (Disarmament & Security)",abbr:"DISEC",type:"Special Committee",sdg_links:[16],desc:"Disarmament and International Security.",typical_size:[30,150]},
    {id:"SPECPOL",name:"SPECPOL (Special Political)",abbr:"SPECPOL",type:"Special Committee",sdg_links:[10,16,17],desc:"Special Political and Decolonization.",typical_size:[30,150]},
    {id:"LEGAL",name:"Legal Committee",abbr:"LEGAL",type:"Special Committee",sdg_links:[16],desc:"International law and legal frameworks.",typical_size:[20,150]},
    {id:"JCC",name:"Joint Crisis Committee",abbr:"JCC",type:"Crisis",sdg_links:[16,17],desc:"Multi-room crisis with directives.",typical_size:[10,30]},
    {id:"HUMAN-RIGHTS",name:"Human Rights Council",abbr:"HRC",type:"Special Committee",sdg_links:[10,16],desc:"Promotion and protection of human rights.",typical_size:[20,47]},
    {id:"COP",name:"Conference of Parties (Climate)",abbr:"COP",type:"Special Committee",sdg_links:[13,14,15],desc:"UN climate negotiations and Paris Agreement.",typical_size:[30,193]},
  ];

  useEffect(() => {
    // Pre-load with static data immediately, then try to merge from backend
    setCommittees(STATIC_COMMITTEES);
    api.get('/coord/catalogue').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setCommittees(r.data);
    }).catch(()=>{ /* keep static data */ });
  }, []);

  // Parse JSON from stream as it arrives
  useEffect(() => {
    if (!autoStream.text || autoStream.text === prevText.current) return;
    prevText.current = autoStream.text;
    const parsed = tryParseJson(autoStream.text);
    if (parsed) {
      if (parsed.topics?.length) setTopics(parsed.topics);
      if (parsed.recommended_countries?.length) setCountries(parsed.recommended_countries);
    }
  }, [autoStream.text]);

  // When streaming finishes → go to topics
  useEffect(() => {
    if (!autoStream.loading && generating) {
      setGenerating(false);
      // Final parse attempt
      const parsed = tryParseJson(autoStream.text);
      if (parsed) {
        if (parsed.topics?.length) setTopics(parsed.topics);
        if (parsed.recommended_countries?.length) setCountries(parsed.recommended_countries);
      }
      if (autoStream.text) setStep('generate');
    }
  }, [autoStream.loading]);

  const activeSDGs = customSDGs.length > 0
    ? customSDGs
    : selected?.sdg_links ?? [];

  const runGenerate = useCallback(() => {
    if (!selected) return;
    setTopics([]); setCountries([]); setSelectedTopic(null); setSelectedCountries([]);
    prevText.current = ''; setSavedToDb(false);
    setGenerating(true);
    const sdgFocus = activeSDGs.map(g=>`SDG${g}: ${SDG_TITLES[g]}`).join(', ');
    autoStream.run('/ai/mun/auto-generate', {
      committee_id: selected.id,
      committee_name: selected.name,
      delegation_size: delegationSize,
      level, formality,
      sdg_focus: sdgFocus,
    });
  }, [selected, delegationSize, level, formality, customSDGs]);

  const saveToDatabase = async () => {
    if (!selected || !selectedTopic) return;
    try {
      await api.post('/mun/committees', {
        name: `${selected.name} — ${selectedTopic.title}`,
        sdg_focus: activeSDGs.map(g=>`SDG${g}`).join(','),
        topic: selectedTopic.title,
        country_count: selectedCountries.length,
        countries: JSON.stringify(selectedCountries.map(c=>c.iso3)),
        background_guide: bgStream.text,
        output_length: length,
        formality,
        level,
        director_id: null,
      });
      setSavedToDb(true);
    } catch (e) { console.error(e); }
  };

  const types = ['All', ...Array.from(new Set(committees.map(c=>c.type)))];
  const filteredCommittees = committees.filter(c =>
    (filterType==='All'||c.type===filterType) &&
    (c.name.toLowerCase().includes(search.toLowerCase())||c.abbr.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredAllCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const toggleCountry = (iso3: string, name: string) => {
    setSelectedCountries(p =>
      p.some(s=>s.iso3===iso3) ? p.filter(s=>s.iso3!==iso3) : [...p, {iso3, name}]
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#080c14]">
      {/* Stepper */}
      <div className="flex-shrink-0 border-b border-slate-800 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <button onClick={()=>{
              if (s==='pick'||s==='configure'||(s==='generate'&&topics.length>0)||
                  (s==='countries'&&countries.length>0)||(s==='bgguide'&&selectedCountries.length>0)||
                  (s==='papers'&&bgStream.text)) setStep(s);
            }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                step===s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">{i+1}</span>
              {STEP_LABELS[s]}
            </button>
            {i < STEPS.length-1 && <ChevronRight size={10} className="text-slate-700"/>}
          </div>
        ))}
        {selected && (
          <div className="ml-auto flex items-center gap-2 flex-shrink-0 pl-4">
            <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">{selected.abbr}</span>
            <span className="text-xs text-slate-500">{delegationSize} delegates</span>
            {selectedTopic && (
              <button onClick={saveToDatabase}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  savedToDb
                    ? 'text-green-400 border border-green-700 bg-green-950'
                    : 'text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 shadow-md shadow-blue-900/40'
                }`}>
                <Save size={11}/>{savedToDb ? '✓ Saved to DB' : '💾 Save Committee'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">

        {/* ── STEP 1: PICK COMMITTEE ── */}
        {step === 'pick' && (
          <div className="max-w-4xl space-y-4">
            <div>
              <h2 className="text-white font-bold text-xl">Select a Committee</h2>
              <p className="text-slate-500 text-sm mt-1">Choose from 27 UN bodies — each linked to specific SDGs</p>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search committees…"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"/>
              </div>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                {types.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCommittees.map(c=>(
                <button key={c.id} onClick={()=>{ setSelected(c); setCustomSDGs([]); setDelegationSize(Math.round((c.typical_size[0]+c.typical_size[1])/2)); setStep('configure'); }}
                  className="text-left p-4 rounded-xl border border-slate-700 hover:border-blue-500 bg-slate-900 hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-blue-400 text-sm">{c.abbr}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{c.type}</span>
                  </div>
                  <p className="text-white text-sm font-semibold group-hover:text-blue-300 mb-1">{c.name}</p>
                  <p className="text-slate-500 text-xs mb-2 line-clamp-2">{c.desc}</p>
                  <div className="flex items-center gap-1">
                    {c.sdg_links.slice(0,6).map(g=>(
                      <span key={g} className="w-5 h-5 rounded text-[9px] font-bold text-white flex items-center justify-center"
                        style={{background:SDG_COLORS[g]}}>{g}</span>
                    ))}
                    <span className="text-slate-600 text-xs ml-auto">{c.typical_size[0]}–{c.typical_size[1]} countries</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: CONFIGURE ── */}
        {step === 'configure' && selected && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-white font-bold text-xl">Configure Committee</h2>
              <p className="text-slate-400 text-sm mt-1">{selected.name}</p>
            </div>

            {/* Delegate count — free input */}
            <div>
              <label className="text-xs text-slate-400 font-mono uppercase tracking-widest block mb-2">
                Number of Delegates
              </label>
              <div className="flex items-center gap-3">
                <input type="number" min={2} max={200} value={delegationSize}
                  onChange={e=>setDelegationSize(Math.max(2,Math.min(200,Number(e.target.value))))}
                  className="w-24 bg-slate-900 border border-slate-600 rounded-xl px-3 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-blue-500"/>
                <div className="flex flex-wrap gap-2">
                  {[10,20,30,50,80].map(n=>(
                    <button key={n} onClick={()=>setDelegationSize(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                        delegationSize===n ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1">Typical for {selected.abbr}: {selected.typical_size[0]}–{selected.typical_size[1]}</p>
            </div>

            {/* Output settings */}
            <div className="grid grid-cols-3 gap-3">
              {([
                ['Level',['secondary','university'],level,setLevel],
                ['Length',['short','medium','full'],length,setLength],
                ['Formality',['simplified','semi-formal','academic'],formality,setFormality],
              ] as [string,string[],string,(v:string)=>void][]).map(([label,vals,val,setter])=>(
                <div key={label}>
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-widest block mb-1">{label}</label>
                  <select value={val} onChange={e=>setter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-blue-500">
                    {vals.map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* SDG selector — fully custom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                  SDG Focus — click to select/deselect
                </label>
                <button onClick={()=>setCustomSDGs([])}
                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
                  Reset to committee defaults
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({length:17},(_,i)=>i+1).map(g=>{
                  const active = customSDGs.length===0 ? selected.sdg_links.includes(g) : customSDGs.includes(g);
                  return (
                    <button key={g} title={SDG_TITLES[g]}
                      onClick={()=>{
                        const base = customSDGs.length===0 ? [...selected.sdg_links] : [...customSDGs];
                        setCustomSDGs(base.includes(g) ? base.filter(x=>x!==g) : [...base,g]);
                      }}
                      className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white transition-all text-[9px] font-bold hover:scale-105 ${
                        active ? 'opacity-100 ring-2 ring-white ring-offset-1 ring-offset-[#080c14]' : 'opacity-30 hover:opacity-60'
                      }`}
                      style={{background:SDG_COLORS[g]}}>
                      <span className="text-sm">{g}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 mt-2 font-mono">
                Active: {activeSDGs.length > 0 ? activeSDGs.map(g=>`SDG${g}`).join(' · ') : 'none selected'}
              </p>
            </div>

            <button onClick={runGenerate}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold transition-colors">
              <Bot size={16}/> Generate Topics &amp; Delegations
            </button>
            {(autoStream.loading||generating) && (
              <div className="text-center text-blue-400 text-sm animate-pulse font-mono py-2">
                ✦ AI is generating topics and country recommendations…
              </div>
            )}
            {autoStream.error && (
              <p className="text-red-400 text-sm text-center">{autoStream.error}</p>
            )}
          </div>
        )}

        {/* ── STEP 3: TOPICS ── */}
        {step === 'generate' && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">Select a Topic</h2>
                <p className="text-slate-500 text-sm">Click a topic to proceed to delegation selection</p>
              </div>
              <button onClick={runGenerate}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors">
                <RefreshCw size={11}/> Regenerate
              </button>
            </div>

            {topics.length === 0 && autoStream.loading && (
              <div className="text-blue-400 text-sm animate-pulse font-mono py-12 text-center">Generating topics…</div>
            )}
            {topics.length === 0 && !autoStream.loading && autoStream.text && (
              <div className="bg-slate-900 border border-orange-800/40 rounded-xl p-4">
                <p className="text-orange-400 text-xs font-mono mb-2">⚠ Could not parse AI response as JSON. Try regenerating.</p>
                <details className="cursor-pointer">
                  <summary className="text-slate-500 text-xs">Show raw output</summary>
                  <pre className="text-slate-400 text-xs mt-2 overflow-auto max-h-32 whitespace-pre-wrap">{autoStream.text.slice(0,400)}</pre>
                </details>
              </div>
            )}

            {topics.map((t:any,i:number)=>(
              <button key={i} onClick={()=>{ setSelectedTopic(t); setStep('countries'); }}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                  selectedTopic?.title===t.title
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-700 hover:border-blue-500/50 bg-slate-900 hover:bg-slate-800'
                }`}>
                <div className="flex items-start gap-2 mb-2">
                  {selectedTopic?.title===t.title && <CheckCircle size={15} className="text-blue-400 flex-shrink-0 mt-0.5"/>}
                  <p className="font-semibold text-white group-hover:text-blue-300">{t.title}</p>
                </div>
                <p className="text-slate-400 text-sm">{t.description}</p>
                {t.key_issues?.length>0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.key_issues.map((iss:string,j:number)=>(
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{iss}</span>
                    ))}
                  </div>
                )}
                <p className="text-blue-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">↗ Select this topic</p>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 4: DELEGATIONS ── */}
        {step === 'countries' && (
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-white font-bold text-xl">Select Delegations</h2>
                {selectedTopic && <p className="text-slate-400 text-sm">{selectedTopic.title}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">
                  <span className="text-blue-400 font-bold text-lg">{selectedCountries.length}</span>
                  <span className="text-slate-600"> / {delegationSize} target</span>
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input value={countrySearch} onChange={e=>setCountrySearch(e.target.value)}
                placeholder="Search all countries…"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"/>
            </div>

            {/* AI Suggested */}
            {countries.length>0 && !countrySearch && (
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                  ✦ AI Recommended ({countries.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {countries.map((c:any)=>{
                    const isSel = selectedCountries.some(s=>s.iso3===c.iso3);
                    const iso2 = (c.iso3||'').toLowerCase().slice(0,2);
                    return (
                      <button key={c.iso3||c.name} onClick={()=>toggleCountry(c.iso3,c.name)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSel ? 'border-blue-500 bg-blue-950/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <img src={`https://flagcdn.com/20x15/${iso2}.png`} alt=""
                            className="w-5 h-4 rounded-sm object-cover flex-shrink-0"
                            onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                          <span className="text-white text-sm font-semibold truncate flex-1">{c.name}</span>
                          {isSel && <CheckCircle size={12} className="text-blue-400 flex-shrink-0"/>}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                            c.stance==='progressive' ? 'bg-green-900/50 text-green-400' :
                            c.stance==='conservative' ? 'bg-orange-900/50 text-orange-400' :
                            'bg-blue-900/50 text-blue-400'}`}>
                            {(c.stance||'').slice(0,4)}
                          </span>
                          <p className="text-slate-500 text-[10px] truncate">{c.reason?.slice(0,50)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All countries search */}
            {countrySearch && (
              <div>
                <p className="text-xs font-mono text-slate-500 mb-2">All countries matching "{countrySearch}"</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {filteredAllCountries.slice(0,40).map(c=>{
                    const isSel = selectedCountries.some(s=>s.iso3===c.iso3);
                    return (
                      <button key={c.iso3} onClick={()=>toggleCountry(c.iso3,c.name)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          isSel ? 'border-blue-500 bg-blue-950/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        }`}>
                        <img src={`https://flagcdn.com/20x15/${c.iso2}.png`} alt=""
                          className="w-5 h-4 rounded-sm object-cover flex-shrink-0"
                          onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                        <span className="text-white text-xs truncate">{c.name}</span>
                        {isSel && <CheckCircle size={10} className="text-blue-400 ml-auto flex-shrink-0"/>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedCountries.length > 0 && (
              <div className="sticky bottom-4">
                <button onClick={()=>setStep('bgguide')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm shadow-xl shadow-blue-900/30">
                  Generate Background Guide → ({selectedCountries.length} delegations selected)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: BG GUIDE ── */}
        {step === 'bgguide' && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">Background Guide</h2>
                <p className="text-slate-400 text-sm">{selected?.name} · {selectedTopic?.title}</p>
              </div>
              <button onClick={()=>bgStream.run('/ai/mun/background-guide',{
                committee_name: selected?.name||'',
                topic: selectedTopic?.title||'',
                sdg_focus: activeSDGs.map(g=>`SDG${g}`).join(', '),
                level, length, formality,
              })}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-semibold">
                <FileText size={14}/> {bgStream.text ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            <StreamingOutput text={bgStream.text} loading={bgStream.loading} error={bgStream.error}
              placeholder="Click Generate to create the full Background Guide for this committee topic"/>
            {bgStream.text && !bgStream.loading && (
              <button onClick={()=>{ saveToDatabase(); setStep('papers'); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold">
                Generate Position Papers →
              </button>
            )}
          </div>
        )}

        {/* ── STEP 6: PAPERS ── */}
        {step === 'papers' && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h2 className="text-white font-bold text-xl">Position Papers</h2>
              <p className="text-slate-500 text-sm">Click a delegation to generate their position paper. Papers are optional.</p>
            </div>
            {!savedToDb && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center gap-3">
                <span className="text-yellow-400 text-xs">⚠️</span>
                <span className="text-blue-300 text-xs flex-1">Save the committee first to store papers permanently.</span>
                <button onClick={saveToDatabase} className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold">
                  Save Now
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map(c=>{
                const iso2 = (EMBEDDED_SDG_DATA[c.iso3] as any)?.iso2 || c.iso3.toLowerCase().slice(0,2);
                return (
                  <button key={c.iso3} onClick={()=>{
                    setActivePaper(c.iso3);
                    paperStream.reset?.();
                    paperStream.run('/ai/mun/position-paper',{
                      country_iso3: c.iso3, topic: selectedTopic?.title||'', level, length, formality,
                    });
                  }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                      activePaper===c.iso3 ? 'border-blue-500 bg-blue-950 text-white' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                    }`}>
                    <img src={`https://flagcdn.com/16x12/${iso2}.png`} alt=""
                      className="rounded-sm" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                    {c.name}
                  </button>
                );
              })}
            </div>
            {activePaper && (
              <StreamingOutput
                text={paperStream.text} loading={paperStream.loading} error={paperStream.error}
                placeholder="Select a delegation above to generate their position paper"
                title={`${selectedCountries.find(c=>c.iso3===activePaper)?.name||activePaper} — Position Paper`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
