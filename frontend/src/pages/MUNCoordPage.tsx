// src/pages/MUNCoordPage.tsx — Full MUN Coordinate with committee setup, roll call, 2-round voting
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, X, FileText, Newspaper, Archive, Search, Users, Import, Settings } from 'lucide-react';
import api from '@/api/client';
import { EMBEDDED_SDG_DATA } from '@/data/sdr2025';

type Tab = 'setup'|'rollcall'|'speakers'|'papers'|'voting'|'directives'|'press'|'archive';
type SetupMode = 'none'|'import'|'manual';

const TABS: {id:Tab; label:string}[] = [
  {id:'setup',label:'⚙ Setup'}, {id:'rollcall',label:'📋 Roll Call'},
  {id:'speakers',label:'🎙 Speakers'}, {id:'papers',label:'📄 Papers'},
  {id:'voting',label:'🗳 Voting'}, {id:'directives',label:'⚡ Directives'},
  {id:'press',label:'📰 Press'}, {id:'archive',label:'🗂 Archive'},
];

const ALL_COUNTRIES = Object.values(EMBEDDED_SDG_DATA).sort((a,b)=>a.name.localeCompare(b.name));

// ── Speech Timer ──────────────────────────────────────────────────────
function Timer({duration, active, onEnd}: {duration:number; active:boolean; onEnd:()=>void}) {
  const [r, setR] = useState(duration);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{ if(!active){setRunning(false);setR(duration);clearInterval(ref.current!);} },[active,duration]);
  useEffect(()=>{
    if(running){ ref.current=setInterval(()=>setR(p=>{if(p<=1){clearInterval(ref.current!);setRunning(false);onEnd();return 0;}return p-1;}),1000); }
    else clearInterval(ref.current!);
    return ()=>clearInterval(ref.current!);
  },[running]);
  const pct=Math.round((r/duration)*100);
  const stroke=pct>50?'#22c55e':pct>25?'#eab308':'#ef4444';
  const dash=87.96;
  return (
    <div className="flex items-center gap-2">
      <svg width="44" height="44" viewBox="0 0 36 36" className="-rotate-90 flex-shrink-0">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#1e2d42" strokeWidth="3"/>
        <circle cx="18" cy="18" r="14" fill="none" stroke={stroke} strokeWidth="3"
          strokeDasharray={`${pct*dash/100} ${dash}`} strokeLinecap="round"/>
      </svg>
      <div className="flex flex-col">
        <span className="font-mono text-white text-sm font-bold">{Math.floor(r/60)}:{String(r%60).padStart(2,'0')}</span>
        <div className="flex gap-1">
          <button onClick={()=>setRunning(p=>!p)} className={`px-2 py-0.5 rounded text-[10px] font-bold ${running?'bg-red-700':'bg-green-700'} text-white`}>
            {running?'Pause':'Start'}
          </button>
          <button onClick={()=>{setRunning(false);setR(duration);}} className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-white">↺</button>
        </div>
      </div>
    </div>
  );
}

