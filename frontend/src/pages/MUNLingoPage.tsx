// src/pages/MUNLingoPage.tsx — MUN Session Game (adapted from MUNLingo HTML)
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Stage = 1|2|3|4|5|6|7;
type RelationType = 'ally'|'opposing'|null;
interface Message { id: number; sender: string; text: string; avatar: string; outgoing: boolean; time: string; }
interface GameSelections { competition: string; committee: string; topic: string; country: string; }
interface Delegate { key: string; name: string; flag: string; position: string; tags: string[]; relation: RelationType; }

// ── Constants ─────────────────────────────────────────────────────────────────
const COMPETITIONS = [
  { key:'national', label:'National MUN', emoji:'🇺🇳' },
  { key:'international', label:'International', emoji:'🌍' },
  { key:'unsc', label:'UNSC Special', emoji:'🛡️' },
  { key:'crisis', label:'Crisis', emoji:'⚡' },
];
const COMMITTEES = [
  { key:'unsc', label:'UNSC', emoji:'🛡️' },
  { key:'unep', label:'UNEP', emoji:'🌿' },
  { key:'unhrc', label:'UNHRC', emoji:'⚖️' },
  { key:'who', label:'WHO', emoji:'🏥' },
];
const TOPICS = [
  { key:'climate', label:'Climate Security', emoji:'🌍' },
  { key:'cyber', label:'Cybersecurity', emoji:'💻' },
  { key:'refugee', label:'Refugee Crisis', emoji:'🏃' },
  { key:'nuclear', label:'Nuclear Disarmament', emoji:'☢️' },
];
const COUNTRIES: { key:string; label:string; emoji:string; hp:number }[] = [
  { key:'germany', label:'Germany', emoji:'🇩🇪', hp:85 },
  { key:'france',  label:'France',  emoji:'🇫🇷', hp:73 },
  { key:'japan',   label:'Japan',   emoji:'🇯🇵', hp:80 },
  { key:'brazil',  label:'Brazil',  emoji:'🇧🇷', hp:54 },
];
const STAGE_NAMES: Record<Stage,string> = {
  1:'Position Statement', 2:'GSL Round 1', 3:'GSL Round 2',
  4:'Unmoderated Caucus', 5:'Draft Resolution', 6:'Amendments', 7:'Final Vote',
};
const STAGE_HINTS: Record<Stage,string> = {
  1:'Write your position statement (120–180 words)',
  2:'Deliver your opening speech',
  3:'Respond to one delegate',
  4:'Choose your allies and negotiate',
  5:'Review draft resolution clauses',
  6:'Vote on proposed amendments',
  7:'Final vote on the resolution',
};

const DELEGATES: Omit<Delegate,'relation'>[] = [
  { key:'france',  name:'France',  flag:'🇫🇷', position:'EU integration, climate action',             tags:['EU Solidarity','Climate']        },
  { key:'usa',     name:'USA',     flag:'🇺🇸', position:'Market solutions, tech innovation',          tags:['Free Market','Technology']        },
  { key:'russia',  name:'Russia',  flag:'🇷🇺', position:'Sovereignty, no binding commitments',        tags:['Sovereignty','Veto Power']        },
  { key:'china',   name:'China',   flag:'🇨🇳', position:'Differentiated responsibilities',            tags:['Developing World','Green Tech']   },
];

const AI_RESPONSES: Record<string, {delegate:string; text:string}[]> = {
  '1': [
    { delegate:'France', text:"France supports your climate leadership. We must act together as a unified bloc." },
    { delegate:'USA',    text:"The US prefers market mechanisms but acknowledges the scientific consensus." },
    { delegate:'Russia', text:"Russia cannot accept binding targets that threaten our development trajectory." },
    { delegate:'China',  text:"China supports common but differentiated responsibilities for all nations." },
  ],
  '2': [
    { delegate:'France', text:"We propose an EU-led initiative for green technology transfer to developing nations." },
    { delegate:'USA',    text:"American innovation will drive the solutions the world needs — without mandates." },
    { delegate:'Russia', text:"National sovereignty must be respected. We reject enforcement mechanisms." },
    { delegate:'China',  text:"South-South cooperation is essential for equitable climate action." },
  ],
  '3': [
    { delegate:'France', text:"We agree with your urgent call to action." },
    { delegate:'USA',    text:"We have serious concerns about the economic impact of binding targets." },
    { delegate:'Russia', text:"This proposal threatens our national strategic interests." },
    { delegate:'China',  text:"A balanced approach respecting all nations is needed." },
  ],
};

