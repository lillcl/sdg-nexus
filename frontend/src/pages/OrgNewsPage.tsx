// OrgNewsPage — Organisation news in Bloomberg/AAIA-style magazine layout
// Stored in Supabase org_news table; superadmin can add/remove
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, X, Check, ExternalLink, RefreshCw, Star } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';

interface OrgArticle {
  id: string; title: string; slug: string; summary: string; body: string;
  image_url: string; category: string; published_at: string;
  author: string; featured: boolean;
}

const BLANK: Partial<OrgArticle> = {
  title:'', slug:'', summary:'', body:'', image_url:'', category:'news',
  author:'', featured:false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return d; }
}

// ── Carousel of partner logos (infinite scroll both directions) ───────────────
function LogoCarousel({ logos }: { logos: {name:string;url:string}[] }) {
  if (!logos.length) return null;
  const doubled = [...logos, ...logos]; // duplicate for seamless loop
  return (
    <div className="overflow-hidden py-4 bg-slate-900/40 border-y border-slate-800">
      <style>{`
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .carousel-left  { animation: scrollLeft  28s linear infinite; display:flex; width:max-content; }
        .carousel-right { animation: scrollRight 24s linear infinite; display:flex; width:max-content; }
        .carousel-left:hover, .carousel-right:hover { animation-play-state: paused; }
      `}</style>
      {/* Row 1 — scrolls left */}
      <div className="carousel-left gap-8 mb-3">
        {doubled.map((l,i) => (
          <div key={i} className="flex-shrink-0 h-10 px-4 flex items-center">
            {l.url.endsWith('.svg') || l.url.includes('svg') ? (
              <img src={l.url} alt={l.name} className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity filter invert" style={{maxWidth:120}}/>
            ) : (
              <span className="text-slate-400 text-sm font-medium whitespace-nowrap px-3 py-1 border border-slate-700 rounded-full">{l.name}</span>
            )}
          </div>
        ))}
      </div>
      {/* Row 2 — scrolls right (reverse) */}
      <div className="carousel-right gap-8">
        {[...doubled].reverse().map((l,i) => (
          <div key={i} className="flex-shrink-0 h-10 px-4 flex items-center">
            {l.url.endsWith('.svg') || l.url.includes('svg') ? (
              <img src={l.url} alt={l.name} className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity filter invert" style={{maxWidth:120}}/>
            ) : (
              <span className="text-slate-400 text-xs font-medium whitespace-nowrap px-3 py-1 border border-slate-700/50 rounded-full">{l.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Article Card — AAIA-style ─────────────────────────────────────────────────
function ArticleCard({ article, onEdit, onDelete, canManage }: {
  article: OrgArticle; onEdit: () => void; onDelete: () => void; canManage: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
      {article.image_url && (
        <div className="h-44 overflow-hidden bg-slate-800">
          <img src={article.image_url} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              article.category==='event_report'?'bg-purple-900/50 text-purple-300 border border-purple-700/40':
              'bg-blue-900/50 text-blue-300 border border-blue-700/40'
            }`}>
              {article.category==='event_report'?'📸 Event Report':'📰 News'}
            </span>
            {article.featured && <span className="text-[10px] text-yellow-400 flex items-center gap-0.5"><Star size={9}/>Featured</span>}
          </div>
          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-blue-400 transition"><Edit3 size={12}/></button>
              <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-red-400 transition"><Trash2 size={12}/></button>
            </div>
          )}
        </div>
        <h3 className="text-white font-bold text-base mb-2 leading-snug">{article.title}</h3>
        <p className="text-slate-400 text-xs mb-3 leading-relaxed">{article.summary}</p>
        {article.body && (
          <div>
            {expanded && <p className="text-slate-300 text-xs leading-relaxed mb-3 border-t border-slate-800 pt-3">{article.body}</p>}
            <button onClick={()=>setExpanded(v=>!v)} className="text-xs text-blue-400 hover:text-blue-300 transition">
              {expanded ? '↑ Show less' : 'Read more →'}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
          <div className="text-slate-600 text-[10px]">{article.author} · {fmtDate(article.published_at)}</div>
        </div>
      </div>
    </article>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OrgNewsPage() {
  const { user, token } = useAuthStore();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin';
  const headers = { Authorization: `Bearer ${token}` };

  const [articles, setArticles] = useState<OrgArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<OrgArticle>|null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  // Logo carousel — pull uploaded SVGs from backend
  const [logos, setLogos] = useState<{name:string;url:string}[]>([]);

  const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const load = async () => {
    setLoading(true);
    try {
      // Fetch from Supabase via backend
      const r = await api.get('/org-news');
      setArticles(r.data || []);
    } catch {
      // Fallback to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('org_news') || '[]');
        setArticles(local);
      } catch { setArticles([]); }
    }
    // Load uploaded logos
    try {
      const lr = await api.get('/uploads/list', { headers });
      const svgFiles = (lr.data.files || []).filter((f:any) => f.filename.endsWith('.svg') && !f.filename.startsWith('app-icon'));
      setLogos(svgFiles.map((f:any) => ({ name: f.filename.replace(/\.[^.]+$/,'').replace(/-/g,' '), url: `${BACKEND}${f.url}` })));
    } catch { /* no logos yet */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (m:string) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };

  const saveArticle = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const article = { ...editing, slug: editing.slug || slugify(editing.title||''), published_at: editing.published_at || new Date().toISOString() };
    try {
      if (editing.id) {
        await api.put(`/org-news/${editing.id}`, article, { headers });
      } else {
        await api.post('/org-news', article, { headers });
      }
      flash('✅ Saved');
      setEditing(null);
      load();
    } catch {
      // Fallback: save to localStorage
      const local: OrgArticle[] = JSON.parse(localStorage.getItem('org_news')||'[]');
      if (editing.id) {
        const idx = local.findIndex(a=>a.id===editing.id);
        if (idx>=0) local[idx] = {...local[idx],...article} as OrgArticle;
      } else {
        local.unshift({...article, id:crypto.randomUUID(), published_at:new Date().toISOString()} as OrgArticle);
      }
      localStorage.setItem('org_news', JSON.stringify(local));
      setArticles(local);
      flash('✅ Saved locally');
      setEditing(null);
    }
    setSaving(false);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.delete(`/org-news/${id}`, { headers });
      load();
    } catch {
      const local: OrgArticle[] = JSON.parse(localStorage.getItem('org_news')||'[]').filter((a:OrgArticle)=>a.id!==id);
      localStorage.setItem('org_news', JSON.stringify(local));
      setArticles(prev=>prev.filter(a=>a.id!==id));
    }
  };

  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())
  );
  const featured = filtered.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#080c14]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-[#080c14] border-b border-slate-800 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Newsroom</p>
          <h1 className="text-4xl font-bold text-white mb-3">News & Updates</h1>
          <p className="text-slate-400 text-sm">Stories, announcements, and event reports from the SDG Nexus network</p>
        </div>
      </div>

      {/* Partner Logo Carousel */}
      {logos.length > 0 && <LogoCarousel logos={logos}/>}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search news…"
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
          </div>
          <div className="flex gap-2">
            <button onClick={load} disabled={loading} className="p-2 text-slate-500 hover:text-white border border-slate-800 rounded-xl transition">
              <RefreshCw size={14} className={loading?'animate-spin':''}/>
            </button>
            {canManage && (
              <button onClick={()=>setEditing({...BLANK})}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition">
                <Plus size={14}/>Add Article
              </button>
            )}
          </div>
        </div>

        {msg && <div className="bg-green-900/20 border border-green-700/40 rounded-xl px-4 py-2 text-green-300 text-xs">{msg}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <>
            {/* Featured article — full width */}
            {featured && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-slate-600 transition">
                {featured.image_url && (
                  <div className="md:w-2/5 h-56 md:h-auto overflow-hidden bg-slate-800 flex-shrink-0">
                    <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                )}
                <div className="p-7 flex flex-col justify-center">
                  <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><Star size={10}/>Featured Story</span>
                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{featured.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{featured.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-xs">{featured.author} · {fmtDate(featured.published_at)}</span>
                    {canManage && (
                      <div className="flex gap-2">
                        <button onClick={()=>setEditing({...featured})} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Edit3 size={11}/>Edit</button>
                        <button onClick={()=>deleteArticle(featured.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={11}/>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Article grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(a => (
                <ArticleCard key={a.id} article={a}
                  onEdit={()=>setEditing({...a})}
                  onDelete={()=>deleteArticle(a.id)}
                  canManage={canManage}/>
              ))}
              {filtered.length===0 && (
                <div className="col-span-3 text-center py-16 text-slate-500">
                  <p>No articles yet.{canManage&&' Click "Add Article" to publish the first one.'}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-bold">{editing.id ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={()=>setEditing(null)} className="text-slate-500 hover:text-white"><X size={16}/></button>
            </div>
            {[
              {f:'title',label:'Title *',placeholder:'Article title'},
              {f:'slug',label:'Slug (auto-generated)',placeholder:'url-slug'},
              {f:'author',label:'Author',placeholder:'Name or team'},
              {f:'image_url',label:'Image URL',placeholder:'https://...'},
            ].map(({f,label,placeholder})=>(
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1">{label}</label>
                <input value={(editing as any)[f]||''} placeholder={placeholder}
                  onChange={e=>setEditing(prev=>({...prev,[f]:f==='slug'?e.target.value:e.target.value,...(f==='title'&&!editing.id?{slug:slugify(e.target.value)}:{})}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-xs block mb-1">Summary</label>
              <textarea value={editing.summary||''} rows={2} onChange={e=>setEditing(prev=>({...prev,summary:e.target.value}))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"/>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Full Body (optional)</label>
              <textarea value={editing.body||''} rows={4} onChange={e=>setEditing(prev=>({...prev,body:e.target.value}))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Category</label>
                <select value={editing.category||'news'} onChange={e=>setEditing(prev=>({...prev,category:e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none">
                  <option value="news">📰 News</option>
                  <option value="event_report">📸 Event Report</option>
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.featured||false} onChange={e=>setEditing(prev=>({...prev,featured:e.target.checked}))}
                    className="w-4 h-4 rounded accent-blue-600"/>
                  <span className="text-slate-300 text-sm">Featured story</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveArticle} disabled={saving||!editing.title}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5">
                {saving?<RefreshCw size={13} className="animate-spin"/>:<Check size={13}/>}
                {saving?'Saving…':'Save Article'}
              </button>
              <button onClick={()=>setEditing(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
