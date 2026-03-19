// AssessmentPage — AI-generated SDG literacy quiz + PDF certificate
import { useState, useRef } from 'react';
import { Award, CheckCircle, XCircle, Loader, RotateCcw, Download, Star, ChevronRight } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';
import { SDG_FULL_DATA } from '@/data/sdgGoals';

const SDG_COLORS: Record<number,string> = {};
SDG_FULL_DATA.forEach(g => { SDG_COLORS[g.goal] = g.color; });

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;    // 0-based index
  explanation: string;
  sdg_target?: string;
}

interface QuizResult {
  score: number; total: number; pct: number;
  answers: Record<number, number>; // questionId → chosen index
}

// ── Generate questions via backend AI ──────────────────────────────────────
async function fetchQuestions(sdgNum: number, token: string | null): Promise<Question[]> {
  const goal = SDG_FULL_DATA.find(g => g.goal === sdgNum)!;
  const targetsText = goal.targets.slice(0,5).map(t => `${t.code}: ${t.description}`).join('\n');

  const prompt = `Generate exactly 10 multiple-choice questions testing knowledge of UN SDG ${sdgNum}: ${goal.title}.

Use these official UN targets as source material:
${targetsText}

Return ONLY a JSON array of 10 objects, no other text:
[
  {
    "id": 1,
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of correct answer referencing UN target.",
    "sdg_target": "${sdgNum}.1"
  }
]

Requirements:
- Questions must test real knowledge of UN 2030 Agenda targets and indicators
- Options must be plausible — avoid obviously wrong answers
- Mix question types: definitions, statistics, targets, indicators, real examples
- correct field is 0-based index of the correct option in the options array`;

  const system = `You are an expert on the UN Sustainable Development Goals and 2030 Agenda. Generate accurate, educational quiz questions based on official UN targets. Always return valid JSON only.`;

  const r = await api.post('/ai/chat',
    { prompt, system },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  const text = (r.data?.text || r.data?.content || '').trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in response');
  const parsed = JSON.parse(match[0]);
  return parsed.slice(0, 10);
}

// ── Certificate PDF generator (pure HTML → print) ─────────────────────────
function generateCertificate(name: string, sdgNum: number, score: number, total: number) {
  const goal = SDG_FULL_DATA.find(g => g.goal === sdgNum)!;
  const pct = Math.round((score/total)*100);
  const grade = pct >= 90 ? 'With Distinction' : pct >= 70 ? 'With Merit' : 'Completed';
  const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
  const color = goal.color;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Georgia', serif; background: white; display:flex; justify-content:center; align-items:center; min-height:100vh; }
  .cert { width:794px; height:562px; border:12px solid ${color}; border-radius:16px; padding:40px; position:relative; background:#fff; }
  .corner { position:absolute; width:60px; height:60px; border-radius:8px; background:${color}22; }
  .corner.tl { top:12px; left:12px; }
  .corner.tr { top:12px; right:12px; }
  .corner.bl { bottom:12px; left:12px; }
  .corner.br { bottom:12px; right:12px; }
  .header { text-align:center; margin-bottom:24px; }
  .logo { font-size:48px; margin-bottom:8px; }
  .platform { font-size:22px; font-weight:bold; color:${color}; letter-spacing:4px; text-transform:uppercase; }
  .subtitle { font-size:11px; color:#666; letter-spacing:2px; margin-top:2px; }
  .divider { width:80%; margin:16px auto; height:2px; background:linear-gradient(to right, transparent, ${color}, transparent); }
  .certifies { font-size:13px; color:#666; text-align:center; margin-bottom:8px; font-style:italic; }
  .name { font-size:36px; text-align:center; color:#1a1a2e; margin:8px 0; border-bottom:2px solid #eee; padding-bottom:8px; }
  .achievement { font-size:13px; text-align:center; color:#444; margin:12px 0; }
  .sdg-badge { display:inline-flex; align-items:center; gap:8px; background:${color}; color:white; padding:8px 20px; border-radius:50px; font-size:16px; font-weight:bold; margin:8px auto; }
  .center { text-align:center; }
  .score { font-size:48px; font-weight:bold; color:${color}; text-align:center; margin:8px 0; }
  .grade { font-size:18px; text-align:center; color:#444; font-style:italic; margin-bottom:16px; }
  .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:20px; }
  .footer-item { text-align:center; }
  .footer-label { font-size:10px; color:#999; border-top:1px solid #ddd; padding-top:4px; margin-top:20px; }
  .sig { font-size:18px; color:${color}; font-style:italic; }
  .date-val { font-size:12px; color:#555; }
  .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:80px; opacity:0.03; color:${color}; font-weight:900; pointer-events:none; white-space:nowrap; }
</style>
</head>
<body>
<div class="cert">
  <div class="watermark">SDG NEXUS</div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="header">
    <div class="logo">${goal.icon}</div>
    <div class="platform">SDG Nexus</div>
    <div class="subtitle">Certificate of SDG Literacy</div>
  </div>
  <div class="divider"></div>
  <p class="certifies">This certifies that</p>
  <div class="name">${name || 'SDG Champion'}</div>
  <p class="achievement">has successfully demonstrated knowledge of the United Nations Sustainable Development Goals</p>
  <div class="center">
    <div class="sdg-badge" style="display:inline-flex;">
      ${goal.icon} SDG ${sdgNum}: ${goal.title}
    </div>
  </div>
  <div class="score">${pct}%</div>
  <div class="grade">${grade} · ${score}/${total} questions correct</div>
  <div class="footer">
    <div class="footer-item">
      <div class="sig">SDG Nexus</div>
      <div class="footer-label">Platform Authority</div>
    </div>
    <div class="footer-item">
      <div class="date-val">${date}</div>
      <div class="footer-label">Date of Achievement</div>
    </div>
    <div class="footer-item">
      <div style="font-size:10px; color:#999; text-align:center; max-width:120px;">Aligned with UN 2030 Agenda<br/>SDSN SDR 2025</div>
      <div class="footer-label">Data Source</div>
    </div>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (w) { w.document.write(html); w.document.close(); }
}

// ── SDG Selector ──────────────────────────────────────────────────────────
function SDGSelector({ onStart }: { onStart:(n:number)=>void }) {
  const [hover, setHover] = useState<number|null>(null);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award size={32} className="text-blue-400"/>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">SDG Literacy Assessment</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          10 AI-generated questions per SDG, based on official UN 2030 Agenda targets.
          Score ≥70% to earn your certificate of SDG literacy.
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {SDG_FULL_DATA.map(g => (
          <button key={g.goal}
            onMouseEnter={()=>setHover(g.goal)} onMouseLeave={()=>setHover(null)}
            onClick={()=>onStart(g.goal)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all"
            style={{
              borderColor: hover===g.goal ? g.color : 'transparent',
              background: hover===g.goal ? g.color+'22' : '#0a1525',
            }}>
            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold"
              style={{background: g.color}}>
              <span className="text-[10px] font-mono">{g.goal}</span>
              <span className="text-lg">{g.icon}</span>
            </div>
            <span className="text-[10px] text-slate-400 text-center leading-tight">{g.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────
function Quiz({ sdgNum, onFinish }: { sdgNum:number; onFinish:(r:QuizResult)=>void }) {
  const { token } = useAuthStore();
  const goal = SDG_FULL_DATA.find(g=>g.goal===sdgNum)!;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number,number>>({});
  const [showExplain, setShowExplain] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const qs = await fetchQuestions(sdgNum, token);
      setQuestions(qs);
    } catch(e:any) {
      setError('Could not generate questions. Check that AI is configured (GROQ/OpenAI/Ollama).');
    }
    setLoading(false);
  };

  useState(() => { load(); });

  const answer = (idx: number) => {
    if (answers[questions[current].id] !== undefined) return;
    setAnswers(p => ({...p, [questions[current].id]: idx}));
    setShowExplain(true);
  };

  const next = () => {
    setShowExplain(false);
    if (current + 1 >= questions.length) {
      const score = questions.filter(q => answers[q.id] === q.correct).length;
      onFinish({ score, total:questions.length, pct:Math.round((score/questions.length)*100), answers });
    } else {
      setCurrent(c => c+1);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-slate-400">Generating 10 questions from UN 2030 Agenda targets…</p>
      <p className="text-slate-600 text-xs">This may take 5–15 seconds</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-16">
      <XCircle size={40} className="text-red-400 mx-auto mb-3"/>
      <p className="text-slate-400 mb-4">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm">
        <RotateCcw size={12} className="inline mr-2"/>Retry
      </button>
    </div>
  );

  if (questions.length === 0) return null;

  const q = questions[current];
  const chosen = answers[q.id];
  const answered = chosen !== undefined;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{background: goal.color}}>{goal.icon}</div>
          <span className="text-white text-sm font-semibold">SDG {sdgNum}: {goal.title}</span>
        </div>
        <span className="text-slate-500 text-xs">{current+1}/{questions.length}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{width:`${((current+1)/questions.length)*100}%`, background:goal.color}}/>
      </div>
      {q.sdg_target && <div className="text-xs text-slate-500 mb-2">Target {q.sdg_target}</div>}

      {/* Question */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-white text-sm leading-relaxed font-medium">{q.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ';
          if (!answered) {
            cls += 'border-slate-700 text-slate-300 hover:border-slate-500 bg-slate-900/50 cursor-pointer';
          } else if (i === q.correct) {
            cls += 'border-green-500 bg-green-900/30 text-green-300';
          } else if (i === chosen) {
            cls += 'border-red-500 bg-red-900/30 text-red-300';
          } else {
            cls += 'border-slate-800 text-slate-600 bg-slate-900/20 cursor-default';
          }
          return (
            <button key={i} className={cls} onClick={()=>answer(i)}>
              <span className="font-mono text-xs mr-2 opacity-60">{['A','B','C','D'][i]}.</span>
              {opt}
              {answered && i === q.correct && <CheckCircle size={14} className="inline ml-2 text-green-400"/>}
              {answered && i === chosen && i !== q.correct && <XCircle size={14} className="inline ml-2 text-red-400"/>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplain && (
        <div className={`rounded-xl p-4 mb-4 border text-xs leading-relaxed ${
          chosen === q.correct
            ? 'bg-green-900/20 border-green-700/40 text-green-300'
            : 'bg-red-900/20 border-red-700/40 text-red-300'
        }`}>
          <span className="font-bold">{chosen === q.correct ? '✓ Correct! ' : '✗ Incorrect. '}</span>
          {q.explanation}
        </div>
      )}

      {answered && (
        <button onClick={next}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-2"
          style={{background: goal.color}}>
          {current+1 >= questions.length ? 'See Results' : 'Next Question'}
          <ChevronRight size={16}/>
        </button>
      )}
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────
function Results({ sdgNum, result, onRetry, onBack }: { sdgNum:number; result:QuizResult; onRetry:()=>void; onBack:()=>void }) {
  const goal = SDG_FULL_DATA.find(g=>g.goal===sdgNum)!;
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.username || user?.email?.split('@')[0] || '');
  const passed = result.pct >= 70;
  const stars = result.pct >= 90 ? 3 : result.pct >= 70 ? 2 : 1;

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 text-white font-bold"
        style={{background: goal.color}}>
        <span className="text-2xl font-mono">{sdgNum}</span>
        <span className="text-2xl">{goal.icon}</span>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Assessment Complete</h2>
      <p className="text-slate-400 text-sm mb-5">SDG {sdgNum}: {goal.title}</p>

      <div className="flex justify-center gap-1 mb-4">
        {[1,2,3].map(s => <Star key={s} size={28} className={s<=stars?'text-yellow-400 fill-yellow-400':'text-slate-700'}/>)}
      </div>

      <div className="text-6xl font-bold mb-1" style={{color: goal.color}}>{result.pct}%</div>
      <p className="text-slate-400 text-sm mb-2">{result.score}/{result.total} correct</p>

      <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 ${
        passed ? 'bg-green-900/40 text-green-300 border border-green-700/40' : 'bg-slate-800 text-slate-400'
      }`}>
        {result.pct >= 90 ? '🏆 Distinction' : result.pct >= 70 ? '🎓 Passed — Merit' : '📚 Keep Studying'}
      </div>

      {passed ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
          <Award size={20} className="text-yellow-400 mx-auto mb-2"/>
          <p className="text-white text-sm font-semibold mb-3">Claim your certificate</p>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="Your full name for the certificate"
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 text-center focus:outline-none focus:border-blue-500 mb-3 placeholder:text-slate-600"/>
          <button onClick={()=>generateCertificate(name, sdgNum, result.score, result.total)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-colors"
            style={{background: goal.color}}>
            <Download size={16}/>Download Certificate (PDF)
          </button>
          <p className="text-slate-600 text-[10px] mt-2">Opens print dialog — save as PDF</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
          <p className="text-slate-400 text-sm">Score 70% or above to unlock your certificate.</p>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{width:`${result.pct}%`, background:goal.color}}/>
          </div>
          <p className="text-slate-600 text-xs mt-1">{result.pct}% / 70% needed</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <RotateCcw size={14}/>Retry
        </button>
        <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors">
          Choose Another SDG
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const [sdgNum, setSdgNum] = useState<number|null>(null);
  const [result, setResult] = useState<QuizResult|null>(null);
  const [key, setKey] = useState(0);

  const handleStart = (n: number) => { setSdgNum(n); setResult(null); setKey(k=>k+1); };
  const handleBack = () => { setSdgNum(null); setResult(null); };
  const handleRetry = () => { setResult(null); setKey(k=>k+1); };

  return (
    <div className="min-h-screen bg-[#080c14]">
      {!sdgNum && <SDGSelector onStart={handleStart}/>}
      {sdgNum && !result && <Quiz key={key} sdgNum={sdgNum} onFinish={setResult}/>}
      {sdgNum && result && <Results sdgNum={sdgNum} result={result} onRetry={handleRetry} onBack={handleBack}/>}
    </div>
  );
}
