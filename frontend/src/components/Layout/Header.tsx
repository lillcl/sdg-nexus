// src/components/Layout/Header.tsx — two-row header with expandable group rows
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, Users, BookOpen, Gavel, Map, Calendar, LayoutGrid, LogIn,
  Gamepad2, MessageSquare, Trophy, Newspaper, FileText, Heart, Rss,
  LayoutDashboard, LogOut, ChevronDown, Lightbulb, Info, GraduationCap, Mail, PenLine, ClipboardCheck, TrendingUp
} from 'lucide-react';
import { useAuthStore, useBrandingStore } from '@/store';

const FLAT_NAV = [
  { to: '/sdgs',         label: 'SDGs',       icon: LayoutGrid },
  { to: '/map',          label: 'World Map',   icon: Map        },
  { to: '/leaderboard',  label: 'Leaderboard', icon: Trophy     },
  { to: '/partnerships', label: 'Partners',    icon: Heart      },
];

const GROUPS = [
  {
    key: 'mun', label: 'MUN', icon: Gavel, color: 'text-amber-400', border: 'border-amber-500/40',
    items: [
      { to: '/mun',            label: 'Build MUN',  icon: Users,    desc: 'AI committee builder'  },
      { to: '/mun/coordinate', label: 'Coordinate', icon: Gavel,    desc: 'Run your session live' },
    ],
  },
  {
    key: 'learn', label: 'Learn', icon: Lightbulb, color: 'text-green-400', border: 'border-green-500/40',
    items: [
      { to: '/munlingo',  label: 'MUNLingo',  icon: MessageSquare, desc: 'Solo MUN practice & game' },
      { to: '/games',     label: 'Games',     icon: Gamepad2,      desc: 'Geography & flag games'   },
      { to: '/topic-gen', label: 'Topic Gen', icon: Lightbulb,     desc: 'SDG data project topics'  },
      { to: '/moodle',    label: 'Moodle',    icon: GraduationCap, desc: 'Courses & assignments'    },
      { to: '/canvas',     label: 'Canvas',    icon: PenLine,        desc: 'Build prototypes + AI'    },
      { to: '/assessment', label: 'Assessment', icon: ClipboardCheck, desc: 'SDG quiz + certificate'    },
      { to: '/tournament', label: 'Tournament', icon: Trophy,         desc: 'Competitive SDG quizzes'  },
      { to: '/sdg-trends', label: 'SDG Trends', icon: TrendingUp,     desc: 'Bloomberg-style SDG data' },
    ],
  },
  {
    key: 'events_news', label: 'Events & News', icon: Calendar, color: 'text-orange-400', border: 'border-orange-500/40',
    items: [
      { to: '/event-register', label: 'Register',  icon: Users,     desc: 'Register for ongoing events' },
      { to: '/org-news',       label: 'News',       icon: Newspaper, desc: 'Organisation news & reports' },
      { to: '/events',         label: 'All Events', icon: Calendar,  desc: 'Full events calendar'        },
    ],
  },
  {
    key: 'info', label: 'Info', icon: Info, color: 'text-blue-400', border: 'border-blue-500/40',
    items: [
      { to: '/sdg-news',  label: 'SDG News',  icon: Rss,      desc: 'Live UN SDG news feed'   },
      { to: '/calendar',  label: 'Calendar',  icon: Calendar,  desc: '2026 UN days'            },
      { to: '/resources', label: 'Resources', icon: FileText,  desc: 'SDG resource library'    },
      { to: '/contact',   label: 'Contact',   icon: Mail,      desc: 'Get in touch'            },
    ],
  },
];

const SDG_COLORS = [
  '#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B','#A21942',
  '#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9','#56C02B','#00689D',
];

function SDGLogo() {
  const BACKEND = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
  const [useCustom, setUseCustom] = useState(false);
  const [checked, setChecked] = useState(false);
  // Check if custom icon exists
  if (!checked) {
    fetch(`${BACKEND}/static/uploads/app-icon.svg`, { method: 'HEAD' })
      .then(r => { if (r.ok) setUseCustom(true); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }
  if (useCustom) {
    return <img src={`${BACKEND}/static/uploads/app-icon.svg`} alt="App icon" className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"/>;
  }
  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden grid grid-cols-4 gap-[1px] p-[2px] bg-slate-800 flex-shrink-0">
      {SDG_COLORS.map((c, i) => <div key={i} className="rounded-[2px]" style={{ background: c }} />)}
    </div>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const { branding: b } = useBrandingStore();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (key: string) => setOpenGroup(g => g === key ? null : key);

  // Close when navigating
  const handleNavClick = () => setOpenGroup(null);

  const activeGroup = GROUPS.find(g => g.items.some(i => pathname === i.to || pathname.startsWith(i.to)));

  return (
    <div className="flex-shrink-0 bg-[#040810] border-b border-slate-800 z-30 relative">
      {/* ── Row 1: logo + flat nav + group buttons + auth ── */}
      <div className="px-4 py-2 flex items-center gap-2">
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 mr-1 flex-shrink-0 group">
          <SDGLogo />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">{b.appName}</span>
            <span className="text-[9px] text-slate-600 font-mono tracking-widest">2026 PLATFORM</span>
          </div>
        </Link>

        <div className="w-px h-5 bg-slate-800 flex-shrink-0" />

        {/* Flat nav */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FLAT_NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link key={to} to={to} onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  active ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                         : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}>
                <Icon size={11} />{label}
              </Link>
            );
          })}

          {/* Group toggle buttons */}
          <div className="w-px h-4 bg-slate-800 mx-1 flex-shrink-0" />
          {GROUPS.map(g => {
            const isActive = activeGroup?.key === g.key;
            const isOpen = openGroup === g.key;
            const Icon = g.icon;
            return (
              <button key={g.key}
                onClick={() => toggleGroup(g.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  isOpen ? `bg-slate-800 border border-slate-600 ${g.color}`
                  : isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                <Icon size={11} />
                {g.label}
                <ChevronDown size={9} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            );
          })}
        </nav>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link to="/dashboard" onClick={handleNavClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-700/50 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all">
              <LayoutDashboard size={11} />{user.username || 'Dashboard'}
            </Link>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all"
              title="Sign out"><LogOut size={11} /></button>
          </div>
        ) : (
          <Link to="/login" onClick={handleNavClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex-shrink-0">
            <LogIn size={11} /> Sign In
          </Link>
        )}
      </div>

      {/* ── Row 2: expanded sub-nav strip ── */}
      {openGroup && (() => {
        const g = GROUPS.find(x => x.key === openGroup)!;
        return (
          <div className={`border-t border-slate-800 bg-[#060b14] px-4 py-2.5`}>
            <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${g.color} mr-2 flex-shrink-0`}>
                {g.label}
              </span>
              {g.items.map(({ to, label, icon: Icon, desc }) => {
                const active = pathname === to || pathname.startsWith(to);
                return (
                  <Link key={to} to={to} onClick={handleNavClick}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 border transition-all ${
                      active
                        ? `${g.border} bg-slate-800 text-white`
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}>
                    <Icon size={13} />
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
