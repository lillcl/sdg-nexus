// ResourcesPage v23 — Google Drive OAuth upload/browse + local resources
import { useState, useEffect, useRef } from 'react';
import { FileText, Search, Plus, Trash2, Edit3, X, Check, ExternalLink,
         Upload, FolderOpen, RefreshCw, Link2 } from 'lucide-react';
import { useAuthStore } from '@/store';

// ── Google Drive config ───────────────────────────────────────────────────────
const GDRIVE_CLIENT_ID = '472786393007-ic6g0d6li2v0klovvcn0j63c4tboltkt.apps.googleusercontent.com';
const GDRIVE_FOLDER_ID = '1LqKTS3azz4FXqkHcU6tka3v5kUJP8PDo';
const GDRIVE_SCOPE     = 'https://www.googleapis.com/auth/drive.file';
const GDRIVE_API       = 'https://www.googleapis.com/drive/v3';
const GDRIVE_UPLOAD    = 'https://www.googleapis.com/upload/drive/v3';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Resource {
  id: string; title: string; category: string; type: string;
  date: string; author: string; url: string; description: string;
  tags: string[]; source?: 'local' | 'gdrive';
  gdrive_id?: string;
}
interface GDriveFile {
  id: string; name: string; mimeType: string; webViewLink: string;
  modifiedTime: string; size?: string;
}

const CATEGORIES = ['All','MUN Materials','SDG Projects','Lesson Plans','Research','Data Sources','Guides'];
const DEFAULT_RESOURCES: Resource[] = [
  { id:'1', title:'UN Security Council Resolution Writing Guide', category:'MUN Materials', type:'Guide', date:'2026-02-15', author:'UN DPI', url:'https://www.un.org/en/model-united-nations/', description:'Comprehensive guide to writing effective Security Council resolutions.', tags:['MUN','Resolution'], source:'local' },
  { id:'2', title:'SDG Goal 13: Climate Action Project Ideas', category:'SDG Projects', type:'Project Bank', date:'2026-02-20', author:'SDSN Youth', url:'https://www.unsdsn.org', description:'25 hands-on project ideas for students to take climate action.', tags:['SDG 13','Climate'], source:'local' },
  { id:'3', title:'Interactive Geography Lesson Plan', category:'Lesson Plans', type:'Lesson', date:'2026-03-01', author:'UNESCO', url:'https://www.unesco.org/en/education', description:'8-week curriculum for teaching world geography through games.', tags:['Geography','K-12'], source:'local' },
  { id:'4', title:'SDSN SDR 2025 Full Report', category:'Research', type:'Report', date:'2025-06-01', author:'SDSN', url:'https://dashboards.sdgindex.org', description:'Complete Sustainable Development Report 2025 with 193 countries.', tags:['SDR 2025','Data'], source:'local' },
  { id:'5', title:'SDG Indicator Framework', category:'Data Sources', type:'Reference', date:'2026-01-01', author:'UN Statistics Division', url:'https://unstats.un.org/sdgs/indicators/', description:'Official global indicator framework for the 17 SDGs.', tags:['Indicators','Official'], source:'local' },
];

function uid() { return Math.random().toString(36).slice(2); }
function load<T>(k: string, d: T): T { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } }
function save(k: string, v: any) { localStorage.setItem(k, JSON.stringify(v)); }
const BLANK: Resource = { id:'', title:'', category:'SDG Projects', type:'Guide', date:'', author:'', url:'', description:'', tags:[], source:'local' };

// ── Google OAuth helper ───────────────────────────────────────────────────────
function useGoogleAuth() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('gdrive_token'));
  const [loading, setLoading] = useState(false);

  const signIn = () => {
    setLoading(true);
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: GDRIVE_CLIENT_ID,
      redirect_uri: window.location.origin + '/resources',
      response_type: 'token',
      scope: GDRIVE_SCOPE,
      include_granted_scopes: 'true',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const signOut = () => {
    sessionStorage.removeItem('gdrive_token');
    setToken(null);
  };

  // Handle OAuth callback (hash fragment)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.slice(1));
      const t = params.get('access_token');
      if (t) {
        sessionStorage.setItem('gdrive_token', t);
        setToken(t);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    setLoading(false);
  }, []);

  return { token, loading, signIn, signOut };
}

