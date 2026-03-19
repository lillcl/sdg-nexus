// LeaderboardPage — Schools leaderboard (SDG country rankings moved to SDGPage)
import { useState, useMemo } from 'react';
import { Trophy, Search, Plus, Trash2, Edit3, X, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuthStore } from '@/store';

interface School {
  id: string; name: string; country: string; region: string;
  points: number; change: string; students: number; level: string;
}

const REGIONS = ['All','Asia Pacific','Europe','Americas','Africa','Middle East'];
const LEVELS  = ['All','Primary','Secondary','University'];

function load<T>(k: string, d: T): T { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } }
function save(k: string, v: any) { localStorage.setItem(k, JSON.stringify(v)); }
function uid() { return Math.random().toString(36).slice(2); }

const DEFAULT_SCHOOLS: School[] = [
  { id:'1',  name:'Washington International School', country:'USA',         region:'Americas',     points:15420, change:'+2', students:450, level:'Secondary'  },
  { id:'2',  name:'Beijing Model UN Academy',        country:'China',       region:'Asia Pacific', points:14850, change:'-1', students:620, level:'Secondary'  },
  { id:'3',  name:'London SDG Institute',            country:'UK',          region:'Europe',       points:14320, change:'+1', students:380, level:'University'  },
  { id:'4',  name:'Paris Global Academy',            country:'France',      region:'Europe',       points:13900, change:'0',  students:290, level:'Secondary'  },
  { id:'5',  name:'Berlin International',            country:'Germany',     region:'Europe',       points:13450, change:'+3', students:310, level:'Secondary'  },
  { id:'6',  name:'São Paulo Future School',         country:'Brazil',      region:'Americas',     points:12890, change:'-2', students:540, level:'Secondary'  },
  { id:'7',  name:'Tokyo SDG High',                  country:'Japan',       region:'Asia Pacific', points:12540, change:'+1', students:480, level:'Secondary'  },
  { id:'8',  name:'Mumbai Global School',            country:'India',       region:'Asia Pacific', points:12100, change:'-1', students:720, level:'Secondary'  },
  { id:'9',  name:'Nairobi SDG Academy',             country:'Kenya',       region:'Africa',       points:8450,  change:'+8', students:290, level:'Secondary'  },
  { id:'10', name:'Cairo Future Leaders',            country:'Egypt',       region:'Middle East',  points:7830,  change:'+4', students:340, level:'University'  },
  { id:'11', name:'Lagos Innovation School',         country:'Nigeria',     region:'Africa',       points:6920,  change:'+6', students:410, level:'Secondary'  },
  { id:'12', name:'Sydney Sustainability School',    country:'Australia',   region:'Asia Pacific', points:11200, change:'+0', students:265, level:'Secondary'  },
  { id:'13', name:'Singapore IB School',             country:'Singapore',   region:'Asia Pacific', points:13100, change:'+2', students:320, level:'Secondary'  },
  { id:'14', name:'Mexico City MUN Center',          country:'Mexico',      region:'Americas',     points:9750,  change:'+3', students:380, level:'Secondary'  },
  { id:'15', name:'Seoul Global Academy',            country:'South Korea', region:'Asia Pacific', points:13600, change:'+1', students:490, level:'University'  },
];

