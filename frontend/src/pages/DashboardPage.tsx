// DashboardPage v22 — superadmin: reorganized, certificate gen, event types, no AI config; visitor count fixed
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useBrandingStore } from "@/store";
import type { BrandingConfig } from "@/store";
import api from "@/api/client";
import {
  Users,
  Shield,
  ShieldCheck,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Gamepad2,
  Globe,
  Trophy,
  LogOut,
  Star,
  TrendingUp,
  UserCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Palette,
  RotateCcw,
  Download,
  Upload,
  UserPlus,
  FileText,
  Plus,
  Trash2,
  Edit3,
  X,
  Activity,
  Calendar,
  Image, // added Image import
} from "lucide-react";

// ── Badge data ────────────────────────────────────────────────────────────────
const ALL_BADGES = [
  {
    id: 1,
    name: "World Explorer",
    icon: "🌍",
    desc: "Visited 50+ country profiles",
    earned: true,
    progress: 50,
    total: 50,
  },
  {
    id: 2,
    name: "SDG Champion",
    icon: "🎯",
    desc: "Completed all 17 SDG modules",
    earned: true,
    progress: 17,
    total: 17,
  },
  {
    id: 3,
    name: "Game Master",
    icon: "🎮",
    desc: "Perfect score in all geography games",
    earned: true,
    progress: 5,
    total: 5,
  },
  {
    id: 4,
    name: "MUN Pro",
    icon: "🎤",
    desc: "Generated 10+ position papers",
    earned: true,
    progress: 12,
    total: 10,
  },
  {
    id: 5,
    name: "Flag Expert",
    icon: "🚩",
    desc: "Identified 100 flags correctly",
    earned: true,
    progress: 100,
    total: 100,
  },
  {
    id: 6,
    name: "Capital Genius",
    icon: "🏛️",
    desc: "Master of world capitals",
    earned: false,
    progress: 45,
    total: 100,
  },
  {
    id: 7,
    name: "Knowledge Seeker",
    icon: "📚",
    desc: "Read 100+ resources",
    earned: false,
    progress: 67,
    total: 100,
  },
  {
    id: 8,
    name: "Team Player",
    icon: "🤝",
    desc: "Collaborated in 5+ group projects",
    earned: false,
    progress: 3,
    total: 5,
  },
  {
    id: 9,
    name: "Rising Star",
    icon: "⭐",
    desc: "Reached top 10 in leaderboard",
    earned: false,
    progress: 15,
    total: 100,
  },
  {
    id: 10,
    name: "Innovator",
    icon: "💡",
    desc: "Submitted original project idea",
    earned: false,
    progress: 0,
    total: 1,
  },
  {
    id: 11,
    name: "Climate Warrior",
    icon: "🌱",
    desc: "Completed all SDG 13 activities",
    earned: false,
    progress: 8,
    total: 12,
  },
  {
    id: 12,
    name: "Peace Builder",
    icon: "🕊️",
    desc: "Participated in conflict resolution sims",
    earned: false,
    progress: 2,
    total: 5,
  },
];

