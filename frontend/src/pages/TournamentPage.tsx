// TournamentPage — SDG Tournaments: superadmin creates, students compete
// Questions are AI-generated and stored in localStorage (code-side)
import { useState, useEffect, useRef } from 'react';
import { Trophy, Plus, Trash2, Edit3, ChevronRight, CheckCircle, XCircle,
  Clock, RefreshCw, Play, ShieldCheck, Loader, X,
  Users, Zap, Target } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';
import { SDG_FULL_DATA } from '@/data/sdgGoals';

interface TournamentQuestion {
  id: number; text: string; options: string[]; correct: number; explanation: string;
}
interface Tournament {
  id: string; title: string; description: string; sdg_topics: number[];
  questions: TournamentQuestion[]; created_at: string;
  status: 'draft' | 'active' | 'closed'; time_limit: number;
}
interface TournamentResult {
  id: string; tournament_id: string; user_id: string; username: string;
  score: number; total: number; time_taken: number; submitted_at: string;
}

const STORE_KEY = 'sdg_tournaments_v1';
const RESULTS_KEY = 'sdg_tournament_results_v1';
function loadTournaments(): Tournament[] { try { return JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); } catch { return []; } }
function saveTournaments(t: Tournament[]) { localStorage.setItem(STORE_KEY, JSON.stringify(t)); }
function loadResults(): TournamentResult[] { try { return JSON.parse(localStorage.getItem(RESULTS_KEY)||'[]'); } catch { return []; } }
function saveResults(r: TournamentResult[]) { localStorage.setItem(RESULTS_KEY, JSON.stringify(r)); }

const SDG_COLORS: Record<number,string> = {};
SDG_FULL_DATA.forEach(g => { SDG_COLORS[g.goal] = g.color; });

function SdgBadge({ goal }: { goal: number }) {
  const g = SDG_FULL_DATA.find(x => x.goal === goal);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
      style={{ background: SDG_COLORS[goal]||'#19486A' }}>
      {g?.icon} SDG {goal}
    </span>
  );
}

async function generateQuestionsAI(sdgTopics: number[], count: number, token: string|null): Promise<TournamentQuestion[]> {
  const goals = sdgTopics.map(n => { const g = SDG_FULL_DATA.find(x=>x.goal===n); return `SDG ${n}: ${g?.title||''}`; }).join(', ');
  const prompt = `Generate exactly ${count} challenging multiple-choice tournament questions about: ${goals}.
Return ONLY valid JSON array:
[{"id":1,"text":"Question?","options":["A","B","C","D"],"correct":0,"explanation":"Why A is correct."}]
Make questions specific, educational, and challenging.`;
  const r = await api.post('/ai/chat',{ prompt, system:'Return valid JSON only, no markdown.' },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const text = r.data?.text||'';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]).map((q:any,i:number)=>({...q,id:i+1}));
}

