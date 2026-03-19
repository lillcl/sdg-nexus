// EventsPage.tsx — events with Past / Ongoing / Upcoming tabs + search
import { useState, useEffect, useMemo } from 'react';
import api from '@/api/client';
import { Calendar, MapPin, Users, Globe2, Plus, X, ExternalLink, ChevronDown,
         Building2, Wifi, Search, Clock, CheckCircle, CalendarDays, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store';

const SDG_COLORS = [
  '#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B',
  '#A21942','#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9',
  '#56C02B','#00689D','#19486A',
];
const SDG_GOALS_LABELS = [
  'No Poverty','Zero Hunger','Good Health','Quality Education','Gender Equality',
  'Clean Water','Clean Energy','Decent Work','Industry','Reduced Inequalities',
  'Sustainable Cities','Responsible Consumption','Climate Action','Life Below Water',
  'Life on Land','Peace & Justice','Partnerships',
];

// Read custom event types from localStorage (set by superadmin in Dashboard)
const ET_KEY = 'sdg_event_types_v1';
const DEFAULT_ET = [
  {key:'conference',label:'Conference',emoji:'🎤'},
  {key:'mun',label:'Model UN',emoji:'🏛️'},
  {key:'workshop',label:'Workshop',emoji:'🔨'},
  {key:'hackathon',label:'Hackathon',emoji:'💻'},
  {key:'summit',label:'Summit',emoji:'🌍'},
  {key:'youth_forum',label:'Youth Forum',emoji:'🧑'},
  {key:'webinar',label:'Webinar',emoji:'📡'},
];
function getEventTypes() {
  try { return JSON.parse(localStorage.getItem(ET_KEY)||'null') || DEFAULT_ET; } catch { return DEFAULT_ET; }
}
const LOADED_TYPES = getEventTypes();
const EVENT_TYPES: string[] = LOADED_TYPES.map((t: any) => t.key);
const TYPE_LABELS: Record<string,string> = {};
LOADED_TYPES.forEach((t: any) => { TYPE_LABELS[t.key] = `${t.emoji} ${t.label}`; });

function fmtDate(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = new Date(raw + 'T12:00:00');
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function getStatus(event: any): 'upcoming'|'ongoing'|'past' {
  const now = new Date();
  const start = event.date ? new Date(event.date) : null;
  const end   = event.date_end ? new Date(event.date_end) : start;
  if (!start) return 'upcoming';
  if (end && end < now) return 'past';
  if (start <= now && (!end || end >= now)) return 'ongoing';
  return 'upcoming';
}

function SDGGoalPicker({ selected, onChange }: { selected:number[]; onChange:(v:number[])=>void }) {
  const toggle = (g:number) => onChange(selected.includes(g) ? selected.filter(x=>x!==g) : [...selected,g]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {SDG_GOALS_LABELS.map((label,i) => {
        const g=i+1; const active=selected.includes(g);
        return (
          <button key={g} type="button" onClick={()=>toggle(g)} title={`SDG ${g}: ${label}`}
            className={`text-[10px] font-bold font-mono px-2 py-1 rounded-lg transition-all ${active?'text-white scale-105':'text-white/40 hover:text-white/70'}`}
            style={{background: active ? SDG_COLORS[i] : SDG_COLORS[i]+'33'}}>
            {g}
          </button>
        );
      })}
    </div>
  );
}

function EventCard({ event, onRegister, onDelete, canDelete }: { event:any; onRegister:(id:string)=>void; onDelete?:(id:string)=>void; canDelete?:boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const sdgGoals: number[] = event.sdg_goals ? String(event.sdg_goals).split(',').map(Number).filter(Boolean) : [];
  const status = getStatus(event);

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all bg-slate-900/20">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
            {TYPE_LABELS[event.event_type]?.split(' ')[0] || '📅'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-bold text-sm flex-1">{event.title}</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 flex-shrink-0">
                {TYPE_LABELS[event.event_type] || event.event_type}
              </span>
              {status === 'ongoing' && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-700/40 flex-shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"/>LIVE
                </span>
              )}
              {status === 'past' && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 flex-shrink-0">PAST</span>
              )}
            </div>
            {event.organizer && <p className="text-slate-500 text-xs mb-1.5 flex items-center gap-1"><Building2 size={10}/>{event.organizer}</p>}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {event.date && <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDate(event.date)}{event.date_end && ` – ${fmtDate(event.date_end)}`}</span>}
              {event.is_virtual
                ? <span className="flex items-center gap-1 text-cyan-600"><Wifi size={10}/>Virtual</span>
                : event.location && <span className="flex items-center gap-1"><MapPin size={10}/>{event.location}</span>}
            </div>
            {sdgGoals.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sdgGoals.map(g => (
                  <span key={g} className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded text-white"
                    style={{background: SDG_COLORS[g-1]}}>SDG {g}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {expanded && event.description && (
          <p className="mt-3 text-slate-400 text-xs leading-relaxed border-t border-slate-800 pt-3">{event.description}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={()=>setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            <ChevronDown size={12} className={`transition-transform ${expanded?'rotate-180':''}`}/>
            {expanded?'Less':'Details'}
          </button>
          {event.registration_url && (
            <a href={event.registration_url} target="_blank" rel="noopener"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <ExternalLink size={10}/> External Registration
            </a>
          )}
          <div className="ml-auto flex items-center gap-2">
            {status !== 'past' && (
              <button onClick={()=>setShowReg(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 text-xs rounded-lg transition-all">
                <Users size={10}/> Register
              </button>
            )}
            {canDelete && onDelete && (
              <button onClick={()=>{ if(confirm('Delete this event?')) onDelete(event.id); }}
                className="flex items-center gap-1 px-2 py-1.5 bg-red-900/20 border border-red-800/40 text-red-400 hover:bg-red-900/40 text-xs rounded-lg transition-all">
                <Trash2 size={10}/>
              </button>
            )}
          </div>
        </div>
      </div>
      {showReg && (
        <RegistrationForm eventId={event.id} onClose={()=>setShowReg(false)} onSuccess={()=>{setShowReg(false); onRegister(event.id);}}/>
      )}
    </div>
  );
}

function RegistrationForm({ eventId, onClose, onSuccess }: { eventId:string; onClose:()=>void; onSuccess:()=>void }) {
  const [form, setForm] = useState({full_name:'',email:'',organization:'',role:'',country:'',message:''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!form.full_name || !form.email) { setError('Name and email required'); return; }
    setLoading(true);
    try { await api.post(`/events/${eventId}/register`, form); onSuccess(); }
    catch (e:any) { setError(e.response?.data?.detail || 'Registration failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="border-t border-slate-800 p-4 bg-slate-900/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-bold text-sm">Register for Event</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={14}/></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Full name *" value={form.full_name} onChange={e=>setForm(p=>({...p,full_name:e.target.value}))}
          className="col-span-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-600"/>
        <input placeholder="Email *" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
          className="col-span-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-600"/>
        <input placeholder="Organization" value={form.organization} onChange={e=>setForm(p=>({...p,organization:e.target.value}))}
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-600"/>
        <input placeholder="Country" value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))}
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-600"/>
        <textarea placeholder="Message (optional)" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
          className="col-span-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-600 h-16 resize-none"/>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <div className="flex gap-2 mt-3">
        <button onClick={onClose} className="flex-1 px-3 py-2 border border-slate-700 text-slate-400 text-xs rounded-lg hover:border-slate-500">Cancel</button>
        <button onClick={submit} disabled={loading}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-all disabled:opacity-50">
          {loading?'Submitting...':'Submit Registration'}
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, onCreated }: { onClose:()=>void; onCreated:()=>void }) {
  const [form, setForm] = useState({
    title:'', description:'', event_type:'conference',
    date_start:'', date_end:'', location:'',
    is_virtual:false, organizer:'', registration_url:'',
  });
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k:string,v:any) => setForm(p=>({...p,[k]:v}));
  const submit = async () => {
    if (!form.title || !form.date_start) { setError('Title and start date are required'); return; }
    setLoading(true);
    try {
      await api.post('/events', {
        title: form.title, description: form.description,
        date: form.date_start, date_end: form.date_end || null,
        event_type: form.event_type, organizer: form.organizer,
        location: form.location, is_virtual: form.is_virtual,
        registration_url: form.registration_url,
        sdg_tags: selectedSDGs.map(String),
        sdg_goals: selectedSDGs.join(','),
      });
      onCreated(); onClose();
    } catch (e:any) {
      setError(e.response?.data?.detail || 'Failed to create event');
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a1525] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-white font-bold">Create Event</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16}/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          <input placeholder="Event title *" value={form.title} onChange={e=>set('title',e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600"/>
          <textarea placeholder="Description" value={form.description} onChange={e=>set('description',e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 h-20 resize-none"/>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Event Type</label>
              <select value={form.event_type} onChange={e=>set('event_type',e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2">
                {EVENT_TYPES.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <input placeholder="Organizer" value={form.organizer} onChange={e=>set('organizer',e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 self-end"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Start Date *</label>
              <input type="date" value={form.date_start} onChange={e=>set('date_start',e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 [color-scheme:dark]"/>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">End Date</label>
              <input type="date" value={form.date_end} onChange={e=>set('date_end',e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 [color-scheme:dark]"/>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_virtual} onChange={e=>set('is_virtual',e.target.checked)} className="w-4 h-4 accent-blue-500"/>
            <span className="text-white text-sm">Virtual Event</span>
          </label>
          {!form.is_virtual && (
            <input placeholder="Location (city, country)" value={form.location} onChange={e=>set('location',e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600"/>
          )}
          <input placeholder="Registration URL (optional)" value={form.registration_url} onChange={e=>set('registration_url',e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600"/>
          <div>
            <label className="text-slate-500 text-xs mb-2 block">SDG Goals</label>
            <SDGGoalPicker selected={selectedSDGs} onChange={setSelectedSDGs}/>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <div className="flex gap-3 p-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 text-sm rounded-xl hover:border-slate-500">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
            {loading?'Creating...':'✓ Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TIME_TABS = [
  { key:'upcoming', label:'Upcoming', icon:CalendarDays },
  { key:'ongoing',  label:'Live Now', icon:Clock        },
  { key:'past',     label:'Past',     icon:CheckCircle  },
] as const;

export default function EventsPage() {
  const { user } = useAuthStore();
  const canCreate = user?.role === 'admin' || user?.role === 'superadmin';
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [timeTab, setTimeTab] = useState<'upcoming'|'ongoing'|'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  const deleteEvent = async (id: string) => {
    try { await api.delete(`/events/${id}`); load(searchTerm); } catch(e:any) { alert(e?.response?.data?.detail || 'Delete failed'); }
  };

  const load = async (search='') => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (filterType !== 'all') params.event_type = filterType;
      if (search) params.search = search;
      const r = await api.get('/events', { params });
      setEvents(Array.isArray(r.data) ? r.data : (r.data?.events ?? []));
      setError('');
    } catch (err:any) {
      const status = (err as any)?.response?.status;
      if (status === 404) { setEvents([]); setError(''); }
      else setError('Could not load events. Backend may be waking up — please retry in a moment.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(searchTerm); }, [filterType]);
  useEffect(() => {
    const t = setTimeout(() => load(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const byTime = useMemo(() => {
    return events.filter(e => getStatus(e) === timeTab);
  }, [events, timeTab]);

  const filtered = useMemo(() => {
    if (!searchTerm) return byTime;
    const q = searchTerm.toLowerCase();
    return byTime.filter(e =>
      (e.title||'').toLowerCase().includes(q) ||
      (e.organizer||'').toLowerCase().includes(q) ||
      (e.location||'').toLowerCase().includes(q)
    );
  }, [byTime, searchTerm]);

  const counts = useMemo(() => ({
    upcoming: events.filter(e=>getStatus(e)==='upcoming').length,
    ongoing:  events.filter(e=>getStatus(e)==='ongoing').length,
    past:     events.filter(e=>getStatus(e)==='past').length,
  }), [events]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#040810]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-white font-bold text-2xl mb-1">Events</h1>
            <p className="text-slate-500 text-sm">AI for Global Language · AI for Science · AI for SDGs</p>
          </div>
          {canCreate && (
            <button onClick={()=>setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 flex-shrink-0">
              <Plus size={14}/>Add Event
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
            placeholder="Search events by title, organizer, location…"
            className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
        </div>

        {/* Time tabs */}
        <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 mb-4 w-fit">
          {TIME_TABS.map(({key,label,icon:Icon}) => (
            <button key={key} onClick={()=>setTimeTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                timeTab===key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon size={12}/>
              {label}
              {counts[key] > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  timeTab===key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>{counts[key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={()=>setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType==='all'?'bg-slate-700 text-white':'text-slate-500 hover:text-slate-300'}`}>
            All Types
          </button>
          {EVENT_TYPES.map(t=>(
            <button key={t} onClick={()=>setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType===t?'bg-slate-700 text-white':'text-slate-500 hover:text-slate-300'}`}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : error ? (
          <div className="text-center py-12 border border-red-900/40 rounded-2xl bg-red-950/20">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={()=>load()} className="mt-3 text-xs text-slate-500 hover:text-white">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-2xl">
            <Calendar size={40} className="text-slate-700 mx-auto mb-4"/>
            <p className="text-slate-500 text-sm mb-2">
              {timeTab==='past' ? 'No past events' : timeTab==='ongoing' ? 'No live events right now' : 'No upcoming events yet'}
            </p>
            {canCreate && timeTab==='upcoming' && (
              <button onClick={()=>setShowCreate(true)}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all">
                <Plus size={12} className="inline mr-1.5"/>Add First Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e=>(
              <EventCard key={e.id} event={e} onRegister={()=>load()} onDelete={deleteEvent} canDelete={canCreate}/>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateEventModal onClose={()=>setShowCreate(false)} onCreated={()=>load()}/>
      )}
    </div>
  );
}