// ── Google Drive API helpers ──────────────────────────────────────────────────
async function gdriveListFiles(token: string): Promise<GDriveFile[]> {
  const q = encodeURIComponent(`'${GDRIVE_FOLDER_ID}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,webViewLink,modifiedTime,size)');
  const res = await fetch(`${GDRIVE_API}/files?q=${q}&fields=${fields}&pageSize=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  const data = await res.json();
  return data.files || [];
}

async function gdriveUploadFile(token: string, file: File): Promise<GDriveFile> {
  // 1. Create metadata
  const meta = JSON.stringify({ name: file.name, parents: [GDRIVE_FOLDER_ID] });
  const form = new FormData();
  form.append('metadata', new Blob([meta], { type: 'application/json' }));
  form.append('file', file);
  const res = await fetch(`${GDRIVE_UPLOAD}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

async function gdriveDeleteFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`${GDRIVE_API}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
}

function mimeIcon(mime: string) {
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '📊';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return '📈';
  if (mime.includes('document') || mime.includes('word')) return '📝';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('video')) return '🎬';
  return '📁';
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin' || user?.role === 'admin';
  const { token: gToken, loading: gLoading, signIn: gSignIn, signOut: gSignOut } = useGoogleAuth();

  const [resources, setResources] = useState<Resource[]>(() => load('resources', DEFAULT_RESOURCES));
  const [driveFiles, setDriveFiles] = useState<GDriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [tab, setTab] = useState<'local' | 'drive'>('local');
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch Drive files when token available
  useEffect(() => {
    if (gToken && tab === 'drive') fetchDriveFiles();
  }, [gToken, tab]);

  const fetchDriveFiles = async () => {
    if (!gToken) return;
    setDriveLoading(true); setDriveError('');
    try { setDriveFiles(await gdriveListFiles(gToken)); }
    catch (e: any) { setDriveError(e.message); }
    setDriveLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !gToken) return;
    setUploading(true); setUploadError('');
    try {
      const gf = await gdriveUploadFile(gToken, file);
      setDriveFiles(prev => [gf, ...prev]);
      // Also add as local resource card
      const r: Resource = { id: uid(), title: file.name, category: 'SDG Projects', type: 'File', date: new Date().toISOString().slice(0,10), author: user?.email || '', url: gf.webViewLink, description: `Uploaded to Google Drive`, tags: [], source: 'gdrive', gdrive_id: gf.id };
      setResources(prev => { const next = [...prev, r]; save('resources', next); return next; });
    } catch (e: any) { setUploadError(e.message); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDeleteDrive = async (fileId: string) => {
    if (!gToken || !confirm('Delete from Google Drive?')) return;
    try {
      await gdriveDeleteFile(gToken, fileId);
      setDriveFiles(prev => prev.filter(f => f.id !== fileId));
      setResources(prev => { const next = prev.filter(r => r.gdrive_id !== fileId); save('resources', next); return next; });
    } catch (e: any) { alert(e.message); }
  };

  const saveAll = () => { save('resources', resources); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const del = (id: string) => setResources(prev => { const next = prev.filter(r => r.id !== id); save('resources', next); return next; });
  const openEdit = (r?: Resource) => setEditing(r ? {...r} : {...BLANK, id: uid()});
  const saveEdit = () => {
    if (!editing) return;
    setResources(prev => {
      const next = prev.find(r => r.id === editing.id) ? prev.map(r => r.id === editing.id ? editing : r) : [...prev, editing];
      save('resources', next); return next;
    });
    setEditing(null);
  };

  const filtered = resources.filter(r => {
    const matchCat = cat === 'All' || r.category === cat;
    const q = search.toLowerCase();
    return matchCat && (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  });

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-blue-400"/>SDG Resources
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Guides, lesson plans, data sources and research</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Google Drive auth */}
            {isSuperadmin && (
              gToken ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                    {uploading ? <RefreshCw size={12} className="animate-spin"/> : <Upload size={12}/>}
                    {uploading ? 'Uploading…' : 'Upload to Drive'}
                  </button>
                  <button onClick={gSignOut} className="px-2 py-2 text-slate-500 hover:text-white text-xs border border-slate-700 rounded-xl">Disconnect Drive</button>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}/>
                </div>
              ) : (
                <button onClick={gSignIn} className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold">
                  <Link2 size={12}/> Connect Google Drive
                </button>
              )
            )}
            {isSuperadmin && editMode && (
              <>
                <button onClick={() => openEdit()} className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"><Plus size={12}/>Add Resource</button>
                <button onClick={saveAll} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition ${saved?'bg-green-600 text-white':'bg-slate-800 border border-slate-600 text-slate-300'}`}><Check size={12}/>{saved?'Saved!':'Save'}</button>
              </>
            )}
            {isSuperadmin && (
              <button onClick={() => setEditMode(e => !e)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs border transition ${editMode?'border-red-700 text-red-400':'border-slate-700 text-slate-400 hover:text-white'}`}>
                {editMode ? <><X size={12}/>Exit</> : <><Edit3 size={12}/>Edit</>}
              </button>
            )}
          </div>
        </div>

        {/* Upload error */}
        {uploadError && <div className="mb-4 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-2 text-red-400 text-xs">{uploadError}</div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit mb-5">
          <button onClick={()=>setTab('local')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${tab==='local'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>
            📚 Local Resources
          </button>
          <button onClick={()=>setTab('drive')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${tab==='drive'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>
            ☁️ Google Drive {driveFiles.length > 0 && `(${driveFiles.length})`}
          </button>
        </div>

        {tab === 'local' && (
          <>
            {/* Search + filter */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources…"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
              </div>
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={()=>setCat(c)} className={`px-2.5 py-1.5 text-xs rounded-lg border transition ${cat===c?'bg-blue-600/20 border-blue-600/50 text-blue-300':'border-slate-800 text-slate-500 hover:text-slate-300'}`}>{c}</button>
                ))}
              </div>
            </div>

            {/* Resource cards */}
            <div className="space-y-3">
              {filtered.length === 0 && <p className="text-slate-500 text-sm py-8 text-center">No resources found.</p>}
              {filtered.map(r => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{r.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full text-blue-300 bg-blue-900/30 border border-blue-800/40">{r.category}</span>
                        {r.source === 'gdrive' && <span className="text-xs px-2 py-0.5 rounded-full text-green-300 bg-green-900/30 border border-green-800/40">☁️ Drive</span>}
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{r.title}</h3>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{r.author}</span>
                        {r.date && <span>{r.date}</span>}
                        {r.tags.map(t => <span key={t} className="text-slate-600">#{t}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-400 transition"><ExternalLink size={14}/></a>}
                      {editMode && (
                        <>
                          <button onClick={()=>openEdit(r)} className="p-2 text-slate-500 hover:text-blue-400 transition"><Edit3 size={14}/></button>
                          <button onClick={()=>del(r.id)} className="p-2 text-slate-500 hover:text-red-400 transition"><Trash2 size={14}/></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'drive' && (
          <div className="space-y-4">
            {!gToken ? (
              <div className="text-center py-16">
                <FolderOpen size={48} className="text-slate-700 mx-auto mb-4"/>
                <h3 className="text-white font-semibold mb-2">Connect Google Drive</h3>
                <p className="text-slate-500 text-sm mb-5">Sign in with Google to view and upload files from the shared Drive folder.</p>
                {isSuperadmin && (
                  <button onClick={gSignIn} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto">
                    <Link2 size={16}/> Connect Google Drive
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Files in shared folder</p>
                  <button onClick={fetchDriveFiles} disabled={driveLoading} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition">
                    <RefreshCw size={12} className={driveLoading?'animate-spin':''}/> Refresh
                  </button>
                </div>
                {driveError && <div className="bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-2 text-red-400 text-xs">{driveError}</div>}
                {driveLoading ? (
                  <div className="text-center py-12 text-slate-500"><RefreshCw size={24} className="animate-spin mx-auto mb-2"/>Loading Drive files…</div>
                ) : driveFiles.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FolderOpen size={40} className="mx-auto mb-3 opacity-30"/>
                    <p>No files in this folder yet.</p>
                    {isSuperadmin && <p className="text-xs mt-1">Upload files using the button above.</p>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driveFiles.map(f => (
                      <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition">
                        <span className="text-2xl flex-shrink-0">{mimeIcon(f.mimeType)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{f.name}</div>
                          <div className="text-slate-500 text-xs">{new Date(f.modifiedTime).toLocaleDateString()} {f.size ? `· ${Math.round(Number(f.size)/1024)}KB` : ''}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-blue-400 transition" title="Open in Drive">
                            <ExternalLink size={14}/>
                          </a>
                          {isSuperadmin && (
                            <button onClick={()=>handleDeleteDrive(f.id)} className="p-2 text-slate-500 hover:text-red-400 transition" title="Delete from Drive">
                              <Trash2 size={14}/>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0a1525] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-bold">{editing.id && resources.find(r=>r.id===editing.id) ? 'Edit' : 'Add'} Resource</h3>
            {(['title','author','url','description'] as const).map(f => (
              <div key={f}>
                <label className="text-slate-400 text-xs block mb-1 capitalize">{f}</label>
                {f==='description'
                  ? <textarea value={editing[f]} onChange={e=>setEditing({...editing,[f]:e.target.value})} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none resize-none"/>
                  : <input value={editing[f]} onChange={e=>setEditing({...editing,[f]:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Category</label>
                <select value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none">
                  {CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Type</label>
                <input value={editing.type} onChange={e=>setEditing({...editing,type:e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Tags (comma-separated)</label>
              <input value={editing.tags.join(',')} onChange={e=>setEditing({...editing,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold">Save</button>
              <button onClick={()=>setEditing(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