// ── Editor ────────────────────────────────────────────────────────────────────
function TournamentEditor({ tournament, onSave, onCancel }: { tournament?: Tournament; onSave:(t:Tournament)=>void; onCancel:()=>void }) {
  const { token } = useAuthStore();
  const [form, setForm] = useState({ title:tournament?.title||'', description:tournament?.description||'', sdg_topics:tournament?.sdg_topics||[] as number[], status:(tournament?.status||'draft') as Tournament['status'], time_limit:tournament?.time_limit||30 });
  const [questions, setQuestions] = useState<TournamentQuestion[]>(tournament?.questions||[]);
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<'info'|'questions'>('info');
  const [editingQ, setEditingQ] = useState<TournamentQuestion|null>(null);

  const toggleSdg = (n:number) => setForm(f=>({...f, sdg_topics: f.sdg_topics.includes(n)?f.sdg_topics.filter(x=>x!==n):[...f.sdg_topics,n]}));

  const generate = async () => {
    if (!form.sdg_topics.length) { setErr('Select SDG topics first'); return; }
    setGenerating(true); setErr('');
    try { setQuestions(await generateQuestionsAI(form.sdg_topics, genCount, token)); }
    catch(e:any) { setErr(e?.message||'Generation failed'); }
    setGenerating(false);
  };

  const save = () => {
    if (!form.title||!form.sdg_topics.length||!questions.length) { setErr('Title, SDG topics, and questions required.'); return; }
    onSave({ id:tournament?.id||Date.now().toString(), ...form, questions, created_at:tournament?.created_at||new Date().toISOString() });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-slate-500 hover:text-white flex items-center gap-1 text-sm"><ChevronRight size={14} className="rotate-180"/>Back</button>
        <h2 className="text-xl font-bold text-white">{tournament?'Edit':'New'} Tournament</h2>
      </div>

      <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit">
        {(['info','questions'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>
            {t==='info'?'📋 Info':`❓ Questions (${questions.length})`}
          </button>
        ))}
      </div>

      {tab==='info' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Title *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Tournament title"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Optional description"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs block mb-1">Seconds per question</label>
              <input type="number" value={form.time_limit} min={10} max={120} onChange={e=>setForm(f=>({...f,time_limit:Number(e.target.value)}))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"/>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500">
                <option value="draft">🔒 Draft</option>
                <option value="active">✅ Active</option>
                <option value="closed">🏁 Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-2">SDG Topics *</label>
            <div className="flex flex-wrap gap-1.5">
              {SDG_FULL_DATA.map(g => (
                <button key={g.goal} onClick={()=>toggleSdg(g.goal)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${form.sdg_topics.includes(g.goal)?'text-white border-transparent':'text-slate-500 border-slate-700 hover:text-slate-300'}`}
                  style={form.sdg_topics.includes(g.goal)?{background:SDG_COLORS[g.goal]}:{}}>
                  {g.icon} {g.goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='questions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Zap size={14} className="text-yellow-400"/>Generate Questions with AI</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-slate-400 text-xs block mb-1">Count</label>
                <input type="number" value={genCount} min={5} max={30} onChange={e=>setGenCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
              </div>
              <button onClick={generate} disabled={generating||!form.sdg_topics.length}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                {generating?<Loader size={14} className="animate-spin"/>:<Zap size={14}/>}
                {generating?'Generating…':'Generate'}
              </button>
            </div>
            {!form.sdg_topics.length && <p className="text-slate-500 text-xs">⚠ Select SDG topics in Info tab first</p>}
            {questions.length>0 && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle size={12}/>{questions.length} questions ready — review and edit below</p>}
          </div>

          <div className="space-y-3">
            {questions.map((q,i) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                {editingQ?.id===q.id ? (
                  <div className="space-y-2">
                    <textarea value={editingQ.text} rows={2} onChange={e=>setEditingQ({...editingQ,text:e.target.value})}
                      className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
                    {editingQ.options.map((opt,oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button onClick={()=>setEditingQ({...editingQ,correct:oi})} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${oi===editingQ.correct?'border-green-500 bg-green-500':'border-slate-600'}`}/>
                        <input value={opt} onChange={e=>{const opts=[...editingQ.options];opts[oi]=e.target.value;setEditingQ({...editingQ,options:opts});}}
                          className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"/>
                        <span className="text-[10px] text-slate-500 w-14">{oi===editingQ.correct?'✓ correct':''}</span>
                      </div>
                    ))}
                    <textarea value={editingQ.explanation} rows={2} placeholder="Explanation..." onChange={e=>setEditingQ({...editingQ,explanation:e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none resize-none"/>
                    <div className="flex gap-2">
                      <button onClick={()=>{setQuestions(qs=>qs.map(q=>q.id===editingQ.id?editingQ:q));setEditingQ(null);}} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg">Save</button>
                      <button onClick={()=>setEditingQ(null)} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white text-sm font-medium flex-1"><span className="text-slate-500 mr-2">Q{i+1}.</span>{q.text}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={()=>setEditingQ({...q})} className="p-1.5 text-slate-500 hover:text-blue-400 transition"><Edit3 size={12}/></button>
                        <button onClick={()=>setQuestions(qs=>qs.filter(x=>x.id!==q.id))} className="p-1.5 text-slate-500 hover:text-red-400 transition"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt,oi) => (
                        <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg border ${oi===q.correct?'bg-green-900/30 border-green-700/50 text-green-300':'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          {String.fromCharCode(65+oi)}. {opt}
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-2 italic">✓ {q.explanation}</p>
                  </>
                )}
              </div>
            ))}
            {questions.length===0 && (
              <div className="text-center py-10 text-slate-500">
                <Target size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="text-sm">Generate questions with AI above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {err && <p className="text-red-400 text-xs">{err}</p>}
      <div className="flex gap-3">
        <button onClick={save} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
          {tournament?'💾 Save Changes':'🏆 Create Tournament'}
        </button>
        <button onClick={onCancel} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm">Cancel</button>
      </div>
    </div>
  );
}

// ── Play ──────────────────────────────────────────────────────────────────────
function TournamentPlay({ tournament, onFinish }: { tournament:Tournament; onFinish:(r:TournamentResult)=>void }) {
  const { user } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [allAnswers, setAllAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(tournament.time_limit);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const startTime = useRef(Date.now());

  const q = tournament.questions[current];
  const isLast = current === tournament.questions.length-1;

  useEffect(() => {
    setTimeLeft(tournament.time_limit);
    setSelected(null);
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t<=1) { clearInterval(timerRef.current!); handleAnswer(-1, []); return 0; }
      return t-1;
    }), 1000);
    return () => clearInterval(timerRef.current!);
  }, [current]);

  const handleAnswer = (idx: number, prevAnswers?: number[]) => {
    if (selected !== null) return;
    clearInterval(timerRef.current!);
    setSelected(idx);
    const newAnswers = [...(prevAnswers ?? allAnswers), idx];
    setAllAnswers(newAnswers);
    setTimeout(() => {
      if (isLast) {
        const score = newAnswers.filter((a,i) => a===tournament.questions[i].correct).length;
        onFinish({ id:Date.now().toString(), tournament_id:tournament.id, user_id:user?.id||'anon', username:user?.username||user?.email||'Anonymous', score, total:tournament.questions.length, time_taken:Math.round((Date.now()-startTime.current)/1000), submitted_at:new Date().toISOString() });
      } else { setCurrent(c=>c+1); }
    }, 1500);
  };

  const pct = Math.round((timeLeft/tournament.time_limit)*100);
  const timerColor = pct>50?'#22c55e':pct>25?'#eab308':'#ef4444';

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">{tournament.title}</span>
          <span className="text-slate-400 text-sm font-mono">{current+1}/{tournament.questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${(current/tournament.questions.length)*100}%`}}/></div>

        <div className="flex justify-center">
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d42" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={timerColor} strokeWidth="3"
                strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round" style={{transition:'stroke-dasharray 1s linear,stroke 0.3s'}}/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{timeLeft}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <p className="text-white text-lg font-semibold leading-relaxed mb-5">{q.text}</p>
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt,i) => {
              let cls = 'bg-slate-800 border-2 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 cursor-pointer';
              if (selected!==null) {
                if (i===q.correct) cls='bg-green-900/50 border-2 border-green-600 text-green-200';
                else if (i===selected) cls='bg-red-900/50 border-2 border-red-600 text-red-300';
                else cls='bg-slate-800 border-2 border-slate-700 text-slate-500';
              }
              return (
                <button key={i} onClick={()=>handleAnswer(i)} disabled={selected!==null}
                  className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${cls}`}>
                  <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{String.fromCharCode(65+i)}</span>
                  <span className="text-sm flex-1">{opt}</span>
                  {selected!==null && i===q.correct && <CheckCircle size={16} className="text-green-400"/>}
                  {selected!==null && i===selected && i!==q.correct && <XCircle size={16} className="text-red-400"/>}
                </button>
              );
            })}
          </div>
          {selected!==null && <div className="mt-4 bg-blue-950/30 border border-blue-800/30 rounded-xl p-3 text-blue-200 text-sm">💡 {q.explanation}</div>}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ result, tournament, onBack }: { result:TournamentResult; tournament:Tournament; onBack:()=>void }) {
  const pct = Math.round(result.score/result.total*100);
  const em = pct>=90?'🏆':pct>=70?'🥇':pct>=50?'🥈':'📚';
  const msg = pct>=90?'Outstanding!':pct>=70?'Great job!':pct>=50?'Good effort!':'Keep studying!';
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="text-6xl">{em}</div>
        <h2 className="text-2xl font-bold text-white">{msg}</h2>
        <p className="text-slate-400 text-sm">{tournament.title}</p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-6xl font-bold text-blue-400 mb-1">{pct}%</div>
          <p className="text-slate-400 text-sm">{result.score} / {result.total} correct</p>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{width:`${pct}%`}}/>
          </div>
        </div>
        <button onClick={onBack} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">← Back to Tournaments</button>
      </div>
    </div>
  );
}

