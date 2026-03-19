// EventRegisterPage — shows ongoing/upcoming events for registration
// Superadmin can add/edit/remove events here (re-uses EventsPage logic)
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Globe2, Plus, X, Check, ExternalLink,
         ChevronDown, Wifi, Trash2, Edit3, Send, RefreshCw } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';

const SDG_COLORS=['#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B','#A21942','#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9','#56C02B','#00689D','#19486A'];

const ET_KEY = 'sdg_event_types_v1';
const DEFAULT_ET=[{key:'conference',label:'Conference',emoji:'🎤'},{key:'mun',label:'Model UN',emoji:'🏛️'},{key:'workshop',label:'Workshop',emoji:'🔨'},{key:'hackathon',label:'Hackathon',emoji:'💻'},{key:'summit',label:'Summit',emoji:'🌍'},{key:'youth_forum',label:'Youth Forum',emoji:'🧑'},{key:'webinar',label:'Webinar',emoji:'📡'}];
function getEventTypes(){try{return JSON.parse(localStorage.getItem(ET_KEY)||'null')||DEFAULT_ET;}catch{return DEFAULT_ET;}}
const LOADED_TYPES=getEventTypes();
const TYPE_LABELS:Record<string,string>={};
LOADED_TYPES.forEach((t:any)=>{TYPE_LABELS[t.key]=`${t.emoji} ${t.label}`;});

