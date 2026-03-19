// HomePage.tsx — SDG Nexus introduction and feature hub
import { Link } from 'react-router-dom';
import { Map, Users, Gavel, BookOpen, Calendar, LayoutGrid, ArrowRight, Globe2, Database, Zap } from 'lucide-react';
import { SDR_COUNTRY_LIST } from '@/data/sdr2025';
import { useBrandingStore } from '@/store';

const SDG_COLORS = [
  '#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B',
  '#A21942','#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9',
  '#56C02B','#00689D','#19486A',
];
const SDG_LABELS = [
  'No Poverty','Zero Hunger','Good Health','Quality Education','Gender Equality',
  'Clean Water','Clean Energy','Decent Work','Industry','Reduced Inequalities',
  'Sustainable Cities','Responsible Consumption','Climate Action','Life Below Water',
  'Life on Land','Peace & Justice','Partnerships',
];

const FEATURES = [
  {
    to: '/sdgs',
    icon: LayoutGrid,
    color: '#26BDE2',
    title: 'SDG Explorer',
    desc: 'All 17 goals, targets, and indicators from the UN 2030 Agenda — with real global performance data.',
    badge: '169 targets',
  },
  {
    to: '/map',
    icon: Map,
    color: '#4C9F38',
    title: 'World SDG Map',
    desc: 'Interactive choropleth map of SDG performance. Click any country for 126 SDR 2025 indicators.',
    badge: '193 countries',
  },
  {
    to: '/mun',
    icon: Users,
    color: '#FCC30B',
    title: 'MUN Builder',
    desc: 'AI-powered Model UN committee builder — topics, country delegations, background guides, position papers.',
    badge: 'AI-powered',
  },
  {
    to: '/mun/coordinate',
    icon: Gavel,
    color: '#FD6925',
    title: 'MUN Coordinate',
    desc: 'Run your committee session: roll call, speakers list, working papers, voting, directives & press.',
    badge: 'Live session',
  },
  {
    to: '/classroom',
    icon: BookOpen,
    color: '#C5192D',
    title: 'Classroom',
    desc: 'Generate data-backed SDG project challenges for students — grounded in real country statistics.',
    badge: 'For educators',
  },
  {
    to: '/events',
    icon: Calendar,
    color: '#DD1367',
    title: 'Events',
    desc: 'Discover and register for SDG conferences, MUN conferences, workshops and hackathons.',
    badge: 'Open calendar',
  },
];

// Stats from the data
const totalCountries = SDR_COUNTRY_LIST.length;
const avgScore = SDR_COUNTRY_LIST.reduce((s, c) => s + (c.score ?? 0), 0) / SDR_COUNTRY_LIST.filter(c => c.score).length;
const top5 = SDR_COUNTRY_LIST.slice(0, 5);

export default function HomePage() {
  const { branding: b } = useBrandingStore();
  return (
    <div className="flex-1 overflow-y-auto bg-[#040810]">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        {/* Background SDG color strip */}
        <div className="absolute inset-0 opacity-5">
          <div className="flex h-full">
            {SDG_COLORS.map((c, i) => (
              <div key={i} className="flex-1 h-full" style={{ background: c }}/>
            ))}
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          {/* SDG mosaic icon large */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden grid grid-cols-4 gap-[2px] p-[3px] bg-slate-800 shadow-2xl">
              {SDG_COLORS.slice(0, 16).map((c, i) => (
                <div key={i} className="rounded-[3px]" style={{ background: c }}/>
              ))}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {b.appName.includes(' ') ? (
              <>{b.appName.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{b.appName.split(' ').slice(1).join(' ')}</span></>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{b.appName}</span>
            )}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-2">{b.tagline}</p>
          <p className="text-slate-600 text-sm mb-8">{b.subtagline}</p>

          {/* Live stats row */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { val: b.stats.countries, label: 'Countries tracked', color: '#26BDE2' },
              { val: b.stats.avgScore,  label: '2025 global avg score', color: '#4C9F38' },
              { val: b.stats.indicators,label: 'Indicators per country', color: '#FCC30B' },
              { val: b.stats.targets,   label: 'SDG targets', color: '#E5243B' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.val}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/map"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-900/30">
              <Map size={15}/> {b.ctaExplore}
            </Link>
            <Link to="/sdgs"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold text-sm transition-all">
              <LayoutGrid size={15}/> {b.ctaLearn}
            </Link>
            <Link to="/mun"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold text-sm transition-all">
              <Users size={15}/> Build a Committee
            </Link>
          </div>
        </div>
      </div>

      {/* SDG goal pills */}
      <div className="border-b border-slate-800 bg-[#060b14] py-4 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SDG_COLORS.map((color, i) => (
              <Link key={i} to="/sdgs"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:scale-105 transition-transform"
                style={{ background: color + 'cc' }}
                title={SDG_LABELS[i]}>
                <span className="font-bold font-mono text-[10px] opacity-80">SDG{i+1}</span>
                <span className="hidden sm:inline">{SDG_LABELS[i]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-white font-bold text-2xl mb-2">Platform Features</h2>
        <p className="text-slate-500 text-sm mb-8">Everything you need for SDG education, research and Model UN</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <Link key={f.to} to={f.to}
              className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: f.color + '22', border: `1px solid ${f.color}44` }}>
                  <f.icon size={18} style={{ color: f.color }}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">{f.title}</h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
                      style={{ color: f.color, borderColor: f.color + '44', background: f.color + '11' }}>
                      {f.badge}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: f.color }}>
                <span>Open</span><ArrowRight size={10}/>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Global leaderboard */}
      <div className="border-t border-slate-800 bg-[#060b14] py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top 5 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">🏆 Top Performers 2025</h3>
              <div className="space-y-2">
                {top5.map((c, i) => (
                  <div key={c.iso3} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="font-mono text-slate-600 text-sm w-5 text-center">{i + 1}</span>
                    <img src={`https://flagcdn.com/20x15/${c.iso2}.png`} alt=""
                      className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                    <span className="text-white text-sm flex-1">{c.name}</span>
                    <span className="font-mono text-green-400 font-bold text-sm">{c.score?.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Data sources */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">📊 Data Sources</h3>
              <div className="space-y-3">
                {[
                  { name: 'SDSN SDR 2025', desc: 'Sustainable Development Report 2025 — 193 countries, 126 indicators', color: '#26BDE2', icon: Database },
                  { name: 'UN 2030 Agenda', desc: '17 SDGs, 169 targets, 232 indicators — official UN framework', color: '#4C9F38', icon: Globe2 },
                  { name: 'AI Generation', desc: 'Ollama / OpenAI / Anthropic — for MUN topics, guides, papers', color: '#FCC30B', icon: Zap },
                ].map(s => (
                  <div key={s.name} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: s.color + '22' }}>
                      <s.icon size={14} style={{ color: s.color }}/>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{s.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-6 px-6 text-center">
        <p className="text-slate-700 text-xs">
          {b.footerNote}
        </p>
      </div>
    </div>
  );
}