function Leaderboard({ tournament, results, onClose }: { tournament:Tournament; results:TournamentResult[]; onClose:()=>void }) {
  const sorted = [...results.filter(r=>r.tournament_id===tournament.id)].sort((a,b)=>b.score-a.score||a.time_taken-b.time_taken);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0a1525] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-bold flex items-center gap-2"><Trophy size={16} className="text-yellow-400"/>{tournament.title} — Leaderboard</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16}/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2">
          {sorted.length===0 && <p className="text-slate-500 text-sm text-center py-6">No results yet</p>}
          {sorted.map((r,i) => (
            <div key={r.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${i===0?'bg-yellow-900/20 border-yellow-700/40':i===1?'bg-slate-700/20 border-slate-600/40':i===2?'bg-orange-900/20 border-orange-700/40':'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
                <span className="text-white text-sm font-medium">{r.username}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{r.score}/{r.total}</div>
                <div className="text-slate-500 text-xs">{Math.round(r.score/r.total*100)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TournamentPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.role==='superadmin';
  const [tournaments, setTournaments] = useState<Tournament[]>(loadTournaments);
  const [results, setResults] = useState<TournamentResult[]>(loadResults);
  const [view, setView] = useState<'list'|'create'|'edit'|'play'|'result'>('list');
  const [selected, setSelected] = useState<Tournament|null>(null);
  const [lastResult, setLastResult] = useState<TournamentResult|null>(null);
  const [lbFor, setLbFor] = useState<Tournament|null>(null);

  const persist = (ts:Tournament[]) => { setTournaments(ts); saveTournaments(ts); };

  const saveTournament = (t:Tournament) => {
    persist(tournaments.some(x=>x.id===t.id)?tournaments.map(x=>x.id===t.id?t:x):[...tournaments,t]);
    setView('list');
  };

  const finishPlay = (result:TournamentResult) => {
    const newResults=[...results,result]; setResults(newResults); saveResults(newResults); setLastResult(result); setView('result');
  };

  if (view==='create') return <TournamentEditor onSave={saveTournament} onCancel={()=>setView('list')}/>;
  if (view==='edit'&&selected) return <TournamentEditor tournament={selected} onSave={saveTournament} onCancel={()=>setView('list')}/>;
  if (view==='play'&&selected) return <TournamentPlay tournament={selected} onFinish={finishPlay}/>;
  if (view==='result'&&lastResult&&selected) return <ResultScreen result={lastResult} tournament={selected} onBack={()=>setView('list')}/>;

  const visible = isSuperadmin?tournaments:tournaments.filter(t=>t.status!=='draft');
  const myResults = results.filter(r=>r.user_id===user?.id);
  const myAvg = myResults.length?Math.round(myResults.reduce((s,r)=>s+r.score/r.total*100,0)/myResults.length):null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {lbFor && <Leaderboard tournament={lbFor} results={results} onClose={()=>setLbFor(null)}/>}

      <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-800/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Trophy size={24} className="text-yellow-400"/>SDG Tournaments</h1>
            <p className="text-slate-400 text-sm mt-1">Compete in AI-powered SDG knowledge tournaments</p>
          </div>
          {isSuperadmin && (
            <button onClick={()=>setView('create')} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all">
              <Plus size={16}/>New Tournament
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['Active',tournaments.filter(t=>t.status==='active').length,'text-green-400'],['Your Entries',myResults.length,'text-blue-400'],['Avg Score',myAvg?`${myAvg}%`:'—','text-yellow-400']].map(([l,v,c])=>(
            <div key={l as string} className="bg-black/20 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${c}`}>{v}</div>
              <div className="text-xs text-slate-400">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {isSuperadmin && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-800/30 rounded-xl px-4 py-2.5">
          <ShieldCheck size={14} className="text-red-400"/>
          <p className="text-red-300 text-xs">Superadmin — can see drafts and manage all tournaments</p>
        </div>
      )}

      {visible.length===0 ? (
        <div className="text-center py-16 text-slate-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-20"/>
          <p>{isSuperadmin?'No tournaments yet. Create the first!':'No active tournaments.'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {visible.map(t => {
            const userResult = results.find(r=>r.tournament_id===t.id&&r.user_id===user?.id);
            const statusColor = {draft:'bg-slate-700 text-slate-300',active:'bg-green-900/50 text-green-300 border border-green-700/40',closed:'bg-red-900/30 text-red-400 border border-red-700/30'}[t.status];
            return (
              <div key={t.id} className="space-y-1">
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-bold">{t.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor}`}>
                          {{draft:'🔒 Draft',active:'✅ Active',closed:'🏁 Closed'}[t.status]}
                        </span>
                      </div>
                      {t.description && <p className="text-slate-400 text-xs mb-2">{t.description}</p>}
                      <div className="flex flex-wrap gap-1 mb-2">{t.sdg_topics.map(n=><SdgBadge key={n} goal={n}/>)}</div>
                      <div className="flex gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Target size={10}/>{t.questions.length} Qs</span>
                        <span className="flex items-center gap-1"><Clock size={10}/>{t.time_limit}s/Q</span>
                      </div>
                    </div>
                    {isSuperadmin && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={()=>{setSelected(t);setView('edit');}} className="p-2 text-slate-500 hover:text-blue-400 bg-slate-800 rounded-lg transition"><Edit3 size={12}/></button>
                        <button onClick={()=>{if(confirm('Delete?'))persist(tournaments.filter(x=>x.id!==t.id));}} className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 rounded-lg transition"><Trash2 size={12}/></button>
                      </div>
                    )}
                  </div>

                  {userResult ? (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-green-300 text-xs font-semibold flex items-center gap-1"><CheckCircle size={11}/>Completed</p>
                        <p className="text-white font-bold text-sm">{userResult.score}/{userResult.total} <span className="text-slate-400 text-xs">({Math.round(userResult.score/userResult.total*100)}%)</span></p>
                      </div>
                      {t.status==='active' && <button onClick={()=>{setSelected(t);setView('play');}} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg flex items-center gap-1"><RefreshCw size={11}/>Retry</button>}
                    </div>
                  ) : t.status==='active' ? (
                    <button onClick={()=>{setSelected(t);setView('play');}}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                      <Play size={14}/>Start Tournament
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-slate-800 text-slate-500 text-sm rounded-xl text-center">
                      {t.status==='draft'?'🔒 Not yet open':'🏁 Closed'}
                    </div>
                  )}
                </div>
                <button onClick={()=>setLbFor(t)} className="w-full text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 py-1 transition">
                  <Users size={11}/>Leaderboard
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