// ── Option Button ─────────────────────────────────────────────────────────────
function OptionBtn({ emoji, label, selected, onClick }: { emoji:string; label:string; selected:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
        selected ? 'border-green-500 bg-green-950/40 text-white scale-105'
                 : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
      }`}>
      <span className="text-3xl">{emoji}</span>
      <span className="text-center leading-tight text-xs">{label}</span>
    </button>
  );
}

// ── Selection Screen ──────────────────────────────────────────────────────────
function SelectionScreen({ onStart }: { onStart: (s:GameSelections)=>void }) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<GameSelections>({ competition:'', committee:'', topic:'', country:'' });
  const progress = (step/4)*100;
  const canNext = [sel.competition, sel.committee, sel.topic, sel.country][step-1] !== '';

  const steps = [
    { title:'Choose competition', subtitle:'Select your level', items:COMPETITIONS, key:'competition' as keyof GameSelections },
    { title:'Choose committee',   subtitle:'Select your body',  items:COMMITTEES,   key:'committee'   as keyof GameSelections },
    { title:'Choose topic',       subtitle:'What to debate?',   items:TOPICS,       key:'topic'        as keyof GameSelections },
    { title:'Choose your country',subtitle:'Who to represent?', items:COUNTRIES,    key:'country'      as keyof GameSelections },
  ];
  const cur = steps[step-1];

  return (
    <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width:`${progress}%` }} />
        </div>

        {step > 1 && (
          <button onClick={() => setStep(s=>s-1)} className="flex items-center gap-1 text-gray-500 text-sm mb-4 hover:text-gray-700">
            <ChevronLeft size={16}/> Back
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            {step===1?'🎯':step===2?'🏛️':step===3?'📋':'🇺🇳'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{cur.title}</h2>
          <p className="text-gray-600 mt-1 font-medium">{cur.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {cur.items.map(item => (
            <OptionBtn key={item.key} emoji={item.emoji} label={item.label}
              selected={sel[cur.key] === item.key}
              onClick={() => setSel(s => ({ ...s, [cur.key]: item.key }))} />
          ))}
        </div>

        <button
          disabled={!canNext}
          onClick={() => step < 4 ? setStep(s=>s+1) : onStart(sel)}
          className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all ${
            canNext ? 'bg-green-500 hover:bg-green-400 shadow-lg shadow-green-900/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          {step < 4 ? 'Continue' : 'Start Session'}
        </button>
      </div>
    </div>
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
function GameScreen({ selections, onBack }: { selections: GameSelections; onBack: ()=>void }) {
  const country = COUNTRIES.find(c => c.key === selections.country)!;
  const committee = COMMITTEES.find(c => c.key === selections.committee)!;
  const topic = TOPICS.find(t => t.key === selections.topic)!;

  const [hp, setHp] = useState(country.hp);
  const [stage, setStage] = useState<Stage>(1);
  const [messages, setMessages] = useState<Message[]>([
    { id:0, sender:'AI Chair', text:'Welcome to the committee. We begin with position statements. You have the floor first.', avatar:'🎓', outgoing:false, time:now() },
  ]);
  const [input, setInput] = useState('');
  const [delegates, setDelegates] = useState<Delegate[]>(DELEGATES.map(d => ({ ...d, relation:null })));
  const [amendVotes, setAmendVotes] = useState<Record<number,string|null>>({ 1:null, 2:null });
  const [hpModal, setHpModal] = useState<{show:boolean; change:number}>({ show:false, change:0 });
  const [allyChosen, setAllyChosen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [privateInput, setPrivateInput] = useState('');
  const [privateMessages, setPrivateMessages] = useState<{text:string; out:boolean}[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(1);

  function now() { return new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }); }

  const scroll = useCallback(() => {
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 60);
  }, []);

  useEffect(scroll, [messages, scroll]);

  const addMsg = useCallback((sender:string, text:string, outgoing:boolean) => {
    const avatarMap: Record<string,string> = {
      'AI Chair':'🎓', 'France':'🇫🇷', 'USA':'🇺🇸', 'Russia':'🇷🇺', 'China':'🇨🇳', 'You': country.emoji
    };
    setMessages(prev => [...prev, { id: msgId.current++, sender, text, avatar: avatarMap[sender]||'👤', outgoing, time: now() }]);
  }, [country.emoji]);

  const changeHp = useCallback((delta: number) => {
    setHp(h => Math.min(100, Math.max(0, h + delta)));
    if (Math.abs(delta) >= 3) setHpModal({ show:true, change:delta });
  }, []);

  const nextStage = useCallback((s: Stage) => {
    setStage(s);
    if (s === 4) {
      addMsg('AI Chair', 'Unmoderated caucus begins. Choose your allies wisely.', false);
    } else if (s === 5) {
      addMsg('AI Chair', 'Draft resolution prepared. France has added clauses. Opposing bloc has submitted amendments.', false);
    } else if (s === 6) {
      addMsg('AI Chair', 'Moving to final vote. All in favor?', false);
      setTimeout(() => {
        addMsg('France','France votes YES', false);
        addMsg('USA','USA votes YES', false);
        addMsg('Russia','Russia votes NO', false);
        addMsg('China','China abstains', false);
        setTimeout(() => {
          const allies = delegates.filter(d=>d.relation==='ally').length;
          const finalHp = hp + (allies >= 2 ? 10 : 0);
          addMsg('AI Chair',`Resolution passes! Your performance HP: ${finalHp} — excellent work, delegate.`, false);
        }, 1200);
      }, 800);
    }
  }, [addMsg, delegates, hp]);

  const submitAction = () => {
    if (!input.trim() && stage <= 3) return;
    if (input.trim()) { addMsg('You', input, true); setInput(''); }

    switch (stage) {
      case 1:
        changeHp(8);
        setTimeout(() => {
          AI_RESPONSES['1'].forEach(r => addMsg(r.delegate, r.text, false));
          addMsg('AI Chair','Position statements complete. Moving to GSL Round 1.', false);
          nextStage(2);
        }, 1200);
        break;
      case 2:
        changeHp(5);
        setTimeout(() => {
          AI_RESPONSES['2'].forEach(r => addMsg(r.delegate, r.text, false));
          addMsg('AI Chair','Round 1 complete. Prepare your rebuttal.', false);
          nextStage(3);
        }, 1200);
        break;
      case 3:
        changeHp(6);
        setTimeout(() => {
          AI_RESPONSES['3'].forEach(r => addMsg(r.delegate, r.text, false));
          addMsg('AI Chair','Moving to Unmoderated Caucus.', false);
          nextStage(4);
        }, 1200);
        break;
    }
  };

  const setRelation = (key: string, rel: RelationType) => {
    setDelegates(prev => prev.map(d => d.key === key ? { ...d, relation: rel } : d));
  };

  const confirmAllies = () => {
    const allyList = delegates.filter(d => d.relation === 'ally');
    let bonus = 0;
    delegates.forEach(d => {
      if (d.key==='france' && d.relation==='ally') bonus+=5;
      if (d.key==='usa'    && d.relation==='ally') bonus+=3;
      if (d.key==='russia' && d.relation==='ally') bonus-=5;
      if (d.key==='china'  && d.relation==='ally') bonus+=2;
    });
    changeHp(bonus);
    addMsg('AI Chair',`Alliances recorded. You have ${allyList.length} ${allyList.length===1?'ally':'allies'}.`, false);
    addMsg('AI Chair','Now drafting resolution. France joins as co-submitter.', false);
    setAllyChosen(true);
    nextStage(5);
  };

  const setAmend = (n: number, v: string) => setAmendVotes(prev => ({ ...prev, [n]:v }));

  const submitAmends = () => {
    let bonus = 0;
    if (amendVotes[1]==='accept') bonus+=2;
    if (amendVotes[2]==='reject') bonus+=3;
    changeHp(bonus);
    addMsg('AI Chair','Amendments processed. Moving to final vote.', false);
    nextStage(6);
  };

  const sendPrivate = () => {
    if (!privateInput.trim() || stage !== 4) return;
    setPrivateMessages(p => [...p, { text: privateInput, out:true }]);
    setPrivateInput('');
    setTimeout(() => {
      setPrivateMessages(p => [...p, { text:'Noted. We will discuss further.', out:false }]);
      changeHp(1);
    }, 900);
  };

  const stageProgress = ((stage - 1) / 7) * 100;
  const hpPct = (hp/100)*100;
  const allRelationsSet = delegates.every(d => d.relation !== null);
  const allAmendsSet = amendVotes[1] !== null && amendVotes[2] !== null;

  return (
    <div className="min-h-screen bg-[#235390] flex items-start justify-center p-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#235390] p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
                <ChevronLeft size={18}/>
              </button>
              <span className="font-bold text-base">MUNLingo · Solo</span>
            </div>
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Stage {stage}/7: {STAGE_NAMES[stage]}
            </span>
          </div>
          <div className="bg-white/20 text-sm px-3 py-1 rounded-full inline-block mb-3">
            {committee.label} · {topic.label}
          </div>
          {/* HP Bar */}
          {/* Stage progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{width: `${stageProgress}%`}}/>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{country.emoji}</span>
              <span className="text-sm font-medium w-20">{country.label}</span>
              <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width:`${hpPct}%` }}/>
              </div>
              <span className="text-sm font-bold w-8 text-right">{hp}</span>
            </div>
          </div>
        </div>

        {/* Body — chat + delegates side panel */}
        <div className="flex" style={{ height: '520px' }}>
          {/* Chat column */}
          <div className="flex flex-col flex-1 bg-gray-50 min-w-0" style={{ height:'100%' }}>
            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight:0 }}>
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.outgoing ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-[#235390] flex items-center justify-center text-base flex-shrink-0">{m.avatar}</div>
                  <div className={`rounded-2xl px-3 py-2 max-w-[75%] ${m.outgoing ? 'bg-[#235390] text-white' : 'bg-white shadow-sm border border-gray-100'}`}>
                    <div className={`text-[10px] font-bold mb-0.5 ${m.outgoing ? 'text-white/70 text-right' : 'text-gray-700'}`}>{m.sender}</div>
                    <div className={`text-xs leading-relaxed ${m.outgoing ? "text-white" : "text-gray-800"}`}>{m.text}</div>
                    <div className={`text-[9px] mt-1 ${m.outgoing ? 'text-white/50 text-right' : 'text-gray-400'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area — changes per stage */}
            <div className="flex-shrink-0 border-t border-gray-100">
              {/* Stages 1-3: text input */}
              {stage <= 3 && (
                <div className="p-3">
                  <div className="text-[10px] font-bold text-amber-800 bg-amber-100 rounded-lg px-2 py-1.5 mb-2 border border-amber-200">
                    ⚡ YOUR TURN: {STAGE_NAMES[stage]}
                  </div>
                  <div className="text-[10px] text-gray-600 italic mb-1 font-medium">{STAGE_HINTS[stage]}</div>
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitAction();}}}
                    rows={3} placeholder="Type your message..." style={{color:"#1a1a2e"}}
                    className="w-full border-2 border-gray-200 focus:border-green-400 rounded-2xl p-2 text-xs resize-none outline-none mb-2 text-gray-900 bg-white"/>
                  <button onClick={submitAction}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2.5 rounded-2xl text-sm transition-colors">
                    Submit
                  </button>
                </div>
              )}

              {/* Stage 4: ally selection */}
              {stage === 4 && !allyChosen && (
                <div className="p-3">
                  <div className="text-[10px] font-bold text-amber-800 bg-amber-100 rounded-lg px-2 py-1.5 mb-2 border border-amber-200">
                    ⚡ Unmoderated Caucus: Choose allies
                  </div>
                  <div className="space-y-2 mb-3">
                    {delegates.map(d => (
                      <div key={d.key} className="flex items-center justify-between">
                        <span className="text-sm">{d.flag} {d.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setRelation(d.key, 'ally')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all ${
                              d.relation==='ally' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
                            Ally
                          </button>
                          <button onClick={() => setRelation(d.key, 'opposing')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all ${
                              d.relation==='opposing' ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-200 text-gray-500 hover:border-red-400'}`}>
                            Oppose
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={confirmAllies} disabled={!allRelationsSet}
                    className={`w-full py-2.5 rounded-2xl font-bold text-sm transition-colors ${
                      allRelationsSet ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    Confirm Alliances
                  </button>
                </div>
              )}

              {/* Stage 5: draft resolution */}
              {stage === 5 && (
                <div className="p-3 bg-yellow-50 border-t-2 border-yellow-300">
                  <div className="text-xs font-bold text-yellow-800 mb-2">📝 Draft Resolution</div>
                  <div className="text-[10px] bg-white rounded-lg p-2 border-l-4 border-green-500 mb-1">Your clause: Establish climate adaptation fund</div>
                  <div className="text-[10px] bg-white rounded-lg p-2 border-l-4 border-green-400 mb-2">France: Strong monitoring mechanism with annual reviews</div>
                  <div className="text-xs font-bold text-yellow-800 mb-1">Amendments</div>
                  {[1,2].map(n => (
                    <div key={n} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-gray-600 flex-1">Amendment {n}</span>
                      <button onClick={()=>setAmend(n,'accept')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          amendVotes[n]==='accept' ? 'bg-green-100 border-green-500 text-green-700':'border-gray-300 text-gray-500 hover:border-green-400'}`}>Accept</button>
                      <button onClick={()=>setAmend(n,'reject')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          amendVotes[n]==='reject' ? 'bg-red-100 border-red-500 text-red-700':'border-gray-300 text-gray-500 hover:border-red-400'}`}>Reject</button>
                    </div>
                  ))}
                  <button onClick={submitAmends} disabled={!allAmendsSet}
                    className={`w-full mt-2 py-2.5 rounded-2xl font-bold text-sm transition-colors ${
                      allAmendsSet ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    Submit Votes
                  </button>
                </div>
              )}

              {/* Stage 6+: final vote happened automatically */}
              {stage >= 6 && (
                <div className="p-3 text-center text-slate-400 text-xs">
                  Final vote in progress — see chat above
                </div>
              )}
            </div>
          </div>

          {/* Delegate panel */}
          <div className="w-44 bg-gray-50 border-l border-gray-100 overflow-y-auto p-2 flex-shrink-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Delegates</div>
            {delegates.map(d => (
              <div key={d.key}
                className={`rounded-2xl p-2 mb-2 border bg-white ${
                  d.relation==='ally' ? 'border-l-4 border-l-green-500 border-y border-r border-gray-100'
                  : d.relation==='opposing' ? 'border-l-4 border-l-red-400 border-y border-r border-gray-100'
                  : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-base">{d.flag}</span>
                  <span className="text-xs font-bold text-gray-900">{d.name}</span>
                  {d.relation && (
                    <span className={`ml-auto text-[8px] font-bold px-1 py-0.5 rounded ${
                      d.relation==='ally' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {d.relation==='ally' ? 'ALLY' : 'OPP'}
                    </span>
                  )}
                </div>
                <div className="text-[9px] bg-blue-50 text-blue-800 rounded-lg p-1.5 leading-tight">{d.position}</div>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {d.tags.map(t => <span key={t} className="text-[8px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Private chat bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setPrivateOpen(o=>!o)}
          className="w-12 h-12 rounded-full bg-[#235390] text-white shadow-lg flex items-center justify-center text-xl hover:bg-[#2e67b5] transition-colors">
          💬
        </button>
        {privateOpen && (
          <div className="absolute bottom-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm">Private Chat</span>
              <button onClick={() => setPrivateOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {stage !== 4 && <p className="text-xs text-gray-400 italic mb-2">Private chat is available during Unmoderated Caucus (Stage 4)</p>}
            <div className="h-40 overflow-y-auto space-y-2 mb-3">
              {privateMessages.map((m,i) => (
                <div key={i} className={`text-xs rounded-xl px-3 py-2 ${m.out ? 'bg-[#235390] text-white ml-4' : 'bg-gray-100 text-gray-700 mr-4'}`}>{m.text}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={privateInput} onChange={e=>setPrivateInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendPrivate()}
                disabled={stage!==4}
                placeholder={stage===4 ? 'Message...' : 'Unavailable'}
                className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-xs outline-none focus:border-green-400 disabled:bg-gray-50"/>
              <button onClick={sendPrivate} disabled={stage!==4}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs disabled:opacity-40">➤</button>
            </div>
          </div>
        )}
      </div>

      {/* HP Modal */}
      {hpModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={()=>setHpModal(m=>({...m,show:false}))}>
          <div className="bg-white rounded-3xl p-8 text-center max-w-xs mx-4" onClick={e=>e.stopPropagation()}>
            <div className={`text-6xl font-bold mb-2 ${hpModal.change>0?'text-green-500':'text-red-500'}`}>
              {hpModal.change>0?'+':''}{hpModal.change}
            </div>
            <p className="text-gray-600 mb-4">{hpModal.change>0 ? '🎯 Good move!' : '📉 Lost influence'}</p>
            <button onClick={()=>setHpModal(m=>({...m,show:false}))}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-400 transition-colors">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MUNLingoPage() {
  const [started, setStarted] = useState(false);
  const [selections, setSelections] = useState<GameSelections|null>(null);

  if (!started || !selections) {
    return <SelectionScreen onStart={s => { setSelections(s); setStarted(true); }} />;
  }
  return <GameScreen selections={selections} onBack={() => { setStarted(false); setSelections(null); }} />;
}
