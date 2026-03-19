// PartnershipsPage v23 — split: Living Labs (description + labs list) | Partners (top + photo gallery)
import { useState } from 'react';
import { Globe, Heart, Plus, Trash2, Edit3, Check, X, ChevronRight,
         ArrowLeft, Users, FolderOpen, MapPin, Target, Image } from 'lucide-react';
import { useAuthStore } from '@/store';

interface Partner {
  id: string; name: string; logo: string; category: string;
  url?: string; imageUrl?: string; description?: string;
}
interface Lab {
  id: string; name: string; location: string; focus: string;
  description: string; participants: number; projects: number;
  sdg: number; contactEmail?: string; website?: string; highlights?: string[];
}

function load<T>(k: string, d: T): T { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } }
function save(k: string, v: any) { localStorage.setItem(k, JSON.stringify(v)); }
function uid() { return Math.random().toString(36).slice(2); }

const SDG_COLORS: Record<number,string> = {1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',16:'#00689D',17:'#19486A'};

const DEFAULT_PARTNERS: Partner[] = [
  { id:'1', name:'United Nations', logo:'🇺🇳', category:'Global Partnership', url:'https://un.org', description:'The United Nations is an international organization founded in 1945 to maintain international peace and promote sustainable development.' },
  { id:'2', name:'UNESCO', logo:'🎓', category:'Education Partner', url:'https://unesco.org', description:'UNESCO builds peace through international cooperation in Education, Sciences and Culture.' },
  { id:'3', name:'UNDP', logo:'🌍', category:'Development Partner', url:'https://undp.org', description:'UNDP works to eradicate poverty and reduce inequalities through sustainable development.' },
  { id:'4', name:'UNICEF', logo:'👶', category:'Children & Education', url:'https://unicef.org', description:'UNICEF works in over 190 countries and territories to protect children\'s rights.' },
  { id:'5', name:'WHO', logo:'🏥', category:'Health Partner', url:'https://who.int', description:'The World Health Organization leads global efforts to expand universal health coverage.' },
  { id:'6', name:'FAO', logo:'🌾', category:'Food & Agriculture', url:'https://fao.org', description:'FAO leads international efforts to defeat hunger and improve nutrition worldwide.' },
  { id:'7', name:'Research Universities', logo:'🔬', category:'Academic Partnership', description:'Leading research universities contributing to SDG data and educational resources.' },
  { id:'8', name:'Green NGOs', logo:'🌱', category:'Environmental Partners', description:'Environmental non-governmental organizations driving grassroots SDG action.' },
  { id:'9', name:'Private Sector', logo:'💼', category:'Corporate Partners', description:'Corporations integrating SDGs into their business practices and supply chains.' },
  { id:'10', name:'Youth Organizations', logo:'👥', category:'Youth Engagement', description:'Youth-led organizations mobilizing the next generation for SDG action.' },
  { id:'11', name:'Tech for Good', logo:'💻', category:'Technology Partners', description:'Technology companies building digital tools to accelerate SDG progress.' },
  { id:'12', name:'Global Foundations', logo:'🏛️', category:'Philanthropic Partners', description:'Philanthropic foundations funding SDG research, education, and field projects.' },
];

const DEFAULT_LABS: Lab[] = [
  { id:'1', name:'Urban Sustainability Lab', location:'New York, USA', focus:'Sustainable Cities', description:'Students work with city planners to design and test sustainable urban solutions that reduce emissions, improve mobility, and create liveable communities for all.', participants:150, projects:12, sdg:11, contactEmail:'urban@sdgnexus.org', website:'https://sdgnexus.org', highlights:['Smart mobility projects','Green building design','Community resilience workshops'] },
  { id:'2', name:'Clean Energy Innovation Hub', location:'Berlin, Germany', focus:'Affordable Clean Energy', description:'Collaborating with energy companies to develop renewable energy solutions, focusing on solar, wind, and storage technologies for underserved communities globally.', participants:89, projects:8, sdg:7, contactEmail:'energy@sdgnexus.org', highlights:['Solar micro-grid deployment','Energy storage prototypes','Policy brief development'] },
  { id:'3', name:'Ocean Conservation Center', location:'Sydney, Australia', focus:'Life Below Water', description:'Marine research and conservation projects with local communities, tackling plastic pollution, coral reef restoration, and sustainable fisheries management.', participants:112, projects:15, sdg:14, contactEmail:'ocean@sdgnexus.org', highlights:['Coral reef monitoring','Plastic cleanup campaigns','Sustainable aquaculture trials'] },
  { id:'4', name:'Food Security Initiative', location:'São Paulo, Brazil', focus:'Zero Hunger', description:'Urban farming and food distribution projects addressing local hunger through innovative agroecology, food banking systems, and community-led nutrition programs.', participants:203, projects:20, sdg:2, contactEmail:'food@sdgnexus.org', highlights:['Urban vertical farms','Community food banks','School nutrition programs'] },
];

// ── Lab Detail ────────────────────────────────────────────────────────────────
function LabDetail({ lab, onBack }: { lab: Lab; onBack: () => void }) {
  const color = SDG_COLORS[lab.sdg] || '#235390';
  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16}/> Back to Partnerships
        </button>
        <div className="rounded-2xl p-8 mb-6 border" style={{ background: color+'18', borderColor: color+'44' }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0" style={{ background: color }}>🔬</div>
            <div>
              <div className="text-xs font-bold px-2 py-0.5 rounded-full text-white w-fit mb-2" style={{ background: color }}>SDG {lab.sdg} · {lab.focus}</div>
              <h1 className="text-2xl font-bold text-white mb-1">{lab.name}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12}/>{lab.location}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center"><div className="text-3xl font-bold text-white mb-1">{lab.participants}</div><div className="text-slate-500 text-xs flex items-center justify-center gap-1"><Users size={10}/>Students</div></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center"><div className="text-3xl font-bold text-white mb-1">{lab.projects}</div><div className="text-slate-500 text-xs flex items-center justify-center gap-1"><FolderOpen size={10}/>Projects</div></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4"><h2 className="text-white font-bold mb-3 flex items-center gap-2"><Target size={14} className="text-blue-400"/>About This Lab</h2><p className="text-slate-300 text-sm leading-relaxed">{lab.description}</p></div>
        {lab.highlights?.length && (<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4"><h2 className="text-white font-bold mb-3">🏆 Key Projects</h2><ul className="space-y-2">{lab.highlights.map((h,i)=><li key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5" style={{background:color}}>{i+1}</span>{h}</li>)}</ul></div>)}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-3">📬 Get Involved</h2>
          <div className="flex flex-wrap gap-3">
            {lab.contactEmail && <a href={`mailto:${lab.contactEmail}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-slate-700 text-slate-300 hover:text-white transition-colors">✉️ {lab.contactEmail}</a>}
            {lab.website && <a href={lab.website} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-blue-700/50 text-blue-400 hover:bg-blue-600/20 transition-colors">🌐 Visit Website</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PartnershipsPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin';
  const [tab, setTab] = useState<'labs'|'partners'>('labs');
  const [editMode, setEditMode] = useState(false);
  const [partners, setPartners] = useState<Partner[]>(() => load('partners', DEFAULT_PARTNERS));
  const [labs, setLabs] = useState<Lab[]>(() => load('labs', DEFAULT_LABS));
  const [editingPartner, setEditingPartner] = useState<Partner|null>(null);
  const [editingLab, setEditingLab] = useState<Lab|null>(null);
  const [selectedLab, setSelectedLab] = useState<Lab|null>(null);
  const [saved, setSaved] = useState(false);

  if (selectedLab) return <LabDetail lab={selectedLab} onBack={()=>setSelectedLab(null)}/>;

  const saveAll = () => { save('partners', partners); save('labs', labs); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const addPartner = () => { const p={id:uid(),name:'New Partner',logo:'🤝',category:'Partner'}; setPartners(p=>[...p,p as any]); setEditingPartner(p as any); };
  const updatePartner=(p:Partner)=>{setPartners(prev=>prev.map(x=>x.id===p.id?p:x));setEditingPartner(null);};
  const deletePartner=(id:string)=>setPartners(prev=>prev.filter(p=>p.id!==id));
  const addLab=()=>{const l={id:uid(),name:'New Lab',location:'',focus:'',description:'',participants:0,projects:0,sdg:13,highlights:[]};setLabs(p=>[...p,l]);setEditingLab(l);};
  const updateLab=(l:Lab)=>{setLabs(prev=>prev.map(x=>x.id===l.id?l:x));setEditingLab(null);};
  const deleteLab=(id:string)=>setLabs(prev=>prev.filter(l=>l.id!==id));

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Heart size={28} className="text-pink-400"/>Global Partnerships</h1>
            <p className="text-slate-500 text-sm mt-1">SDG Nexus living labs and partner organizations worldwide</p>
          </div>
          {isSuperadmin && (
            <div className="flex gap-2">
              {editMode && <button onClick={saveAll} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${saved?'bg-green-600 text-white':'bg-blue-600 hover:bg-blue-500 text-white'}`}><Check size={14}/>{saved?'Saved!':'Save'}</button>}
              <button onClick={()=>setEditMode(e=>!e)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${editMode?'border-red-700 text-red-400':'border-slate-700 text-slate-400 hover:text-white'}`}>
                {editMode?<><X size={14}/>Exit Edit</>:<><Edit3 size={14}/>Edit Page</>}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit mb-8">
          <button onClick={()=>setTab('labs')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab==='labs'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>🔬 Living Labs</button>
          <button onClick={()=>setTab('partners')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab==='partners'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>🤝 Partners</button>
        </div>

        {/* ── LIVING LABS TAB ── */}
        {tab==='labs' && (
          <div className="space-y-8">
            {/* Description block at top */}
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800/40 rounded-2xl p-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-3xl flex-shrink-0">🔬</div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">What are Living Labs?</h2>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Living Labs are real-world experimentation and co-creation environments where students, researchers, and communities collaborate to develop and test innovative solutions to the UN Sustainable Development Goals. Each lab is embedded in a specific context — urban, rural, coastal, or industrial — and uses real data to drive evidence-based action.
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Students participate in hands-on research projects, policy briefs, and community outreach. Every lab is aligned with at least one SDG and produces measurable impact outcomes that are reported back to the SDG Nexus network.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[['🌍',`${labs.reduce((s,l)=>s+l.participants,0)}+`,'Students engaged'],['🔬',`${labs.length}`,'Active labs'],['📂',`${labs.reduce((s,l)=>s+l.projects,0)}+`,'Running projects']].map(([icon,val,label])=>(
                      <div key={label} className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-white font-bold text-lg">{val}</div>
                        <div className="text-slate-400 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Labs list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Our Labs</h2>
                {editMode && <button onClick={addLab} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl"><Plus size={12}/>Add Lab</button>}
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {labs.map(l=>(
                  <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all relative group">
                    {editMode && (
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button onClick={()=>setEditingLab(l)} className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Edit3 size={11} className="text-white"/></button>
                        <button onClick={()=>deleteLab(l.id)} className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center"><Trash2 size={11} className="text-white"/></button>
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background:SDG_COLORS[l.sdg]||'#235390'}}>{l.sdg}</div>
                      <div><h3 className="text-white font-bold">{l.name}</h3><p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><MapPin size={9}/>{l.location}</p></div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-3">{l.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span><span className="text-white font-bold">{l.participants}</span> students</span>
                        <span><span className="text-white font-bold">{l.projects}</span> projects</span>
                      </div>
                      {!editMode && <button onClick={()=>setSelectedLab(l)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">View Lab <ChevronRight size={12}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PARTNERS TAB ── */}
        {tab==='partners' && (
          <div className="space-y-10">
            {/* Top — partner cards grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">🤝 Partner Organizations</h2>
                {editMode && <button onClick={addPartner} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl"><Plus size={12}/>Add</button>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {partners.map(p=>(
                  <div key={p.id} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center hover:border-slate-600 transition-all group">
                    {editMode && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={()=>setEditingPartner(p)} className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center"><Edit3 size={10} className="text-white"/></button>
                        <button onClick={()=>deletePartner(p.id)} className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center"><Trash2 size={10} className="text-white"/></button>
                      </div>
                    )}
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-contain rounded-xl mx-auto mb-2"/> : <div className="text-4xl mb-2">{p.logo}</div>}
                    <div className="text-white text-sm font-semibold">{p.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{p.category}</div>
                    {p.url && !editMode && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline mt-1 block">Visit ↗</a>}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo gallery section */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Image size={18} className="text-pink-400"/>Partner Gallery</h2>
              <p className="text-slate-500 text-sm mb-5">Moments from our global partnership events, field visits, and collaborative projects.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label:'UN SDG Summit 2024', emoji:'🌐', bg:'from-blue-900/40 to-cyan-900/40', border:'border-blue-800/40' },
                  { label:'Ocean Lab Field Visit', emoji:'🌊', bg:'from-teal-900/40 to-blue-900/40', border:'border-teal-800/40' },
                  { label:'Youth Climate Forum', emoji:'🌱', bg:'from-green-900/40 to-emerald-900/40', border:'border-green-800/40' },
                  { label:'Urban Innovation Week', emoji:'🏙️', bg:'from-slate-800/60 to-slate-900/60', border:'border-slate-700/40' },
                  { label:'SDG Hackathon 2025', emoji:'💻', bg:'from-violet-900/40 to-purple-900/40', border:'border-violet-800/40' },
                  { label:'Agriculture Lab Visit', emoji:'🌾', bg:'from-amber-900/40 to-yellow-900/40', border:'border-amber-800/40' },
                ].map((item,i)=>(
                  <div key={i} className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl aspect-video flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer`}>
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-white text-xs font-semibold text-center px-3">{item.label}</span>
                    {isSuperadmin && editMode && (
                      <span className="text-[10px] text-slate-500">Click to add image</span>
                    )}
                  </div>
                ))}
              </div>
              {isSuperadmin && editMode && (
                <p className="text-slate-600 text-xs mt-3 text-center">
                  Connect Google Drive in Resources page to upload gallery photos
                </p>
              )}
            </div>

            {/* Become a partner CTA */}
            <div className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 border border-blue-800/30 rounded-2xl p-8 text-center">
              <Globe size={40} className="text-blue-400 mx-auto mb-4"/>
              <h2 className="text-2xl font-bold text-white mb-2">Become a Partner</h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">Join our global network of organizations working together to advance the SDGs through education and action.</p>
              <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">Contact Us</a>
            </div>
          </div>
        )}
      </div>

      {/* Partner edit modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="text-white font-bold">Edit Partner</h3>
            {(['logo','name','category','url','imageUrl','description'] as const).map(f=>(
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1 capitalize">{f==='imageUrl'?'Image URL (optional)':f}</label>
                {f==='description'
                  ? <textarea value={(editingPartner as any)[f]||''} rows={2} onChange={e=>setEditingPartner({...editingPartner,[f]:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
                  : <input value={(editingPartner as any)[f]||''} onChange={e=>setEditingPartner({...editingPartner,[f]:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
                }
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={()=>updatePartner(editingPartner)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold">Save</button>
              <button onClick={()=>setEditingPartner(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Lab edit modal */}
      {editingLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-bold">Edit Lab</h3>
            {(['name','location','focus','description','contactEmail','website'] as const).map(f=>(
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1 capitalize">{f}</label>
                {f==='description'
                  ? <textarea value={editingLab[f]||''} rows={3} onChange={e=>setEditingLab({...editingLab,[f]:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
                  : <input value={(editingLab as any)[f]||''} onChange={e=>setEditingLab({...editingLab,[f]:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
                }
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-slate-400 text-xs block mb-1">SDG #</label><input type="number" min={1} max={17} value={editingLab.sdg} onChange={e=>setEditingLab({...editingLab,sdg:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/></div>
              {(['participants','projects'] as const).map(f=><div key={f}><label className="text-slate-400 text-xs block mb-1 capitalize">{f}</label><input type="number" value={editingLab[f]} onChange={e=>setEditingLab({...editingLab,[f]:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/></div>)}
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Highlights (one per line)</label>
              <textarea value={(editingLab.highlights||[]).join('\n')} rows={3} onChange={e=>setEditingLab({...editingLab,highlights:e.target.value.split('\n').filter(Boolean)})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=>updateLab(editingLab)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold">Save</button>
              <button onClick={()=>setEditingLab(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
