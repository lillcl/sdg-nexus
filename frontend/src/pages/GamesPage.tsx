import { useState } from 'react';
import { Flag, Building, ArrowLeft } from 'lucide-react';

type GameType = 'flags' | 'capitals' | null;

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  const games = [
    {
      id: 'flags' as GameType,
      title: 'Identify Flags',
      description: 'Test your knowledge of world flags. Identify the country from its flag emoji!',
      icon: Flag,
      color: 'from-red-500 to-pink-500',
      emoji: '🚩',
    },
    {
      id: 'capitals' as GameType,
      title: 'Capital Connect',
      description: 'Match countries to their capital cities. How many can you get right?',
      icon: Building,
      color: 'from-purple-500 to-violet-500',
      emoji: '🏛️',
    },
  ];

  if (selectedGame === 'flags') return <FlagGame onBack={() => setSelectedGame(null)} />;
  if (selectedGame === 'capitals') return <CapitalGame onBack={() => setSelectedGame(null)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Geography Games</h1>
          <p className="text-xl text-blue-200">Learn about the world through interactive games</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <button key={game.id} onClick={() => setSelectedGame(game.id)}
                className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left">
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-blue-200 text-sm mb-6">{game.description}</p>
                  <div className="flex items-center text-sm font-medium text-blue-300 group-hover:text-white">
                    Play Now
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Flag Game Data ────────────────────────────────────────────────────────────
const FLAG_DATA = [
  { flag: '🇺🇸', country: 'United States', options: ['United States', 'Australia', 'United Kingdom', 'Canada'] },
  { flag: '🇯🇵', country: 'Japan', options: ['China', 'Japan', 'South Korea', 'Taiwan'] },
  { flag: '🇧🇷', country: 'Brazil', options: ['Argentina', 'Portugal', 'Brazil', 'Mexico'] },
  { flag: '🇩🇪', country: 'Germany', options: ['Austria', 'Germany', 'Netherlands', 'Belgium'] },
  { flag: '🇫🇷', country: 'France', options: ['Spain', 'Italy', 'France', 'Portugal'] },
  { flag: '🇮🇳', country: 'India', options: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka'] },
  { flag: '🇨🇦', country: 'Canada', options: ['United States', 'Australia', 'Canada', 'New Zealand'] },
  { flag: '🇦🇺', country: 'Australia', options: ['Australia', 'New Zealand', 'United Kingdom', 'Canada'] },
  { flag: '🇨🇳', country: 'China', options: ['Japan', 'South Korea', 'China', 'Vietnam'] },
  { flag: '🇬🇧', country: 'United Kingdom', options: ['Ireland', 'Australia', 'New Zealand', 'United Kingdom'] },
  { flag: '🇰🇷', country: 'South Korea', options: ['Japan', 'China', 'South Korea', 'North Korea'] },
  { flag: '🇲🇽', country: 'Mexico', options: ['Colombia', 'Mexico', 'Brazil', 'Argentina'] },
  { flag: '🇿🇦', country: 'South Africa', options: ['Nigeria', 'Kenya', 'South Africa', 'Ethiopia'] },
  { flag: '🇪🇸', country: 'Spain', options: ['Spain', 'Portugal', 'Italy', 'Greece'] },
  { flag: '🇸🇦', country: 'Saudi Arabia', options: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'] },
  { flag: '🇳🇬', country: 'Nigeria', options: ['Ghana', 'Nigeria', 'Cameroon', 'Ivory Coast'] },
  { flag: '🇦🇷', country: 'Argentina', options: ['Argentina', 'Uruguay', 'Chile', 'Paraguay'] },
  { flag: '🇳🇴', country: 'Norway', options: ['Sweden', 'Denmark', 'Finland', 'Norway'] },
  { flag: '🇳🇿', country: 'New Zealand', options: ['Australia', 'Fiji', 'New Zealand', 'Papua New Guinea'] },
  { flag: '🇧🇩', country: 'Bangladesh', options: ['Bangladesh', 'Pakistan', 'India', 'Myanmar'] },
];

const CAPITAL_DATA = [
  { flag: '🇫🇷', country: 'France', capital: 'Paris', options: ['London', 'Paris', 'Madrid', 'Rome'] },
  { flag: '🇯🇵', country: 'Japan', capital: 'Tokyo', options: ['Tokyo', 'Beijing', 'Seoul', 'Bangkok'] },
  { flag: '🇧🇷', country: 'Brazil', capital: 'Brasília', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Buenos Aires'] },
  { flag: '🇦🇺', country: 'Australia', capital: 'Canberra', options: ['Sydney', 'Melbourne', 'Brisbane', 'Canberra'] },
  { flag: '🇩🇪', country: 'Germany', capital: 'Berlin', options: ['Munich', 'Berlin', 'Hamburg', 'Frankfurt'] },
  { flag: '🇨🇦', country: 'Canada', capital: 'Ottawa', options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'] },
  { flag: '🇮🇳', country: 'India', capital: 'New Delhi', options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'] },
  { flag: '🇺🇸', country: 'United States', capital: 'Washington D.C.', options: ['New York', 'Los Angeles', 'Washington D.C.', 'Chicago'] },
  { flag: '🇺🇦', country: 'Ukraine', capital: 'Kyiv', options: ['Kharkiv', 'Odessa', 'Kyiv', 'Lviv'] },
  { flag: '🇪🇬', country: 'Egypt', capital: 'Cairo', options: ['Alexandria', 'Cairo', 'Giza', 'Luxor'] },
  { flag: '🇨🇳', country: 'China', capital: 'Beijing', options: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'] },
  { flag: '🇦🇷', country: 'Argentina', capital: 'Buenos Aires', options: ['Montevideo', 'Santiago', 'Buenos Aires', 'Lima'] },
  { flag: '🇿🇦', country: 'South Africa', capital: 'Pretoria', options: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'] },
  { flag: '🇰🇷', country: 'South Korea', capital: 'Seoul', options: ['Busan', 'Incheon', 'Seoul', 'Daegu'] },
  { flag: '🇲🇽', country: 'Mexico', capital: 'Mexico City', options: ['Guadalajara', 'Monterrey', 'Mexico City', 'Tijuana'] },
  { flag: '🇳🇬', country: 'Nigeria', capital: 'Abuja', options: ['Lagos', 'Kano', 'Abuja', 'Ibadan'] },
  { flag: '🇷🇺', country: 'Russia', capital: 'Moscow', options: ['St. Petersburg', 'Moscow', 'Novosibirsk', 'Yekaterinburg'] },
  { flag: '🇮🇷', country: 'Iran', capital: 'Tehran', options: ['Isfahan', 'Mashhad', 'Tehran', 'Tabriz'] },
  { flag: '🇹🇷', country: 'Turkey', capital: 'Ankara', options: ['Istanbul', 'Ankara', 'Izmir', 'Bursa'] },
  { flag: '🇮🇩', country: 'Indonesia', capital: 'Jakarta', options: ['Bali', 'Surabaya', 'Jakarta', 'Bandung'] },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestions(data: any[], count = 10) {
  return shuffle(data).slice(0, count);
}

// ── Flag Game Component ───────────────────────────────────────────────────────
function FlagGame({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    setQuestions(getQuestions(FLAG_DATA));
    setCurrent(0); setScore(0); setSelected(null); setDone(false);
  };

  const handleAnswer = (ans: string) => {
    if (selected) return;
    setSelected(ans);
    const correct = ans === questions[current].country;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      setSelected(null);
      if (current + 1 < questions.length) setCurrent(c => c + 1);
      else setDone(true);
    }, 900);
  };

  if (questions.length === 0) {
    return (
      <GameIntro title="Flag Identification" desc="Identify the country from its flag emoji!" color="from-red-500 to-pink-500"
        icon={<Flag className="w-10 h-10 text-white" />} onBack={onBack} onStart={start} bg="via-red-900" />
    );
  }
  if (done) {
    return (
      <GameResult score={score} total={questions.length} color="from-red-500 to-pink-500"
        onBack={onBack} onPlay={start} bg="via-red-900" />
    );
  }

  const q = questions[current];
  return (
    <GameLayout bg="via-red-900" onBack={onBack} current={current} total={questions.length} score={score}>
      <div className="text-center mb-8">
        <div className="text-[140px] leading-none mb-6 select-none" style={{fontFamily:"'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"}}>{q.flag}</div>
        <h3 className="text-2xl font-bold text-white">Which country does this flag belong to?</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.options.map((opt: string) => (
          <AnswerBtn key={opt} label={opt} selected={selected} correct={q.country} onSelect={handleAnswer} />
        ))}
      </div>
    </GameLayout>
  );
}

// ── Capital Game Component ────────────────────────────────────────────────────
function CapitalGame({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    setQuestions(getQuestions(CAPITAL_DATA));
    setCurrent(0); setScore(0); setSelected(null); setDone(false);
  };

  const handleAnswer = (ans: string) => {
    if (selected) return;
    setSelected(ans);
    if (ans === questions[current].capital) setScore(s => s + 1);
    setTimeout(() => {
      setSelected(null);
      if (current + 1 < questions.length) setCurrent(c => c + 1);
      else setDone(true);
    }, 900);
  };

  if (questions.length === 0) {
    return (
      <GameIntro title="Capital Connect" desc="Match countries to their capital cities!" color="from-purple-500 to-violet-500"
        icon={<Building className="w-10 h-10 text-white" />} onBack={onBack} onStart={start} bg="via-purple-900" />
    );
  }
  if (done) {
    return (
      <GameResult score={score} total={questions.length} color="from-purple-500 to-violet-500"
        onBack={onBack} onPlay={start} bg="via-purple-900" />
    );
  }

  const q = questions[current];
  return (
    <GameLayout bg="via-purple-900" onBack={onBack} current={current} total={questions.length} score={score}>
      <div className="text-center mb-8">
        <div className="text-[120px] leading-none mb-4 select-none" style={{fontFamily:"'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"}}>{q.flag}</div>
        <h3 className="text-2xl font-bold text-white">What is the capital of <span className="text-purple-300">{q.country}</span>?</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.options.map((opt: string) => (
          <AnswerBtn key={opt} label={opt} selected={selected} correct={q.capital} onSelect={handleAnswer} />
        ))}
      </div>
    </GameLayout>
  );
}

// ── Shared UI Components ──────────────────────────────────────────────────────
function AnswerBtn({ label, selected, correct, onSelect }: { label: string; selected: string | null; correct: string; onSelect: (v: string) => void }) {
  const isSelected = selected === label;
  const isCorrect = label === correct;
  let cls = 'p-4 border-2 rounded-xl transition-all font-medium text-left text-white ';
  if (!selected) cls += 'border-slate-600 hover:border-blue-400 hover:bg-blue-500/10 cursor-pointer';
  else if (isCorrect) cls += 'border-green-500 bg-green-500/20 text-green-300';
  else if (isSelected) cls += 'border-red-500 bg-red-500/20 text-red-300';
  else cls += 'border-slate-700 opacity-50';
  return <button className={cls} onClick={() => onSelect(label)}>{label}</button>;
}

function GameLayout({ bg, onBack, current, total, score, children }: any) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 ${bg} to-slate-900 p-6`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-6 text-blue-300 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Games
        </button>
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6 text-sm text-blue-200">
            <span>Question {current + 1} / {total}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-8">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((current) / total) * 100}%` }} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function GameIntro({ title, desc, color, icon, onBack, onStart, bg }: any) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 ${bg} to-slate-900 p-8`}>
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="mb-6 text-blue-300 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Games
        </button>
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl shadow-xl p-12 text-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-6`}>
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-blue-200 mb-8">{desc}</p>
          <button onClick={onStart}
            className={`px-8 py-4 bg-gradient-to-r ${color} text-white rounded-xl font-semibold hover:shadow-lg transition text-lg`}>
            Start Game (10 Questions)
          </button>
        </div>
      </div>
    </div>
  );
}

function GameResult({ score, total, color, onBack, onPlay, bg }: any) {
  const pct = (score / total) * 100;
  const msg = pct === 100 ? 'Perfect score! 🎉' : pct >= 70 ? 'Great job! 👏' : pct >= 50 ? 'Good effort! 💪' : 'Keep practicing! 📚';
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 ${bg} to-slate-900 p-8`}>
      <div className="max-w-xl mx-auto">
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
          <div className={`text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-4`}>
            {score} / {total}
          </div>
          <p className="text-blue-200 mb-8 text-lg">{msg}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={onPlay} className={`px-6 py-3 bg-gradient-to-r ${color} text-white rounded-xl font-semibold hover:shadow-lg transition`}>
              Play Again
            </button>
            <button onClick={onBack} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition">
              Back to Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