function fmtDate(raw:string|null|undefined){if(!raw)return'';const d=new Date(raw+'T12:00:00');return`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;}

function getStatus(ev:any):'upcoming'|'ongoing'|'past'{
  const now=new Date();
  const start=ev.date?new Date(ev.date):null;
  const end=ev.date_end?new Date(ev.date_end):start;
  if(!start)return'upcoming';
  if(end&&end<now)return'past';
  if(start<=now&&(!end||end>=now))return'ongoing';
  return'upcoming';
}

// ── Registration form ─────────────────────────────────────────────────────────
function RegForm({ event, onClose }: { event:any; onClose:()=>void }) {
  const [form, setForm] = useState({full_name:'',email:'',organization:'',country:'',message:''});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.full_name || !form.email) return;
    setSubmitting(true);
    try {
      await api.post(`/events/${event.id}/register`, form);
      setDone(true);
    } catch {
      // Fallback: store locally
      const key = `reg_${event.id}`;
      const existing = JSON.parse(localStorage.getItem(key)||'[]');
      existing.push({...form, registered_at: new Date().toISOString()});
      localStorage.setItem(key, JSON.stringify(existing));
      setDone(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-bold">Register for {event.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16}/></button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-bold mb-1">Registration submitted!</p>
            <p className="text-slate-400 text-sm">We'll be in touch with event details.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Close</button>
          </div>
        ) : (
          <>
            {[{f:'full_name',label:'Full Name *',placeholder:'Your name'},{f:'email',label:'Email *',placeholder:'you@example.com'},{f:'organization',label:'Organization',placeholder:'School / Company'},{f:'country',label:'Country',placeholder:'Country'}].map(({f,label,placeholder})=>(
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1">{label}</label>
                <input value={(form as any)[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} placeholder={placeholder}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-xs block mb-1">Message (optional)</label>
              <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} rows={2} placeholder="Any questions or notes"
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={submit} disabled={submitting||!form.full_name||!form.email}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5">
                {submitting?<RefreshCw size={13} className="animate-spin"/>:<Send size={13}/>}
                {submitting?'Submitting…':'Register Now'}
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, onRegister, onEdit, onDelete, canManage }: any) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatus(event);
  const sdgGoals: number[] = event.sdg_goals ? String(event.sdg_goals).split(',').map(Number).filter(Boolean) : [];
  const isVirtual = event.is_virtual;

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all bg-slate-900/40">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
            {TYPE_LABELS[event.event_type]?.split(' ')[0]||'📅'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-bold text-sm flex-1">{event.title}</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                status==='ongoing'?'bg-green-900/50 text-green-300 border border-green-700/40':
                status==='upcoming'?'bg-blue-900/50 text-blue-300 border border-blue-700/40':
                'bg-slate-800 text-slate-500'
              }`}>
                {status==='ongoing'?'🟢 Ongoing':status==='upcoming'?'🔵 Upcoming':'⚫ Past'}
              </span>
            </div>
            {event.organizer && <p className="text-slate-500 text-xs mb-1">By {event.organizer}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
              {event.date && <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDate(event.date)}{event.date_end&&` – ${fmtDate(event.date_end)}`}</span>}
              {event.location && <span className="flex items-center gap-1"><MapPin size={10}/>{event.location}</span>}
              {isVirtual && <span className="flex items-center gap-1"><Wifi size={10}/>Virtual</span>}
            </div>
            {sdgGoals.length>0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {sdgGoals.map(g=><span key={g} className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{background:SDG_COLORS[g-1]}}>{g}</span>)}
              </div>
            )}
          </div>
        </div>

        {expanded && event.description && (
          <p className="text-slate-400 text-xs leading-relaxed mt-3 mb-3">{event.description}</p>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {status!=='past' && (
            <button onClick={()=>onRegister(event)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition">
              <Users size={11}/>Register
            </button>
          )}
          {event.registration_url && (
            <a href={event.registration_url} target="_blank" rel="noopener"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-3 py-2 border border-blue-800/40 rounded-xl transition">
              <ExternalLink size={11}/>External Link
            </a>
          )}
          {event.description && (
            <button onClick={()=>setExpanded(v=>!v)} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition">
              <ChevronDown size={12} className={expanded?'rotate-180':''}/>Details
            </button>
          )}
          {canManage && (
            <div className="ml-auto flex gap-1">
              <button onClick={()=>onEdit(event)} className="p-1.5 text-slate-600 hover:text-blue-400 transition"><Edit3 size={12}/></button>
              <button onClick={()=>onDelete(event.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition"><Trash2 size={12}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const BLANK_EVENT = {title:'',description:'',organizer:'',location:'',date:'',date_end:'',event_type:'conference',is_virtual:false,registration_url:'',sdg_goals:''};

export default function EventRegisterPage() {
  const { user, token } = useAuthStore();
  const canManage = user?.role==='superadmin'||user?.role==='admin';
  const headers = { Authorization: `Bearer ${token}` };

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regEvent, setRegEvent] = useState<any|null>(null);
  const [editing, setEditing] = useState<any|null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/events');
      const all = r.data?.events||r.data||[];
      // Only show ongoing and upcoming
      setEvents(all.filter((e:any)=>getStatus(e)!=='past'));
    } catch { setEvents([]); }
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    try {
      if (editing.id) await api.put(`/events/${editing.id}`, editing, {headers});
      else await api.post('/events', editing, {headers});
      setEditing(null); load();
    } catch { alert('Save failed'); }
    setSaving(false);
  };

  const del = async (id:string) => {
    if (!confirm('Remove event?')) return;
    try { await api.delete(`/events/${id}`,{headers}); load(); } catch { alert('Delete failed'); }
  };

  const eventTypes = getEventTypes();

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      {regEvent && <RegForm event={regEvent} onClose={()=>setRegEvent(null)}/>}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar size={22} className="text-blue-400"/>Event Register
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Ongoing and upcoming SDG events — register your interest</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} disabled={loading} className="p-2 text-slate-500 hover:text-white border border-slate-800 rounded-xl transition">
              <RefreshCw size={14} className={loading?'animate-spin':''}/>
            </button>
            {canManage && (
              <button onClick={()=>setEditing({...BLANK_EVENT})}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition">
                <Plus size={14}/>Add Event
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : events.length===0 ? (
          <div className="text-center py-16 text-slate-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
            <p>No upcoming events right now.</p>
            {canManage&&<p className="text-xs mt-1">Click "Add Event" to create one.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e=>(
              <EventCard key={e.id} event={e}
                onRegister={setRegEvent}
                onEdit={(ev:any)=>setEditing({...ev})}
                onDelete={del}
                canManage={canManage}/>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-bold">{editing.id?'Edit Event':'Add Event'}</h3>
              <button onClick={()=>setEditing(null)} className="text-slate-500 hover:text-white"><X size={16}/></button>
            </div>
            {[{f:'title',label:'Title *'},{f:'organizer',label:'Organizer'},{f:'location',label:'Location'},{f:'registration_url',label:'Registration URL'},{f:'sdg_goals',label:'SDG Goals (e.g. 4,13,17)'}].map(({f,label})=>(
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1">{label}</label>
                <input value={editing[f]||''} onChange={e=>setEditing((p:any)=>({...p,[f]:e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-slate-400 text-xs block mb-1">Start Date</label><input type="date" value={editing.date||''} onChange={e=>setEditing((p:any)=>({...p,date:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/></div>
              <div><label className="text-slate-400 text-xs block mb-1">End Date</label><input type="date" value={editing.date_end||''} onChange={e=>setEditing((p:any)=>({...p,date_end:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-slate-400 text-xs block mb-1">Type</label>
                <select value={editing.event_type||'conference'} onChange={e=>setEditing((p:any)=>({...p,event_type:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none">
                  {eventTypes.map((t:any)=><option key={t.key} value={t.key}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editing.is_virtual} onChange={e=>setEditing((p:any)=>({...p,is_virtual:e.target.checked}))} className="w-4 h-4 accent-blue-600"/>
                  <span className="text-slate-300 text-sm">Virtual event</span>
                </label>
              </div>
            </div>
            <div><label className="text-slate-400 text-xs block mb-1">Description</label>
              <textarea value={editing.description||''} rows={3} onChange={e=>setEditing((p:any)=>({...p,description:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving||!editing.title}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5">
                {saving?<RefreshCw size={13} className="animate-spin"/>:<Check size={13}/>}
                {saving?'Saving…':'Save Event'}
              </button>
              <button onClick={()=>setEditing(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