function BadgesPanel() {
  const [showAll, setShowAll] = useState(false);
  const earned = ALL_BADGES.filter((b) => b.earned);
  const locked = ALL_BADGES.filter((b) => !b.earned);
  const pct = Math.round((earned.length / ALL_BADGES.length) * 100);
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-800/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              Level 12
            </div>
            <div className="text-slate-400 text-xs">Explorer</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">8,450 XP</div>
            <div className="text-slate-500 text-xs">1,550 to next level</div>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
            style={{ width: `${(8450 / 10000) * 100}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {earned.length}
          </div>
          <div className="text-xs text-slate-500">Earned</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-slate-400">
            {locked.length}
          </div>
          <div className="text-xs text-slate-500">Locked</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{pct}%</div>
          <div className="text-xs text-slate-500">Complete</div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-400" />
          Earned Badges
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {earned.map((b) => (
            <div
              key={b.id}
              className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-center"
            >
              <div className="text-3xl mb-1 emoji">{b.icon}</div>
              <div className="text-[11px] text-white font-semibold leading-tight">
                {b.name}
              </div>
              <CheckCircle size={10} className="text-green-400 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <Lock size={13} className="text-slate-500" />
          Locked Badges ({locked.length})
          {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showAll && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {locked.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 text-center opacity-70"
              >
                <div className="text-3xl mb-1 grayscale emoji">{b.icon}</div>
                <div className="text-[11px] text-slate-400 font-semibold leading-tight mb-1">
                  {b.name}
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(b.progress / b.total) * 100}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-600 mt-0.5">
                  {b.progress}/{b.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  const stats = [
    {
      label: "XP Points",
      value: "8,450",
      icon: Star,
      color: "text-yellow-400",
    },
    { label: "Level", value: "12", icon: TrendingUp, color: "text-green-400" },
    { label: "Badges", value: "5", icon: Award, color: "text-purple-400" },
    { label: "Rank", value: "#42", icon: Trophy, color: "text-blue-400" },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-violet-900/40 border border-blue-800/40 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white mb-1">
          Welcome back, {user.username || user.email}! 👋
        </h2>
        <p className="text-slate-400 text-sm">
          Keep learning and earning badges on your SDG journey.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <Icon size={16} className={`${s.color} mb-2`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-yellow-400" />
          Achievement Badges
        </h3>
        <BadgesPanel />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            to: "/sdgs",
            icon: Globe,
            label: "SDG Explorer",
            color: "text-green-400",
          },
          {
            to: "/games",
            icon: Gamepad2,
            label: "Play Games",
            color: "text-purple-400",
          },
          {
            to: "/mun",
            icon: BookOpen,
            label: "MUN Builder",
            color: "text-blue-400",
          },
          {
            to: "/leaderboard",
            icon: Trophy,
            label: "Leaderboard",
            color: "text-yellow-400",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
            >
              <Icon
                size={20}
                className={`${item.color} group-hover:scale-110 transition-transform`}
              />
              <span className="text-xs text-slate-400 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Certificate Generator ─────────────────────────────────────────────────────
function CertificateGenerator() {
  const [template, setTemplate] = useState<
    "achievement" | "participation" | "excellence"
  >("achievement");
  const [orgName, setOrgName] = useState("SDG Nexus Academy");
  const [title, setTitle] = useState("Certificate of Achievement");
  const [subtitle, setSubtitle] = useState(
    "SDG Knowledge & Leadership Programme",
  );
  const [names, setNames] = useState("");
  const [signatory1, setSignatory1] = useState("Programme Director");
  const [signatory2, setSignatory2] = useState("Academic Coordinator");
  const [logoText, setLogoText] = useState("🌍");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const TEMPLATES = {
    achievement: {
      primary: "#1e3a5f",
      accent: "#3b82f6",
      bg: "#f8faff",
      border: "#1e3a5f",
    },
    participation: {
      primary: "#166534",
      accent: "#22c55e",
      bg: "#f0fdf4",
      border: "#166534",
    },
    excellence: {
      primary: "#92400e",
      accent: "#f59e0b",
      bg: "#fffbeb",
      border: "#92400e",
    },
  };

  const generateCert = (name: string): string => {
    const t = TEMPLATES[template];
    return `<html><head><style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@400;500;600&display=swap');
      body{margin:0;padding:0;background:#fff;font-family:'Montserrat',sans-serif;}
      .cert{width:1056px;height:816px;background:${t.bg};border:4px solid ${t.border};box-sizing:border-box;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;}
      .border-inner{position:absolute;inset:12px;border:1px solid ${t.accent}44;pointer-events:none;}
      .corner{position:absolute;width:40px;height:40px;border-color:${t.accent};border-style:solid;}
      .corner.tl{top:20px;left:20px;border-width:3px 0 0 3px;}
      .corner.tr{top:20px;right:20px;border-width:3px 3px 0 0;}
      .corner.bl{bottom:20px;left:20px;border-width:0 0 3px 3px;}
      .corner.br{bottom:20px;right:20px;border-width:0 3px 3px 0;}
      .logo{font-size:52px;margin-bottom:8px;}
      .org{font-family:'Montserrat',sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${t.primary};margin-bottom:24px;}
      .cert-title{font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:5px;text-transform:uppercase;color:${t.accent};margin-bottom:12px;}
      .subtitle{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:600;color:${t.primary};margin-bottom:16px;text-align:center;}
      .presented{font-size:13px;color:#666;margin-bottom:8px;font-style:italic;}
      .recipient{font-family:'Cormorant Garamond',serif;font-size:48px;font-style:italic;color:${t.primary};border-bottom:1.5px solid ${t.accent};padding:0 40px 8px;margin-bottom:20px;}
      .for-text{font-size:12px;color:#666;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;}
      .programme{font-family:'Cormorant Garamond',serif;font-size:20px;color:${t.primary};margin-bottom:28px;text-align:center;max-width:600px;}
      .sigs{display:flex;gap:80px;margin-top:16px;}
      .sig{text-align:center;}
      .sig-line{width:160px;height:1px;background:${t.primary};margin:0 auto 6px;}
      .sig-name{font-size:11px;color:${t.primary};font-weight:600;letter-spacing:1px;text-transform:uppercase;}
      .date{position:absolute;bottom:32px;right:48px;font-size:11px;color:#999;letter-spacing:1px;}
      .sdg-strip{position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#E5243B,#DDA63A,#4C9F38,#C5192D,#FF3A21,#26BDE2,#FCC30B,#A21942,#FD6925,#DD1367,#FD9D24,#BF8B2E,#3F7E44,#0A97D9,#56C02B,#00689D,#19486A);}
    </style></head><body><div class="cert">
      <div class="border-inner"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="logo">${logoText}</div>
      <div class="org">${orgName}</div>
      <div class="cert-title">${title}</div>
      <div class="presented">This is to certify that</div>
      <div class="recipient">${name}</div>
      <div class="for-text">has successfully completed</div>
      <div class="programme">${subtitle}</div>
      <div class="sigs">
        <div class="sig"><div class="sig-line"></div><div class="sig-name">${signatory1}</div></div>
        <div class="sig"><div class="sig-line"></div><div class="sig-name">${signatory2}</div></div>
      </div>
      <div class="date">${date}</div>
      <div class="sdg-strip"></div>
    </div></body></html>`;
  };

  const previewFirst = () => {
    const nameList = names
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (!nameList.length) {
      setPreview(generateCert("Your Name"));
      return;
    }
    setPreview(generateCert(nameList[0]));
  };

  const downloadAll = () => {
    const nameList = names
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    const list = nameList.length ? nameList : ["Recipient Name"];
    list.forEach((name, i) => {
      setTimeout(() => {
        const html = generateCert(name);
        const blob = new Blob([html], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `certificate_${name.replace(/\s+/g, "_")}.html`;
        a.click();
      }, i * 200);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <FileText size={16} className="text-yellow-400" />
        Certificate Generator
      </h3>

      {/* Template picker */}
      <div>
        <label className="text-slate-400 text-xs block mb-2">
          Template Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              [
                "achievement",
                "🏆 Achievement",
                "bg-blue-900/20 border-blue-700/50",
              ],
              [
                "participation",
                "🌿 Participation",
                "bg-green-900/20 border-green-700/50",
              ],
              [
                "excellence",
                "⭐ Excellence",
                "bg-amber-900/20 border-amber-700/50",
              ],
            ] as const
          ).map(([k, l, c]) => (
            <button
              key={k}
              onClick={() => setTemplate(k)}
              className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${template === k ? c + " text-white scale-[1.02]" : "border-slate-700 text-slate-500 hover:border-slate-600"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Organisation Name
          </label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Certificate Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Programme / Subtitle
          </label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Logo (emoji or text)
          </label>
          <input
            value={logoText}
            onChange={(e) => setLogoText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Signatory 1
          </label>
          <input
            value={signatory1}
            onChange={(e) => setSignatory1(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Signatory 2
          </label>
          <input
            value={signatory2}
            onChange={(e) => setSignatory2(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Date</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-slate-400 text-xs block mb-1">
          Recipient Names (one per line — bulk generate)
        </label>
        <textarea
          value={names}
          onChange={(e) => setNames(e.target.value)}
          rows={4}
          placeholder={"Alice Johnson\nBob Smith\nCarla Diaz\n..."}
          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
        <p className="text-slate-600 text-[10px] mt-1">
          {names.split("\n").filter((n) => n.trim()).length} names entered
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={previewFirst}
          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
        >
          <FileText size={12} />
          Preview
        </button>
        <button
          onClick={downloadAll}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
        >
          <Download size={12} />
          Download All (
          {Math.max(1, names.split("\n").filter((n) => n.trim()).length)})
        </button>
      </div>

      {preview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Preview (first recipient):
            </span>
            <button
              onClick={() => setPreview(null)}
              className="text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div
            className="rounded-xl overflow-hidden border border-slate-700 bg-white"
            style={{ height: 300 }}
          >
            <iframe
              srcDoc={preview}
              style={{
                width: "200%",
                height: "200%",
                border: "none",
                transform: "scale(0.5)",
                transformOrigin: "top left",
              }}
              title="Certificate preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Event Type Manager ────────────────────────────────────────────────────────
const DEFAULT_EVENT_TYPES = [
  { key: "conference", label: "Conference", emoji: "🎤" },
  { key: "mun", label: "Model UN", emoji: "🏛️" },
  { key: "workshop", label: "Workshop", emoji: "🔨" },
  { key: "hackathon", label: "Hackathon", emoji: "💻" },
  { key: "summit", label: "Summit", emoji: "🌍" },
  { key: "youth_forum", label: "Youth Forum", emoji: "🧑" },
  { key: "webinar", label: "Webinar", emoji: "📡" },
];
const ET_KEY = "sdg_event_types_v1";

function EventTypeManager() {
  const [types, setTypes] = useState<
    { key: string; label: string; emoji: string }[]
  >(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(ET_KEY) || "null") ||
        DEFAULT_EVENT_TYPES
      );
    } catch {
      return DEFAULT_EVENT_TYPES;
    }
  });
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("📅");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const persist = (t: typeof types) => {
    setTypes(t);
    localStorage.setItem(ET_KEY, JSON.stringify(t));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const add = () => {
    if (!newKey || !newLabel) return;
    const key = newKey.toLowerCase().replace(/\s+/g, "_");
    if (types.find((t) => t.key === key)) return;
    persist([...types, { key, label: newLabel, emoji: newEmoji }]);
    setNewKey("");
    setNewLabel("");
    setNewEmoji("📅");
  };

  const remove = (idx: number) => persist(types.filter((_, i) => i !== idx));

  const update = (idx: number, field: string, val: string) => {
    const updated = types.map((t, i) =>
      i === idx ? { ...t, [field]: val } : t,
    );
    persist(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Calendar size={16} className="text-blue-400" />
        Event Types
        {saved && (
          <span className="text-xs text-green-400 ml-auto">✓ Saved</span>
        )}
      </h3>
      <div className="space-y-2">
        {types.map((t, i) => (
          <div
            key={t.key}
            className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2"
          >
            <input
              value={t.emoji}
              onChange={(e) => update(i, "emoji", e.target.value)}
              className="w-10 bg-slate-700 border border-slate-600 text-center text-base rounded-lg px-1 py-1 focus:outline-none"
            />
            <input
              value={t.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            />
            <span className="text-[10px] text-slate-600 font-mono w-20">
              {t.key}
            </span>
            <button
              onClick={() => remove(i)}
              className="text-slate-600 hover:text-red-400 transition"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
          placeholder="🎪"
          className="w-10 bg-slate-800 border border-slate-700 text-center text-base rounded-lg px-1 py-1.5 focus:outline-none"
        />
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="key (e.g. fair)"
          className="w-28 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        />
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g. Career Fair)"
          className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={add}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl transition flex items-center gap-1"
        >
          <Plus size={11} />
          Add
        </button>
      </div>
    </div>
  );
}

// ── SVG / App Icon Upload Panel ───────────────────────────────────────────────
function SVGUploadPanel({ token }: { token: string | null }) {
  const BACKEND =
    (window as any).__VITE_API_URL__ ||
    import.meta.env?.VITE_API_URL ||
    "http://localhost:8000";
  const headers = { Authorization: `Bearer ${token}` };
  const [files, setFiles] = useState<
    { filename: string; url: string; size: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const loadFiles = async () => {
    try {
      const r = await api.get("/uploads/list", { headers });
      setFiles(r.data.files || []);
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    if (token) loadFiles();
  }, [token]);

  const upload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isIcon = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    isIcon ? setIconUploading(true) : setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post(isIcon ? "/uploads/icon" : "/uploads/svg", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      flash(
        isIcon ? "✅ App icon updated! Refresh to see." : "✅ File uploaded",
      );
      loadFiles();
    } catch (e: any) {
      flash("❌ " + (e?.response?.data?.detail || e.message));
    }
    isIcon ? setIconUploading(false) : setUploading(false);
    if (e.target) e.target.value = "";
  };

  const del = async (filename: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/uploads/${filename}`, { headers });
      loadFiles();
    } catch (e: any) {
      flash("❌ " + (e?.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Image size={16} className="text-cyan-400" />
        Files & App Icon
      </h3>
      {msg && (
        <div
          className={`rounded-xl px-3 py-2 text-xs ${msg.startsWith("✅") ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-400"}`}
        >
          {msg}
        </div>
      )}

      {/* App icon upload */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <p className="text-slate-300 text-sm font-semibold mb-1">🖼️ App Icon</p>
        <p className="text-slate-500 text-xs mb-3">
          Upload an SVG or PNG to replace the app icon in the header. Stored as{" "}
          <code className="text-slate-300">app-icon.svg</code> on the server.
        </p>
        <button
          onClick={() => iconRef.current?.click()}
          disabled={iconUploading}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
        >
          {iconUploading ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Upload size={12} />
          )}
          {iconUploading ? "Uploading…" : "Upload App Icon (SVG/PNG)"}
        </button>
        <input
          ref={iconRef}
          type="file"
          accept=".svg,.png,image/svg+xml,image/png"
          className="hidden"
          onChange={(e) => upload(e, true)}
        />
      </div>

      {/* SVG/logo upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-300 text-sm font-semibold">
            📁 Uploaded Files
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
          >
            {uploading ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Upload size={11} />
            )}
            {uploading ? "Uploading…" : "Upload SVG / Image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*"
            className="hidden"
            onChange={(e) => upload(e, false)}
          />
        </div>
        <p className="text-slate-600 text-xs mb-3">
          Files stored on server disk (not DB). SVG files appear as logo
          carousel on the News page.
        </p>
        {files.length === 0 ? (
          <p className="text-slate-600 text-xs">No files uploaded yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {files.map((f) => (
              <div
                key={f.filename}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {f.filename.endsWith(".svg") ? (
                    <img
                      src={`${BACKEND}${f.url}`}
                      alt={f.filename}
                      className="w-6 h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <span className="text-lg flex-shrink-0">📄</span>
                  )}
                  <div className="min-w-0">
                    <div className="text-slate-300 text-xs font-mono truncate">
                      {f.filename}
                    </div>
                    <div className="text-slate-600 text-[10px]">
                      {Math.round(f.size / 1024)}KB ·{" "}
                      <a
                        href={`${BACKEND}${f.url}`}
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 hover:text-blue-400"
                      >
                        {f.url}
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => del(f.filename)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition flex-shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Branding ──────────────────────────────────────────────────────────────────
function BrandingPanel() {
  const { branding, setBranding, resetBranding } = useBrandingStore();
  const [draft, setDraft] = useState<BrandingConfig>(branding);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof BrandingConfig, v: any) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const setStats = (k: keyof BrandingConfig["stats"], v: string) =>
    setDraft((d) => ({ ...d, stats: { ...d.stats, [k]: v } }));
  const { token } = useAuthStore();
  const save = async () => {
    setBranding(draft);
    setSaved(true);
    try {
      await api.put("/settings/branding", draft, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setTimeout(() => setSaved(false), 2000);
  };
  const reset = () => {
    resetBranding();
    setDraft(branding);
  };
  const field = (
    label: string,
    key: keyof BrandingConfig,
    placeholder?: string,
  ) => (
    <div>
      <label className="text-slate-500 text-xs mb-1 block">{label}</label>
      <input
        value={draft[key] as string}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Palette size={16} className="text-purple-400" />
        App Branding
      </h3>
      {field("App Name", "appName", "SDG Nexus")}
      <div>
        <label className="text-slate-500 text-xs mb-1 block">Tagline</label>
        <textarea
          value={draft.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>
      {field("Sub-tagline", "subtagline")}{" "}
      {field("CTA Button 1", "ctaExplore", "Explore the Map")}{" "}
      {field("CTA Button 2", "ctaLearn", "Learn the SDGs")}
      <div>
        <label className="text-slate-500 text-xs mb-2 block">
          Homepage Stats
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["countries", "avgScore", "indicators", "targets"] as const).map(
            (k) => (
              <div key={k}>
                <label className="text-[10px] text-slate-600 block mb-0.5 capitalize">
                  {k}
                </label>
                <input
                  value={draft.stats[k]}
                  onChange={(e) => setStats(k, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                />
              </div>
            ),
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
        >
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg text-xs border border-slate-700 text-slate-400 hover:text-white flex items-center gap-1"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>
    </div>
  );
}

// ── User Creation Panel ───────────────────────────────────────────────────────
function UserCreationPanel({ token }: { token: string | null }) {
  const headers = { Authorization: `Bearer ${token}` };
  // Single create
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    role: "student",
  });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  // CSV batch
  const [csvText, setCsvText] = useState("");
  const [batching, setBatching] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  // Teacher assign
  const [teacherEmail, setTeacherEmail] = useState("");
  const [studentEmails, setStudentEmails] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3500);
  };

  const createSingle = async () => {
    if (!form.email || !form.password) return;
    setCreating(true);
    try {
      const r = await api.post("/auth/admin/create-user", form, { headers });
      flash(`✅ Created: ${r.data.email} as ${r.data.role}`);
      setForm({
        email: "",
        password: "",
        username: "",
        full_name: "",
        role: "student",
      });
    } catch (e: any) {
      flash("❌ " + (e?.response?.data?.detail || e.message));
    }
    setCreating(false);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    const header = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = vals[i] || "";
      });
      return obj;
    });
  };

  const runBatch = async () => {
    const users = parseCSV(csvText);
    if (!users.length) return;
    setBatching(true);
    setBatchResults([]);
    try {
      const r = await api.post(
        "/auth/admin/batch-create-users",
        { users },
        { headers },
      );
      setBatchResults(r.data.results || []);
    } catch (e: any) {
      flash("❌ Batch failed: " + (e?.response?.data?.detail || e.message));
    }
    setBatching(false);
  };

  const assignTeacher = async () => {
    if (!teacherEmail || !studentEmails) return;
    setAssigning(true);
    setAssignMsg("");
    try {
      // Look up teacher by email first
      const usersResp = await api.get("/auth/users", { headers });
      const allUsers: any[] = usersResp.data.users || [];
      const teacher = allUsers.find((u) => u.email === teacherEmail.trim());
      if (!teacher) {
        setAssignMsg("❌ Teacher not found");
        setAssigning(false);
        return;
      }
      const studentIds = studentEmails
        .split("\n")
        .map((e) => e.trim())
        .filter(Boolean)
        .map((email) => allUsers.find((u) => u.email === email)?.user_id)
        .filter(Boolean);
      if (!studentIds.length) {
        setAssignMsg("❌ No matching students found");
        setAssigning(false);
        return;
      }
      await api.post(
        `/auth/admin/assign-teacher/${teacher.user_id}`,
        { student_ids: studentIds },
        { headers },
      );
      setAssignMsg(
        `✅ Assigned ${studentIds.length} student(s) to ${teacherEmail}`,
      );
      setTeacherEmail("");
      setStudentEmails("");
    } catch (e: any) {
      setAssignMsg("❌ " + (e?.response?.data?.detail || e.message));
    }
    setAssigning(false);
  };

  const ROLES = ["visitor", "student", "admin", "superadmin"];

  return (
    <div className="space-y-5">
      {msg && (
        <div
          className={`rounded-xl px-4 py-2 text-xs font-medium ${msg.startsWith("✅") ? "bg-green-900/30 border border-green-700/40 text-green-300" : "bg-red-900/30 border border-red-700/40 text-red-300"}`}
        >
          {msg}
        </div>
      )}

      {/* Single user create */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <UserPlus size={16} className="text-blue-400" />
          Create Single User
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Email *</label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="user@example.com"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">
              Password *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Min 8 chars"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="username"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">
              Full Name
            </label>
            <input
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_name: e.target.value }))
              }
              placeholder="Full name"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Role</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${form.role === r ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={createSingle}
          disabled={creating || !form.email || !form.password}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          {creating ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <UserPlus size={12} />
          )}
          {creating ? "Creating…" : "Create User"}
        </button>
      </div>

      {/* CSV batch create */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Upload size={16} className="text-green-400" />
          Batch Create via CSV
        </h3>
        <p className="text-slate-500 text-xs">
          First row must be headers:{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">
            email,password,username,full_name,role
          </code>
        </p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={5}
          placeholder={
            "email,password,username,full_name,role\nalice@school.edu,Pass123!,alice,Alice Smith,student\nbob@school.edu,Pass456!,bob,Bob Jones,student"
          }
          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500 resize-none font-mono"
        />
        <button
          onClick={runBatch}
          disabled={batching || !csvText.trim()}
          className="w-full py-2.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          {batching ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Upload size={12} />
          )}
          {batching
            ? "Processing…"
            : `Import ${parseCSV(csvText).length || 0} Users`}
        </button>
        {batchResults.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {batchResults.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${r.status === "created" ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-400"}`}
              >
                <span>{r.email}</span>
                <span>
                  {r.status === "created"
                    ? `✅ ${r.role}`
                    : `❌ ${r.error?.slice(0, 40)}`}
                </span>
              </div>
            ))}
            <p className="text-slate-500 text-[10px] pt-1">
              {batchResults.filter((r) => r.status === "created").length} /{" "}
              {batchResults.length} created
            </p>
          </div>
        )}
      </div>

      {/* Teacher–student assignment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users size={16} className="text-purple-400" />
          Assign Students to Teacher
        </h3>
        {assignMsg && (
          <div
            className={`rounded-xl px-3 py-2 text-xs ${assignMsg.startsWith("✅") ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-400"}`}
          >
            {assignMsg}
          </div>
        )}
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Teacher Email
          </label>
          <input
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            placeholder="teacher@school.edu"
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Student Emails (one per line)
          </label>
          <textarea
            value={studentEmails}
            onChange={(e) => setStudentEmails(e.target.value)}
            rows={4}
            placeholder={
              "student1@school.edu\nstudent2@school.edu\nstudent3@school.edu"
            }
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 resize-none font-mono"
          />
        </div>
        <button
          onClick={assignTeacher}
          disabled={assigning || !teacherEmail || !studentEmails}
          className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          {assigning ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Users size={12} />
          )}
          {assigning ? "Assigning…" : "Assign Students"}
        </button>
      </div>
    </div>
  );
}

// ── Superadmin Dashboard ──────────────────────────────────────────────────────
const ROLES = ["visitor", "student", "admin", "superadmin"] as const;
type Role = (typeof ROLES)[number];
const ROLE_COLOR: Record<Role, string> = {
  superadmin: "bg-red-900/60 text-red-300 border-red-700/50",
  admin: "bg-orange-900/60 text-orange-300 border-orange-700/50",
  student: "bg-blue-900/60 text-blue-300 border-blue-700/50",
  visitor: "bg-slate-800 text-slate-400 border-slate-700",
};

function SuperadminDashboard({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Role | "all">("all");
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [section, setSection] = useState<
    "users" | "create" | "certs" | "events" | "files" | "branding"
  >("users");
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        api.get("/auth/users", { headers }),
        api.get("/auth/role-requests", { headers }),
      ]);
      setUsers(uRes.data.users || []);
      setRoleRequests(rRes.data.requests || []);
    } catch {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [token]);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 2500);
  };

  const setRole = async (userId: string, newRole: Role) => {
    try {
      await api.put(
        `/auth/users/${userId}/role`,
        { requested_role: newRole },
        { headers },
      );
      flash(`Role → ${newRole}`);
      load();
    } catch (e: any) {
      flash("Error: " + (e?.response?.data?.detail || "failed"));
    }
  };
  const approve = async (userId: string) => {
    try {
      await api.post(`/auth/approve-role/${userId}`, {}, { headers });
      flash("Role approved");
      load();
    } catch (e: any) {
      flash("Error: " + (e?.response?.data?.detail || "failed"));
    }
  };

  const roleCounts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const filtered = users.filter((u) => {
    const matchRole = filter === "all" || u.role === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.user_id?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const SECTIONS = [
    { key: "users", label: "👥 Users" },
    { key: "create", label: "➕ Create Users" },
    { key: "certs", label: "📜 Certificates" },
    { key: "events", label: "📅 Event Types" },
    { key: "files", label: "📁 Files & Icon" },
    { key: "branding", label: "🎨 Branding" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-800/40 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-red-400" />
          Superadmin Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Full platform control — manage users, generate certificates, configure
          events
        </p>
      </div>

      {actionMsg && (
        <div className="bg-green-900/30 border border-green-700/40 text-green-300 text-xs rounded-xl px-4 py-2">
          {actionMsg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:col-span-1">
          <Users size={16} className="text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">
            {loading ? "…" : users.length}
          </div>
          <div className="text-xs text-slate-500">Total Users</div>
        </div>
        {ROLES.map((role) => (
          <div
            key={role}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="text-2xl font-bold text-white">
              {roleCounts[role] || 0}
            </div>
            <div
              className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full border inline-block ${ROLE_COLOR[role]}`}
            >
              {role}
            </div>
          </div>
        ))}
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${section === s.key ? "bg-red-700 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Pending requests */}
      {section === "users" && roleRequests.length > 0 && (
        <div className="bg-slate-900 border border-yellow-800/30 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-yellow-400" />
            Pending Role Requests ({roleRequests.length})
          </h3>
          <div className="space-y-2">
            {roleRequests.map((req) => (
              <div
                key={req.user_id}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/40"
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {req.user_id?.slice(0, 20)}…
                  </div>
                  <div className="text-xs mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${ROLE_COLOR[req.role as Role] || ""}`}
                    >
                      {req.role}
                    </span>
                    <span className="text-slate-600 mx-2">→</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${ROLE_COLOR[req.requested_role as Role] || ""}`}
                    >
                      {req.requested_role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(req.user_id)}
                    className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle size={10} />
                    Approve
                  </button>
                  <button
                    onClick={() => setRole(req.user_id, req.role)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      {section === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={14} className="text-blue-400" />
              All Users ({users.length})
            </h3>
            <button
              onClick={load}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email or role…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {(["all", ...ROLES] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${filter === r ? "bg-blue-600/30 border-blue-600/50 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-800/60">
                <tr className="text-slate-500">
                  <th className="text-left px-3 py-2">Email / ID</th>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-600 py-6">
                      No users found
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr
                    key={u.user_id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-3 py-2 text-[10px] text-slate-400">
                      <div className="font-medium text-slate-300">
                        {u.email || "—"}
                      </div>
                      <div className="font-mono text-slate-600">
                        {u.user_id?.slice(0, 14)}…
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLOR[u.role as Role] || ""}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-green-500 text-[10px]">
                      {u.status || "active"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {u.role !== "superadmin" && (
                          <button
                            onClick={() => {
                              const next =
                                ROLES[ROLES.indexOf(u.role as Role) + 1];
                              if (next) setRole(u.user_id, next);
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 bg-green-900/40 border border-green-700/40 text-green-300 hover:bg-green-800/50 rounded text-[10px] transition"
                          >
                            <ArrowUpCircle size={9} />
                            Promote
                          </button>
                        )}
                        {u.role !== "visitor" && (
                          <button
                            onClick={() => {
                              const prev =
                                ROLES[ROLES.indexOf(u.role as Role) - 1];
                              if (prev) setRole(u.user_id, prev);
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 bg-orange-900/40 border border-orange-700/40 text-orange-300 hover:bg-orange-800/50 rounded text-[10px] transition"
                          >
                            <ArrowDownCircle size={9} />
                            Demote
                          </button>
                        )}
                        <select
                          value={u.role}
                          onChange={(e) =>
                            setRole(u.user_id, e.target.value as Role)
                          }
                          className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="text-[10px] text-slate-600 mt-2">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      )}

      {section === "certs" && <CertificateGenerator />}
      {section === "create" && <UserCreationPanel token={token} />}
      {section === "events" && <EventTypeManager />}
      {section === "files" && <SVGUploadPanel token={token} />}
      {section === "branding" && <BrandingPanel />}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/events", icon: Globe, label: "Events" },
          { to: "/moodle", icon: BookOpen, label: "Moodle" },
          { to: "/tournament", icon: Trophy, label: "Tournaments" },
          { to: "/sdg-trends", icon: Activity, label: "SDG Trends" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex items-center gap-3 transition-all"
            >
              <Icon size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user }: { user: any }) {
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => {
    api
      .get("/auth/role-requests", { headers })
      .then((r) => setRoleRequests(r.data.requests || []))
      .catch(() => {});
    api
      .get("/auth/users", { headers })
      .then((r) => setUserCount(r.data.users?.length || 0))
      .catch(() => {});
  };
  useEffect(load, [token]);
  const approve = (userId: string) => {
    api
      .post(`/auth/approve-role/${userId}`, {}, { headers })
      .then(load)
      .catch(() => {});
  };
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-800/40 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-emerald-400" />
          Admin Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage users and platform content.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <Users size={16} className="text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">{userCount}</div>
          <div className="text-xs text-slate-500">Total Users</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <Clock size={16} className="text-yellow-400 mb-2" />
          <div className="text-2xl font-bold text-white">
            {roleRequests.length}
          </div>
          <div className="text-xs text-slate-500">Pending Requests</div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <UserCheck size={14} className="text-yellow-400" />
          Pending Role Requests
        </h3>
        {roleRequests.length === 0 ? (
          <p className="text-slate-500 text-xs">No pending requests.</p>
        ) : (
          roleRequests.map((req) => (
            <div
              key={req.user_id}
              className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 mb-2"
            >
              <div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {req.user_id?.slice(0, 16)}…
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500">{req.role}</span> →{" "}
                  <span className="text-yellow-400 font-bold">
                    {req.requested_role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => approve(req.user_id)}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg flex items-center gap-1"
              >
                <CheckCircle size={10} />
                Approve
              </button>
            </div>
          ))
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: "/events", icon: Globe, label: "Manage Events" },
          { to: "/moodle", icon: BookOpen, label: "Moodle LMS" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex items-center gap-3 transition-all"
            >
              <Icon size={16} className="text-slate-400" />
              <span className="text-sm text-slate-300">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, token, logout } = useAuthStore();
  const nav = useNavigate();
  useEffect(() => {
    if (!user && !token) nav("/login");
  }, [user, token, nav]);
  if (!user)
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  const handleLogout = () => {
    logout();
    nav("/login");
  };
  const roleBadge =
    (
      {
        superadmin: "bg-red-900/50 text-red-300 border-red-800/50",
        admin: "bg-orange-900/50 text-orange-300 border-orange-800/50",
        student: "bg-blue-900/50 text-blue-300 border-blue-800/50",
        visitor: "bg-slate-800 text-slate-400 border-slate-700",
      } as Record<string, string>
    )[user.role] || "bg-slate-800 text-slate-400 border-slate-700";
  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {(user.username || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">
                {user.username || user.email}
              </div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge}`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              ← Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-900 transition"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
        {user.role === "superadmin" && <SuperadminDashboard user={user} />}
        {user.role === "admin" && <AdminDashboard user={user} />}
        {(user.role === "student" || user.role === "visitor") && (
          <StudentDashboard user={user} />
        )}
        {user.role === "visitor" && (
          <div className="mt-6 bg-blue-950/20 border border-blue-800/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-medium">
                Want full access?
              </div>
              <div className="text-xs text-slate-500">
                Request a student account to unlock all features.
              </div>
            </div>
            <button
              onClick={() =>
                api
                  .post(
                    "/auth/request-role",
                    { requested_role: "student" },
                    { headers: { Authorization: `Bearer ${token}` } },
                  )
                  .then(() => alert("Request submitted!"))
                  .catch(() => alert("Failed."))
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Request Student Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