const BLANK: School = { id:'', name:'', country:'', region:'Asia Pacific', points:0, change:'0', students:0, level:'Secondary' };

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin';
  const [schools, setSchools] = useState<School[]>(() => load('school_leaderboard', DEFAULT_SCHOOLS));
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [level, setLevel] = useState('All');
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [saved, setSaved] = useState(false);

  const ranked = useMemo(() => {
    let data = [...schools].sort((a,b) => b.points - a.points).map((s,i) => ({...s, rank: i+1}));
    if (region !== 'All') data = data.filter(s => s.region === region);
    if (level  !== 'All') data = data.filter(s => s.level  === level);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q));
    }
    return data;
  }, [schools, search, region, level]);

  const saveAll = () => { save('school_leaderboard', schools); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const del = (id: string) => setSchools(prev => prev.filter(s=>s.id!==id));
  const openEdit = (s?: School) => setEditing(s ? {...s} : {...BLANK, id: uid()});
  const saveEdit = () => {
    if (!editing) return;
    setSchools(prev => {
      const exists = prev.find(s=>s.id===editing.id);
      return exists ? prev.map(s=>s.id===editing.id?editing:s) : [...prev, editing];
    });
    setEditing(null);
  };

  const medal = (rank: number) => rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':null;

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><Trophy size={20} className="text-yellow-400"/>Schools Leaderboard</h1>
            <p className="text-slate-500 text-xs mt-0.5">Global ranking of schools engaging with SDG Nexus · {schools.length} schools enrolled</p>
          </div>
          {isSuperadmin && (
            <div className="flex gap-2">
              {editMode && (
                <>
                  <button onClick={() => openEdit()} className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"><Plus size={12}/>Add School</button>
                  <button onClick={saveAll} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold ${saved?'bg-green-600 text-white':'bg-slate-800 border border-slate-600 text-slate-300'}`}>
                    <Check size={12}/>{saved?'Saved!':'Save'}
                  </button>
                </>
              )}
              <button onClick={()=>setEditMode(e=>!e)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs border ${editMode?'border-red-700 text-red-400':'border-slate-700 text-slate-400'}`}>
                {editMode?<><X size={12}/>Exit</>:<><Edit3 size={12}/>Manage</>}
              </button>
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {!search && region==='All' && level==='All' && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[schools.sort((a,b)=>b.points-a.points)[1], schools.sort((a,b)=>b.points-a.points)[0], schools.sort((a,b)=>b.points-a.points)[2]].map((s,i) => (
              s && <div key={s.id} className={`bg-slate-900 border rounded-2xl p-4 text-center ${i===1?'border-yellow-600/50 bg-yellow-900/10':'border-slate-800'}`}>
                <div className="text-3xl mb-1">{i===0?'🥈':i===1?'🥇':'🥉'}</div>
                <div className="text-white text-xs font-bold truncate">{s.name}</div>
                <div className="text-slate-500 text-[10px]">{s.country}</div>
                <div className={`font-mono font-bold text-sm mt-1 ${i===1?'text-yellow-400':i===0?'text-slate-300':'text-amber-600'}`}>{s.points.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search school or country…"
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
          </div>
          <select value={region} onChange={e=>setRegion(e.target.value)} className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-3 py-2">
            {REGIONS.map(r=><option key={r}>{r}</option>)}
          </select>
          <select value={level} onChange={e=>setLevel(e.target.value)} className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-3 py-2">
            {LEVELS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>

        <p className="text-slate-600 text-xs mb-3">{ranked.length} schools</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/60 border-b border-slate-800">
              <tr className="text-slate-500 text-xs">
                <th className="text-left px-4 py-3 w-10">Rank</th>
                <th className="text-left px-2 py-3">School</th>
                <th className="text-left px-2 py-3 hidden md:table-cell">Region</th>
                <th className="text-left px-2 py-3 hidden sm:table-cell">Level</th>
                <th className="text-right px-3 py-3">Points</th>
                <th className="text-right px-3 py-3 hidden sm:table-cell">Trend</th>
                {editMode && <th className="px-3 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {ranked.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 w-10">{medal(s.rank) || `#${s.rank}`}</td>
                  <td className="px-2 py-3">
                    <div className="text-white text-sm font-medium">{s.name}</div>
                    <div className="text-slate-500 text-[10px]">{s.country} · {s.students} students</div>
                  </td>
                  <td className="px-2 py-3 hidden md:table-cell text-slate-400 text-xs">{s.region}</td>
                  <td className="px-2 py-3 hidden sm:table-cell">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{s.level}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-sm text-yellow-400">{s.points.toLocaleString()}</td>
                  <td className="px-3 py-3 hidden sm:table-cell text-right">
                    <span className={`text-xs font-bold ${s.change.startsWith('+')?'text-green-400':s.change.startsWith('-')?'text-red-400':'text-slate-500'}`}>
                      {s.change}
                    </span>
                  </td>
                  {editMode && (
                    <td className="px-3 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={()=>openEdit(s)} className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Edit3 size={11} className="text-white"/></button>
                        <button onClick={()=>del(s.id)} className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center"><Trash2 size={11} className="text-white"/></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {ranked.length === 0 && <div className="py-12 text-center text-slate-500 text-sm">No schools found.</div>}
        </div>

        <p className="text-slate-600 text-xs mt-4 text-center">
          Want your school on the leaderboard? <a href="/contact" className="text-blue-400 hover:underline">Contact us</a>
        </p>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-bold">{schools.find(s=>s.id===editing.id)?'Edit':'Add'} School</h3>
            {(['name','country'] as const).map(f=>(
              <div key={f}><label className="text-slate-400 text-xs block mb-1 capitalize">{f}</label>
              <input value={editing[f]} onChange={e=>setEditing({...editing,[f]:e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/></div>
            ))}
            <div><label className="text-slate-400 text-xs block mb-1">Region</label>
              <select value={editing.region} onChange={e=>setEditing({...editing,region:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2">
                {REGIONS.filter(r=>r!=='All').map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label className="text-slate-400 text-xs block mb-1">Level</label>
              <select value={editing.level} onChange={e=>setEditing({...editing,level:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2">
                {LEVELS.filter(l=>l!=='All').map(l=><option key={l}>{l}</option>)}</select></div>
            {(['points','students'] as const).map(f=>(
              <div key={f}><label className="text-slate-400 text-xs block mb-1 capitalize">{f}</label>
              <input type="number" value={editing[f]} onChange={e=>setEditing({...editing,[f]:Number(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/></div>
            ))}
            <div><label className="text-slate-400 text-xs block mb-1">Change (e.g. +3 or -1)</label>
              <input value={editing.change} onChange={e=>setEditing({...editing,change:e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/></div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold">Save</button>
              <button onClick={()=>setEditing(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