// ── Country Picker Modal ───────────────────────────────────────────────
function CountryPicker({selected, onToggle, onClose, title, restrictTo}: {
  selected: string[]; onToggle:(iso3:string,name:string)=>void; onClose:()=>void; title:string;
  restrictTo?: {iso3:string;name:string;iso2?:string}[];
}) {
  const [q, setQ] = useState('');
  // Use restricted list (e.g. committee countries) or fall back to all countries
  const sourceList = restrictTo && restrictTo.length > 0
    ? restrictTo.map(c => ({ ...c, iso2: c.iso2 || EMBEDDED_SDG_DATA[c.iso3]?.iso2 || c.iso3.toLowerCase().slice(0,2) }))
    : ALL_COUNTRIES;
  const filtered = sourceList.filter(c=>c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0d1521] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <span className="text-white font-bold">{title}</span>
          {restrictTo && restrictTo.length > 0 && (
            <span className="text-xs text-slate-500 mr-2">{restrictTo.length} committee delegations</span>
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16}/></button>
        </div>
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search countries..."
              className="w-full bg-slate-800 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"/>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          <div className="grid grid-cols-2 gap-1">
            {filtered.map(c=>{
              const sel = selected.includes(c.iso3);
              const iso2 = (c as any).iso2 || EMBEDDED_SDG_DATA[c.iso3]?.iso2 || c.iso3.toLowerCase().slice(0,2);
              return (
                <button key={c.iso3} onClick={()=>onToggle(c.iso3,c.name)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${sel?'bg-blue-900/50 border border-blue-700':'hover:bg-slate-800 border border-transparent'}`}>
                  <img src={`https://flagcdn.com/20x15/${iso2}.png`} alt="" className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <span className="text-white text-xs truncate">{c.name}</span>
                  {sel && <Check size={10} className="text-blue-400 ml-auto flex-shrink-0"/>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-3 border-t border-slate-800">
          <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-sm font-bold">
            Done — {selected.length} selected
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MUNCoordPage() {
  const [tab, setTab] = useState<Tab>('setup');
  const [setupMode, setSetupMode] = useState<SetupMode>('none');
  const [backendOk, setBackendOk] = useState(true);
  const [status, setStatus] = useState('');
  const toast = (m:string)=>{ setStatus(m); setTimeout(()=>setStatus(''),2500); };

  // Committee state
  const [committeeId, setCommitteeId] = useState(0);     // 0 = not set up yet
  const [sessionId, setSessionId] = useState(0);
  const [committeeName, setCommitteeName] = useState('');
  const [committeeCountries, setCommitteeCountries] = useState<{iso3:string;name:string}[]>([]);
  const [savedCommittees, setSavedCommittees] = useState<any[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Manual setup form
  const [manualForm, setManualForm] = useState({name:'',sdg_focus:'',topic:''});

  // Roll call
  const [rollCall, setRollCall] = useState<Record<string,'present'|'present_and_voting'|'absent'>>({});
  const [rollCallDone, setRollCallDone] = useState(false);

  // Speakers
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [spForm, setSpForm] = useState({country_iso3:'',country_name:'',speech_type:'primary',duration_seconds:90});
  const [activeSpeaker, setActiveSpeaker] = useState<any|null>(null);
  const [showSpPicker, setShowSpPicker] = useState(false);

  // Papers
  const [papers, setPapers] = useState<any[]>([]);
  const [papForm, setPapForm] = useState({code:'WP/1',title:'',sponsors:[] as string[],signatories:[] as string[],content:'',paper_type:'working'});
  const [showPapSignPicker, setShowPapSignPicker] = useState(false);
  const [showPapSponsorPicker, setShowPapSponsorPicker] = useState(false);

  // Voting — 2-round system
  const [voteTarget, setVoteTarget] = useState<any|null>(null);
  const [voteRound, setVoteRound] = useState<1|2>(1);
  const [votes, setVotes] = useState<Record<string,'for'|'against'|'abstain'|''>>({});
  const [voteType, setVoteType] = useState<'procedural'|'substantive'>('substantive');
  const [voteResult, setVoteResult] = useState<string|null>(null);

  // Directives
  const [directives, setDirectives] = useState<any[]>([]);
  const [dirForm, setDirForm] = useState({from_country:'',directive_type:'action',content:'',priority:'normal'});
  const [showDirPicker, setShowDirPicker] = useState(false);

  // Press
  const [press, setPress] = useState<any[]>([]);
  const [pressForm, setPressForm] = useState({country_iso3:'',headline:'',body:''});
  const [showPressPicker, setShowPressPicker] = useState(false);

  const load = async (cid: number, sid: number) => {
    if(!cid||!sid) return;
    try { const r=await api.get(`/coord/speakers/${sid}`); setSpeakers(r.data); } catch {}
    try { const r=await api.get(`/coord/papers/${cid}`); setPapers(r.data); } catch {}
    try { const r=await api.get(`/coord/directives/${cid}`); setDirectives(r.data); } catch {}
    try { const r=await api.get(`/coord/press/${cid}`); setPress(r.data); } catch {}
  };

  // Load saved MUN Builder committees
  useEffect(()=>{
    api.get('/mun/committees').then(r=>setSavedCommittees(r.data)).catch(()=>{});
  },[]);

  const activateCommittee = async (cid: number, name: string, countries: {iso3:string;name:string}[]) => {
    try {
      const r = await api.post(`/coord/ensure-session/${cid}`);
      const sid = r.data.session_id;
      setCommitteeId(cid); setSessionId(sid); setCommitteeName(name); setCommitteeCountries(countries);
      // Init roll call
      const rc: Record<string,'present'|'present_and_voting'|'absent'> = {};
      countries.forEach(c=>{ rc[c.iso3]='absent'; });
      setRollCall(rc); setRollCallDone(false);
      setBackendOk(true); setTab('rollcall'); toast('Committee activated!');
      load(cid, sid);
    } catch { setBackendOk(false); toast('Backend offline'); }
  };

  // Import from MUN Builder
  const importCommittee = async (saved: any) => {
    let countries: {iso3:string;name:string}[] = [];
    try { countries = JSON.parse(saved.countries||'[]'); } catch {}
    if(typeof countries[0]==='string') countries = (countries as any[]).map((iso:string)=>({iso3:iso,name:iso}));
    await activateCommittee(saved.id, saved.name, countries);
  };

  // Create manual committee
  const createManual = async () => {
    if(!manualForm.name||committeeCountries.length===0) return;
    const r = await api.post('/mun/committees', {
      name: manualForm.name, sdg_focus: manualForm.sdg_focus,
      topic: manualForm.topic,
      countries: JSON.stringify(committeeCountries.map(c=>({iso3:c.iso3,name:c.name}))),
      country_count: committeeCountries.length, director_id: null,
    });
    await activateCommittee(r.data.id, manualForm.name, committeeCountries);
  };

  const presentCountries = Object.entries(rollCall).filter(([,v])=>v!=='absent').map(([k])=>k);
  const presentCount = presentCountries.length;
  const totalCount = committeeCountries.length;
  const quorum = Math.ceil(totalCount * 0.5);
  const hasQuorum = presentCount >= quorum;

  // ── Speaker actions ──
  const doAddSpeaker = async () => {
    if(!spForm.country_name||!sessionId) return;
    await api.post('/coord/speakers', {...spForm, session_id:sessionId});
    setSpForm(p=>({...p,country_iso3:'',country_name:''}));
    load(committeeId, sessionId); toast('Speaker added');
  };
  const speakerStatus = async (id:number, st:string) => {
    await api.patch(`/coord/speakers/${id}/status?status=${st}`);
    if(st==='speaking') setActiveSpeaker(speakers.find(s=>s.id===id));
    if(st==='done'||st==='yielded') setActiveSpeaker(null);
    load(committeeId, sessionId);
  };
  const deleteSpeaker = async (id:number) => {
    await api.delete(`/coord/speakers/${id}`); load(committeeId, sessionId); toast('Removed');
  };

  // ── Paper actions ──
  const doAddPaper = async () => {
    if(!papForm.title) return;
    await api.post('/coord/papers', {
      committee_id:committeeId, session_id:sessionId, ...papForm,
      sponsors: papForm.sponsors, signatories: papForm.signatories,
    });
    setPapForm({code:'WP/1',title:'',sponsors:[],signatories:[],content:'',paper_type:'working'});
    load(committeeId, sessionId); toast('Paper saved');
  };
  const promotePaper = async (id:number) => {
    await api.patch(`/coord/papers/${id}/promote`); load(committeeId, sessionId); toast('Promoted');
  };

  // ── 2-Round Voting ──
  const initVote = (paper: any) => {
    setVoteTarget(paper); setVoteRound(1); setVoteResult(null);
    const v: Record<string,'for'|'against'|'abstain'|''> = {};
    presentCountries.forEach(iso3=>{ v[iso3]=''; });
    setVotes(v);
  };
  const castVote = (iso3:string, vote:'for'|'against'|'abstain') => {
    setVotes(p=>({...p,[iso3]:vote}));
  };
  const countVotes = () => {
    const forV = Object.values(votes).filter(v=>v==='for').length;
    const against = Object.values(votes).filter(v=>v==='against').length;
    const abstain = Object.values(votes).filter(v=>v==='abstain').length;
    return {forV, against, abstain};
  };
  const finalizeVote = async () => {
    if(voteRound===1 && voteType==='substantive') {
      // Round 1: Check if any abstentions exist — if so, allow round 2
      const {abstain} = countVotes();
      if(abstain>0){ setVoteRound(2); toast('Round 2: Abstaining countries may change vote'); return; }
    }
    const {forV, against, abstain} = countVotes();
    const threshold = voteType==='procedural' ? (forV+against)*0.5 : (forV+against)*0.667;
    const result = forV > threshold ? 'passed' : 'failed';
    if(voteTarget && sessionId) {
      await api.post('/coord/votes', {
        paper_id: voteTarget.id, session_id: sessionId,
        vote_type: voteType, votes_for: forV, votes_against: against,
        abstentions: abstain, result,
      });
    }
    setVoteResult(`${result.toUpperCase()} — ${forV} for, ${against} against, ${abstain} abstain`);
    load(committeeId, sessionId);
  };

  // ── Directives ──
  const doAddDirective = async () => {
    if(!dirForm.content) return;
    await api.post('/coord/directives', {...dirForm, committee_id:committeeId, session_id:sessionId});
    setDirForm({from_country:'',directive_type:'action',content:'',priority:'normal'});
    load(committeeId, sessionId); toast('Directive submitted');
  };
  const updateDir = async (id:number, st:string) => {
    await api.patch(`/coord/directives/${id}/status?status=${st}`); load(committeeId, sessionId);
  };

  // ── Press ──
  const doAddPress = async () => {
    if(!pressForm.headline) return;
    await api.post('/coord/press', {...pressForm, committee_id:committeeId, session_id:sessionId, is_public:true});
    setPressForm({country_iso3:'',headline:'',body:''});
    load(committeeId, sessionId); toast('Published');
  };

  const col='text-slate-400 text-xs';
  const badge = (st:string) => {
    const m:Record<string,string> = {
      present:'text-green-400', present_and_voting:'text-blue-400', absent:'text-slate-600',
      waiting:'text-slate-400', speaking:'text-green-400 animate-pulse', done:'text-slate-600',
      draft:'text-slate-400', passed:'text-green-400', failed:'text-red-400',
      submitted:'text-blue-400', approved:'text-green-400', rejected:'text-red-400',
    };
    return m[st]||'text-slate-400';
  };

  const countryName = (iso3:string) => committeeCountries.find(c=>c.iso3===iso3)?.name || iso3;

  return (
    <div className="flex flex-col h-full bg-[#080c14]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-800 px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-white font-bold text-sm">MUN Coordinate</span>
        {committeeId > 0 ? (
          <>
            <span className="text-blue-400 text-xs font-mono bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">{committeeName}</span>
            <span className="text-xs text-slate-500">{committeeCountries.length} delegations · Session #{sessionId}</span>
            <span className={`text-xs font-mono ${hasQuorum?'text-green-400':'text-orange-400'}`}>
              {presentCount}/{totalCount} present {hasQuorum?'✓ Quorum':'— no quorum'}
            </span>
          </>
        ) : (
          <span className="text-xs text-slate-500 italic">No committee active — use Setup tab</span>
        )}
        {activeSpeaker && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-400">Now: <span className="text-green-400 font-bold">{activeSpeaker.country_name}</span></span>
            <Timer duration={activeSpeaker.duration_seconds} active={true} onEnd={()=>speakerStatus(activeSpeaker.id,'done')}/>
          </div>
        )}
        {status && <span className="ml-auto text-xs text-green-400 font-mono animate-pulse">{status}</span>}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-800 px-4 flex gap-0.5 pt-1 overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-3 py-2 text-xs font-mono rounded-t transition-all border-b-2 flex-shrink-0 ${
              tab===t.id?'text-blue-400 border-blue-500 bg-slate-900/50':'text-slate-500 border-transparent hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {!backendOk && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono">
          ⚠ Backend offline — run: <code>cd backend && uvicorn app.main:app --reload --port 8000</code>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">

        {/* ── SETUP ── */}
        {tab==='setup' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-white font-bold text-xl mb-1">Committee Setup</h2>
              <p className="text-slate-500 text-sm">Import from MUN Builder or configure a new committee from scratch</p>
            </div>

            {setupMode==='none' && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={()=>setSetupMode('import')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 bg-slate-900 hover:bg-slate-800 transition-all">
                  <Import size={28} className="text-blue-400"/>
                  <div className="text-center">
                    <p className="text-white font-semibold">Import from MUN Builder</p>
                    <p className="text-slate-500 text-xs mt-1">Use a committee you already built with topics and delegations</p>
                  </div>
                </button>
                <button onClick={()=>setSetupMode('manual')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 bg-slate-900 hover:bg-slate-800 transition-all">
                  <Settings size={28} className="text-purple-400"/>
                  <div className="text-center">
                    <p className="text-white font-semibold">Configure from Scratch</p>
                    <p className="text-slate-500 text-xs mt-1">Name your committee, choose countries, and start</p>
                  </div>
                </button>
              </div>
            )}

            {/* Import mode */}
            {setupMode==='import' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={()=>setSetupMode('none')} className="text-slate-500 hover:text-white text-xs">← Back</button>
                  <span className="text-white font-semibold">Saved Committees from MUN Builder</span>
                </div>
                {savedCommittees.length===0 && (
                  <div className="text-center py-10 text-slate-600">
                    <p>No saved committees yet.</p>
                    <p className="text-xs mt-1">Build one in the MUN Builder tab first.</p>
                  </div>
                )}
                {savedCommittees.map(c=>{
                  let countries:any[] = [];
                  try { countries=JSON.parse(c.countries||'[]'); } catch {}
                  return (
                    <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{c.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{c.sdg_focus} · {c.topic?.slice(0,50)}</p>
                        <p className="text-slate-600 text-xs">{countries.length} delegations · {c.level}</p>
                      </div>
                      <button onClick={()=>importCommittee(c)}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                        Activate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Manual mode */}
            {setupMode==='manual' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={()=>setSetupMode('none')} className="text-slate-500 hover:text-white text-xs">← Back</button>
                  <span className="text-white font-semibold">Configure New Committee</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Committee Name *</label>
                    <input value={manualForm.name} onChange={e=>setManualForm(p=>({...p,name:e.target.value}))}
                      placeholder="e.g. Security Council — Climate Crisis"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono uppercase block mb-1">SDG Focus</label>
                    <input value={manualForm.sdg_focus} onChange={e=>setManualForm(p=>({...p,sdg_focus:e.target.value}))}
                      placeholder="e.g. SDG13, SDG6"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Topic</label>
                    <input value={manualForm.topic} onChange={e=>setManualForm(p=>({...p,topic:e.target.value}))}
                      placeholder="e.g. Financing Climate Adaptation in LDCs"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-slate-400 font-mono uppercase">Delegations *</label>
                      <span className="text-xs text-slate-500">{committeeCountries.length} selected</span>
                    </div>
                    <button onClick={()=>setShowCountryPicker(true)}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-600 hover:border-blue-500 rounded-xl py-3 text-slate-400 hover:text-white text-sm transition-colors">
                      <Users size={14}/> {committeeCountries.length===0?'Choose Countries':'Change Countries'}
                    </button>
                    {committeeCountries.length>0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {committeeCountries.slice(0,20).map(c=>(
                          <span key={c.iso3} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{c.name}</span>
                        ))}
                        {committeeCountries.length>20&&<span className="text-xs text-slate-500">+{committeeCountries.length-20} more</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={createManual} disabled={!manualForm.name||committeeCountries.length===0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-3 font-semibold text-sm transition-colors">
                    Activate Committee →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROLL CALL ── */}
        {tab==='rollcall' && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">Roll Call</h2>
                <p className="text-slate-500 text-sm">{presentCount}/{totalCount} present · Quorum: {quorum}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{
                  const rc:any={};
                  committeeCountries.forEach(c=>{rc[c.iso3]='present';});
                  setRollCall(rc);
                }} className="text-xs px-3 py-1.5 border border-slate-700 rounded-lg text-slate-400 hover:text-white">All Present</button>
                <button onClick={()=>{setRollCallDone(true);setTab('speakers');toast('Roll call complete!');}}
                  disabled={!hasQuorum}
                  className="text-xs px-4 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white rounded-lg font-semibold">
                  Complete Roll Call →
                </button>
              </div>
            </div>
            {!hasQuorum && <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-800/50 text-orange-400 text-xs">⚠ Quorum requires {quorum} delegates ({Math.ceil(totalCount*50)}%). Currently {presentCount}.</div>}
            <div className="space-y-1">
              {committeeCountries.map(c=>(
                <div key={c.iso3} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <img src={`https://flagcdn.com/20x15/${EMBEDDED_SDG_DATA[c.iso3]?.iso2||c.iso3.toLowerCase().slice(0,2)}.png`} alt=""
                    className="w-6 h-4 rounded-sm object-cover flex-shrink-0"
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <span className="text-white text-sm flex-1">{c.name}</span>
                  <div className="flex gap-1">
                    {(['present','present_and_voting','absent'] as const).map(st=>(
                      <button key={st} onClick={()=>setRollCall(p=>({...p,[c.iso3]:st}))}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          rollCall[c.iso3]===st
                            ? st==='absent' ? 'bg-slate-700 border-slate-600 text-slate-400'
                              : st==='present_and_voting' ? 'bg-blue-800 border-blue-600 text-blue-300'
                              : 'bg-green-800 border-green-600 text-green-300'
                            : 'border-slate-700 text-slate-600 hover:border-slate-500'
                        }`}>
                        {st==='present_and_voting'?'P+V':st.charAt(0).toUpperCase()+st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SPEAKERS ── */}
        {tab==='speakers' && (
          <div className="max-w-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-xl">Speaker List</h2>
              <button onClick={()=>setShowSpPicker(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Plus size={11}/> Add Speaker
              </button>
            </div>
            {spForm.country_name && (
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-blue-700">
                <span className="text-white text-sm flex-1">{spForm.country_name}</span>
                <select value={spForm.speech_type} onChange={e=>setSpForm(p=>({...p,speech_type:e.target.value}))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                  <option value="primary">Primary</option>
                  <option value="reply">Right of Reply</option>
                  <option value="GSL">GSL</option>
                </select>
                <div className="flex items-center gap-1">
                  <input type="number" value={spForm.duration_seconds} onChange={e=>setSpForm(p=>({...p,duration_seconds:+e.target.value}))}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs text-center focus:outline-none"/>
                  <span className="text-slate-500 text-xs">sec</span>
                </div>
                <button onClick={doAddSpeaker} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Add</button>
                <button onClick={()=>setSpForm(p=>({...p,country_iso3:'',country_name:''}))} className="text-slate-500 hover:text-white"><X size={12}/></button>
              </div>
            )}
            <div className="space-y-1.5">
              {speakers.length===0 && <p className="text-slate-600 text-sm text-center py-8">No speakers yet</p>}
              {speakers.map((s,i)=>(
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.status==='speaking'?'border-green-700 bg-green-950/20':'border-slate-800 bg-slate-900'}`}>
                  <span className="font-mono text-[10px] text-slate-600 w-5">{i+1}</span>
                  <img src={`https://flagcdn.com/20x15/${EMBEDDED_SDG_DATA[s.country_iso3]?.iso2||'un'}.png`} alt=""
                    className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <span className="text-white text-sm flex-1">{s.country_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{s.speech_type}</span>
                  <span className={`text-[10px] font-mono ${badge(s.status)}`}>{s.status}</span>
                  {s.status==='speaking' && <Timer duration={s.duration_seconds} active={true} onEnd={()=>speakerStatus(s.id,'done')}/>}
                  <div className="flex gap-1">
                    {s.status==='waiting'&&<button onClick={()=>speakerStatus(s.id,'speaking')} className="text-[10px] px-2 py-1 bg-green-800 text-green-300 rounded">▶ Speak</button>}
                    {s.status==='speaking'&&<button onClick={()=>speakerStatus(s.id,'done')} className="text-[10px] px-2 py-1 bg-slate-700 text-white rounded">Done</button>}
                    <button onClick={()=>deleteSpeaker(s.id)} className="p-1 text-slate-600 hover:text-red-400"><Trash2 size={11}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAPERS ── */}
        {tab==='papers' && (
          <div className="max-w-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-xl">Working Papers</h2>
            </div>
            {/* Add paper form */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-mono text-slate-500 uppercase">New Paper</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Code</label>
                  <input value={papForm.code} onChange={e=>setPapForm(p=>({...p,code:e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Type</label>
                  <select value={papForm.paper_type} onChange={e=>setPapForm(p=>({...p,paper_type:e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    <option value="working">Working Paper</option>
                    <option value="draft">Draft Resolution</option>
                    <option value="resolution">Resolution</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Title *</label>
                <input value={papForm.title} onChange={e=>setPapForm(p=>({...p,title:e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"/>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-500">
                    Sponsors {papForm.paper_type==='working' ? '' : '*'} 
                    <span className="text-slate-600 ml-1">(primary authors)</span>
                  </label>
                  <button onClick={()=>setShowPapSponsorPicker(true)} className="text-xs text-blue-400 hover:text-blue-300">+ Add Sponsors</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {papForm.sponsors.map(iso3=>(
                    <span key={iso3} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      {countryName(iso3)}
                      <button onClick={()=>setPapForm(p=>({...p,sponsors:p.sponsors.filter(s=>s!==iso3)}))} className="text-slate-500 hover:text-red-400 ml-1"><X size={8}/></button>
                    </span>
                  ))}
                  {papForm.sponsors.length===0 && <span className="text-xs text-slate-600 italic">No sponsors yet</span>}
                </div>
              </div>
              {/* Signatories — only for Draft Resolution and Resolution */}
              {(papForm.paper_type==='draft'||papForm.paper_type==='resolution') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-500">
                      Signatories
                      <span className="text-slate-600 ml-1">(supporting countries)</span>
                    </label>
                    <button onClick={()=>setShowPapSignPicker(true)} className="text-xs text-blue-400 hover:text-blue-300">+ Add Signatories</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {papForm.signatories.map(iso3=>(
                      <span key={iso3} className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 flex items-center gap-1">
                        {countryName(iso3)}
                        <button onClick={()=>setPapForm(p=>({...p,signatories:p.signatories.filter(s=>s!==iso3)}))} className="text-slate-500 hover:text-red-400 ml-1"><X size={8}/></button>
                      </span>
                    ))}
                    {papForm.signatories.length===0 && <span className="text-xs text-slate-600 italic">No signatories yet</span>}
                  </div>
                </div>
              )}
              {/* Paper content / body */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Content / Body Text <span className="text-slate-600">(operative clauses, arguments)</span>
                </label>
                <textarea
                  value={papForm.content}
                  onChange={e=>setPapForm(p=>({...p,content:e.target.value}))}
                  placeholder={papForm.paper_type==='working'
                    ? "Outline of proposals, arguments, and recommended actions..."
                    : `Preambulatory clauses:\nRecalling...\nAcknowledging...\n\nOperative clauses:\n1. Urges all member states to...\n2. Recommends that...`}
                  rows={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>
              <button onClick={doAddPaper} disabled={!papForm.title}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-2 text-sm font-semibold">
                Submit {papForm.paper_type==='working' ? 'Working Paper' : papForm.paper_type==='draft' ? 'Draft Resolution' : 'Resolution'}
              </button>
            </div>
            {papers.map(p=>(
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{p.code} — {p.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{p.paper_type}</span>
                    <span className={`text-xs ${badge(p.status)}`}>{p.status}</span>
                  </div>
                </div>
                <button onClick={()=>promotePaper(p.id)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
                  Promote ↑
                </button>
                <button onClick={()=>initVote(p)} className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg">
                  Vote
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── VOTING — 2 Round ── */}
        {tab==='voting' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="text-white font-bold text-xl">Voting Procedure</h2>
              <p className="text-slate-500 text-sm">Substantive: 2-round abstentive · Procedural: simple majority</p>
            </div>
            {!voteTarget ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-mono uppercase mb-3">Select a paper to vote on</p>
                {papers.map(p=>(
                  <button key={p.id} onClick={()=>initVote(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-900 hover:border-blue-500 text-left">
                    <FileText size={14} className="text-blue-400 flex-shrink-0"/>
                    <div className="flex-1"><p className="text-white text-sm font-semibold">{p.code} — {p.title}</p><p className={`text-xs ${badge(p.status)}`}>{p.status}</p></div>
                    <span className="text-xs text-slate-500">→ Vote</span>
                  </button>
                ))}
                {papers.length===0 && <p className="text-slate-600 text-sm text-center py-8">No papers submitted yet</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{voteTarget.code} — {voteTarget.title}</p>
                    <p className="text-slate-400 text-sm">Round {voteRound} of {voteType==='procedural'?1:2}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={voteType} onChange={e=>setVoteType(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs">
                      <option value="substantive">Substantive (2/3)</option>
                      <option value="procedural">Procedural (1/2)</option>
                    </select>
                    <button onClick={()=>{setVoteTarget(null);setVoteResult(null);}} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                  </div>
                </div>

                {voteResult ? (
                  <div className={`p-4 rounded-2xl border text-center ${voteResult.includes('PASSED')?'border-green-700 bg-green-950/30':'border-red-700 bg-red-950/30'}`}>
                    <p className={`font-bold text-2xl ${voteResult.includes('PASSED')?'text-green-400':'text-red-400'}`}>{voteResult}</p>
                    <button onClick={()=>{setVoteTarget(null);setVoteResult(null);}} className="mt-4 text-xs text-slate-400 hover:text-white">Start New Vote</button>
                  </div>
                ) : (
                  <>
                    {voteRound===2 && (
                      <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-800/50 text-yellow-400 text-xs">
                        Round 2: Countries that abstained in Round 1 may change to For or Against.
                      </div>
                    )}
                    {/* Vote tally */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {(['for','against','abstain'] as const).map(v=>{
                        const c=Object.values(votes).filter(x=>x===v).length;
                        return <div key={v} className="bg-slate-900 rounded-xl p-3">
                          <p className="text-2xl font-bold"style={{color:v==='for'?'#22c55e':v==='against'?'#ef4444':'#eab308'}}>{c}</p>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">{v}</p>
                        </div>;
                      })}
                    </div>
                    {/* Country vote table */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {presentCountries.map(iso3=>{
                        const c = committeeCountries.find(x=>x.iso3===iso3);
                        if(!c) return null;
                        return (
                          <div key={iso3} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                            <img src={`https://flagcdn.com/20x15/${EMBEDDED_SDG_DATA[iso3]?.iso2||'un'}.png`} alt=""
                              className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
                              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                            <span className="text-white text-xs flex-1">{c.name}</span>
                            <div className="flex gap-1">
                              {(['for','against','abstain'] as const).map(v=>(
                                <button key={v} onClick={()=>castVote(iso3,v)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                    votes[iso3]===v
                                      ? v==='for'?'bg-green-800 border-green-600 text-green-300'
                                        :v==='against'?'bg-red-800 border-red-600 text-red-300'
                                        :'bg-yellow-800 border-yellow-600 text-yellow-300'
                                      : 'border-slate-700 text-slate-600 hover:border-slate-500'
                                  }`}>{v==='for'?'For':v==='against'?'Against':'Abstain'}</button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={finalizeVote}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold">
                      {voteRound===1&&voteType==='substantive' ? 'Proceed to Round 2 →' : 'Calculate Result'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DIRECTIVES ── */}
        {tab==='directives' && (
          <div className="max-w-xl space-y-4">
            <h2 className="text-white font-bold text-xl">Directives</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">From Country</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm flex-1 truncate">{dirForm.from_country ? countryName(dirForm.from_country) : <span className="text-slate-600 italic">Not selected</span>}</span>
                    <button onClick={()=>setShowDirPicker(true)} className="text-xs text-blue-400 hover:text-blue-300 border border-slate-700 px-2 py-1 rounded-lg">Choose</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Type</label>
                  <select value={dirForm.directive_type} onChange={e=>setDirForm(p=>({...p,directive_type:e.target.value}))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                    {['intelligence','action','press','back_room'].map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Priority</label>
                  <select value={dirForm.priority} onChange={e=>setDirForm(p=>({...p,priority:e.target.value}))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                    <option value="urgent">🔴 Urgent</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
              <textarea value={dirForm.content} onChange={e=>setDirForm(p=>({...p,content:e.target.value}))} rows={3}
                placeholder="Directive content…"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"/>
              <button onClick={doAddDirective} disabled={!dirForm.content||!dirForm.from_country}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-2 text-sm font-semibold">
                Submit Directive
              </button>
            </div>
            {directives.map(d=>(
              <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-semibold">{countryName(d.from_country)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{d.directive_type}</span>
                    <span className={`text-[10px] ${badge(d.status)}`}>{d.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{d.content}</p>
                </div>
                {d.status==='submitted' && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={()=>updateDir(d.id,'approved')} className="text-[10px] px-2 py-1 bg-green-800 text-green-300 rounded">✓</button>
                    <button onClick={()=>updateDir(d.id,'rejected')} className="text-[10px] px-2 py-1 bg-red-800 text-red-300 rounded">✗</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PRESS ── */}
        {tab==='press' && (
          <div className="max-w-xl space-y-4">
            <h2 className="text-white font-bold text-xl">Press Releases</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1 truncate">{pressForm.country_iso3 ? countryName(pressForm.country_iso3) : <span className="text-slate-600 italic">Select country</span>}</span>
                <button onClick={()=>setShowPressPicker(true)} className="text-xs text-blue-400 border border-slate-700 px-3 py-1 rounded-lg">Choose Country</button>
              </div>
              <input value={pressForm.headline} onChange={e=>setPressForm(p=>({...p,headline:e.target.value}))}
                placeholder="Headline"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"/>
              <textarea value={pressForm.body} onChange={e=>setPressForm(p=>({...p,body:e.target.value}))} rows={3}
                placeholder="Press release body…"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none"/>
              <button onClick={doAddPress} disabled={!pressForm.headline||!pressForm.country_iso3}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-2 text-sm font-semibold">
                Publish
              </button>
            </div>
            {press.map(p=>(
              <div key={p.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper size={12} className="text-slate-400"/>
                  <span className="text-white font-semibold text-sm">{p.headline}</span>
                  <span className="text-slate-500 text-xs ml-auto">{countryName(p.country_iso3)}</span>
                </div>
                <p className="text-slate-400 text-xs">{p.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── ARCHIVE ── */}
        {tab==='archive' && (
          <div className="max-w-xl space-y-4">
            <h2 className="text-white font-bold text-xl">Committee Archive</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center space-y-3">
              <Archive size={32} className="text-slate-500 mx-auto"/>
              <p className="text-slate-400 text-sm">Snapshot the current committee state including all votes, papers, and press releases.</p>
              <button onClick={async()=>{ await api.post(`/coord/archive/${committeeId}`); toast('Archived!'); }}
                className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
                Create Archive Snapshot
              </button>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2">
              <p className="text-xs font-mono text-slate-500 uppercase">Session Summary</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  {label:'Speakers',val:speakers.length},
                  {label:'Papers',val:papers.length},
                  {label:'Directives',val:directives.length},
                  {label:'Press',val:press.length},
                ].map(({label,val})=>(
                  <div key={label} className="bg-slate-800 rounded-xl p-2">
                    <p className="text-white font-bold text-xl">{val}</p>
                    <p className="text-slate-500 text-[10px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country picker modals */}
      {showCountryPicker && (
        <CountryPicker
          title="Select Committee Countries"
          selected={committeeCountries.map(c=>c.iso3)}
          onToggle={(iso3,name)=>setCommitteeCountries(p=>p.some(c=>c.iso3===iso3)?p.filter(c=>c.iso3!==iso3):[...p,{iso3,name}])}
          onClose={()=>setShowCountryPicker(false)}/>
      )}
      {showSpPicker && (
        <CountryPicker
          title="Select Speaker (Committee Members)"
          selected={spForm.country_iso3 ? [spForm.country_iso3] : []}
          onToggle={(iso3,name)=>{ setSpForm(p=>({...p,country_iso3:iso3,country_name:name})); setShowSpPicker(false); }}
          onClose={()=>setShowSpPicker(false)}
          restrictTo={committeeCountries.length > 0 ? committeeCountries.filter(c=>rollCall[c.iso3]!=='absent') : undefined}
        />
      )}
      {showPapSponsorPicker && (
        <CountryPicker
          title="Select Sponsors"
          selected={papForm.sponsors}
          onToggle={(iso3,name)=>setPapForm(p=>({...p,sponsors:p.sponsors.includes(iso3)?p.sponsors.filter(s=>s!==iso3):[...p.sponsors,iso3]}))}
          onClose={()=>setShowPapSponsorPicker(false)}
          restrictTo={committeeCountries.length>0?committeeCountries:undefined}
        />
      )}
      {showPapSignPicker && (
        <CountryPicker
          title="Select Signatories"
          selected={papForm.signatories}
          onToggle={(iso3,name)=>setPapForm(p=>({...p,signatories:p.signatories.includes(iso3)?p.signatories.filter(s=>s!==iso3):[...p.signatories,iso3]}))}
          onClose={()=>setShowPapSignPicker(false)}
          restrictTo={committeeCountries.length>0?committeeCountries:undefined}
        />
      )}
      {showDirPicker && (
        <CountryPicker
          title="Select Country (Directive From)"
          selected={dirForm.from_country ? [dirForm.from_country] : []}
          onToggle={(iso3)=>{ setDirForm(p=>({...p,from_country:iso3})); setShowDirPicker(false); }}
          onClose={()=>setShowDirPicker(false)}/>
      )}
      {showPressPicker && (
        <CountryPicker
          title="Select Country (Press Release)"
          selected={pressForm.country_iso3 ? [pressForm.country_iso3] : []}
          onToggle={(iso3)=>{ setPressForm(p=>({...p,country_iso3:iso3})); setShowPressPicker(false); }}
          onClose={()=>setShowPressPicker(false)}/>
      )}
    </div>
  );
}
