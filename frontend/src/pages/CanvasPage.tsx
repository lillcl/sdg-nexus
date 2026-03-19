// CanvasPage v22 — rich doc editor, graph templates (brainstorm/spider/5W1H), improved canvas
import { useState, useRef, useEffect, useCallback } from 'react';
import { Square, Circle, Type, Minus, ArrowRight, Trash2, Download,
  RotateCcw, Send, Bot, ZoomIn, ZoomOut, Move, PenLine,
  LayoutTemplate, StickyNote, AlignLeft, Bold, Underline,
  AlignCenter, AlignJustify, ChevronDown, Network, Grid3x3 } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';

type Tool = 'select'|'rect'|'circle'|'text'|'line'|'arrow'|'sticky';
type Mode = 'canvas'|'document';

interface CanvasElement {
  id: string; type: Tool;
  x: number; y: number; w: number; h: number;
  text?: string; color: string; bgColor: string;
  fontSize?: number; isSticky?: boolean;
  x2?: number; y2?: number; bold?: boolean; underline?: boolean;
}
interface ChatMsg { role:'user'|'assistant'; text: string; }

const SDGS = ['SDG 1: No Poverty','SDG 2: Zero Hunger','SDG 3: Good Health','SDG 4: Quality Education','SDG 5: Gender Equality','SDG 6: Clean Water','SDG 7: Clean Energy','SDG 8: Decent Work','SDG 13: Climate Action','SDG 14: Life Below Water','SDG 15: Life on Land','SDG 16: Peace & Justice'];
const COLORS = ['#1e3a5f','#235390','#E5243B','#4C9F38','#26BDE2','#FCC30B','#A21942','#3F7E44','#0f2540','#374151','#ffffff','#000000'];
const STICKY_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff','#fed7aa'];

// ── Canvas templates ──────────────────────────────────────────────────────────
const CANVAS_TEMPLATES: Record<string,Partial<CanvasElement>[]> = {
  'Business Model Canvas': [
    {type:'rect',x:20,y:20,w:160,h:220,bgColor:'#1e3a5f',color:'#ffffff',text:'Key Partners'},
    {type:'rect',x:200,y:20,w:160,h:100,bgColor:'#1e3a5f',color:'#ffffff',text:'Key Activities'},
    {type:'rect',x:200,y:140,w:160,h:100,bgColor:'#1e3a5f',color:'#ffffff',text:'Key Resources'},
    {type:'rect',x:380,y:20,w:200,h:220,bgColor:'#235390',color:'#ffffff',text:'Value Proposition'},
    {type:'rect',x:600,y:20,w:160,h:100,bgColor:'#1e3a5f',color:'#ffffff',text:'Channels'},
    {type:'rect',x:600,y:140,w:160,h:100,bgColor:'#1e3a5f',color:'#ffffff',text:'Customer Relations'},
    {type:'rect',x:780,y:20,w:180,h:220,bgColor:'#1e3a5f',color:'#ffffff',text:'Customer Segments'},
    {type:'rect',x:20,y:260,w:470,h:80,bgColor:'#0f2540',color:'#ffffff',text:'Cost Structure'},
    {type:'rect',x:510,y:260,w:450,h:80,bgColor:'#0f2540',color:'#ffffff',text:'Revenue Streams'},
  ],
  'SDG Project Plan': [
    {type:'rect',x:20,y:20,w:180,h:80,bgColor:'#E5243B',color:'#ffffff',text:'🎯 Problem'},
    {type:'rect',x:220,y:20,w:180,h:80,bgColor:'#4C9F38',color:'#ffffff',text:'✅ SDG Target'},
    {type:'rect',x:420,y:20,w:180,h:80,bgColor:'#26BDE2',color:'#ffffff',text:'💡 Solution'},
    {type:'rect',x:620,y:20,w:180,h:80,bgColor:'#FCC30B',color:'#1a1a2e',text:'📊 Impact'},
    {type:'rect',x:20,y:130,w:380,h:120,bgColor:'#1e2d42',color:'#e2e8f0',text:'👥 Stakeholders'},
    {type:'rect',x:420,y:130,w:380,h:120,bgColor:'#1e2d42',color:'#e2e8f0',text:'🗓️ Timeline'},
    {type:'rect',x:20,y:280,w:780,h:60,bgColor:'#0f172a',color:'#94a3b8',text:'🌍 SDG Alignment'},
  ],
};

// ── Graph templates (3×3 grid max, built programmatically) ────────────────────
function buildBrainstorm(cx=400, cy=300): Partial<CanvasElement>[] {
  const els: Partial<CanvasElement>[] = [
    {type:'circle',x:cx-70,y:cy-40,w:140,h:80,bgColor:'#3b82f6',color:'#fff',text:'Main Idea',fontSize:14,bold:true},
  ];
  const branches = ['Cause 1','Cause 2','Cause 3','Effect 1','Effect 2','Effect 3','Factor A','Factor B'];
  const angles = branches.map((_,i)=>(i/branches.length)*Math.PI*2);
  angles.forEach((a,i)=>{
    const bx = cx + Math.cos(a)*200 - 65;
    const by = cy + Math.sin(a)*160 - 35;
    els.push({type:'rect',x:bx,y:by,w:130,h:70,bgColor:'#1e3a5f',color:'#e2e8f0',text:branches[i],fontSize:12});
  });
  return els;
}

function build5W1H(): Partial<CanvasElement>[] {
  const headers=['WHO?','WHAT?','WHERE?','WHEN?','WHY?','HOW?'];
  const colors=['#E5243B','#26BDE2','#4C9F38','#FCC30B','#A21942','#0A97D9'];
  return headers.flatMap((h,i)=>[
    {type:'rect',x:20+i*175,y:20,w:155,h:50,bgColor:colors[i],color:'#fff',text:h,fontSize:14,bold:true} as Partial<CanvasElement>,
    {type:'rect',x:20+i*175,y:90,w:155,h:180,bgColor:'#1e2d42',color:'#e2e8f0',text:'Add details...',fontSize:11} as Partial<CanvasElement>,
  ]);
}

function buildSpiderGraph(): Partial<CanvasElement>[] {
  const cx=420, cy=250;
  const topics=['Economic','Social','Environmental','Governance','Technology','Culture'];
  const els: Partial<CanvasElement>[] = [
    {type:'circle',x:cx-60,y:cy-60,w:120,h:120,bgColor:'#235390',color:'#fff',text:'SDG Topic',fontSize:12,bold:true},
  ];
  topics.forEach((t,i)=>{
    const a=(i/topics.length)*Math.PI*2-Math.PI/2;
    const bx=cx+Math.cos(a)*220-75;
    const by=cy+Math.sin(a)*170-35;
    els.push({type:'rect',x:bx,y:by,w:150,h:70,bgColor:'#1e3a5f',color:'#e2e8f0',text:t,fontSize:11});
  });
  return els;
}

const GRAPH_TEMPLATES: Record<string,{label:string;icon:string;build:()=>Partial<CanvasElement>[]}> = {
  brainstorm: { label:'Brainstorm Map', icon:'🧠', build: ()=>buildBrainstorm() },
  spider:     { label:'Spider Diagram', icon:'🕸️', build: ()=>buildSpiderGraph() },
  '5w1h':     { label:'5W1H Analysis', icon:'❓', build: ()=>build5W1H() },
};

function uid() { return Math.random().toString(36).slice(2,9); }

// ── Document editor with formatting toolbar ───────────────────────────────────
function DocEditor({ content, onChange }: { content: string; onChange: (v:string)=>void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content.replace(/\n/g,'<br/>');
    }
  }, []);

  const fontSizes = [10,12,14,16,18,20,24,28,32,36];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0e1520]">
      {/* Formatting toolbar */}
      <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-[#0a1018] border-b border-slate-800 flex-wrap">
        <button onMouseDown={e=>{e.preventDefault();exec('bold');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Bold"><Bold size={14}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('italic');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition italic text-sm font-serif" title="Italic">I</button>
        <button onMouseDown={e=>{e.preventDefault();exec('underline');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Underline"><Underline size={14}/></button>
        <div className="w-px h-5 bg-slate-700 mx-1"/>
        <select onChange={e=>exec('fontSize',e.target.value)} defaultValue="3"
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1 focus:outline-none cursor-pointer">
          {[1,2,3,4,5,6,7].map(s=><option key={s} value={s}>{[8,10,12,14,18,24,36][s-1]}px</option>)}
        </select>
        <div className="w-px h-5 bg-slate-700 mx-1"/>
        <button onMouseDown={e=>{e.preventDefault();exec('justifyLeft');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white" title="Left"><AlignLeft size={14}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('justifyCenter');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white" title="Center"><AlignCenter size={14}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('justifyFull');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white" title="Justify"><AlignJustify size={14}/></button>
        <div className="w-px h-5 bg-slate-700 mx-1"/>
        <button onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono" title="Bullet List">• list</button>
        <button onMouseDown={e=>{e.preventDefault();exec('insertOrderedList');}} className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono" title="Numbered List">1. list</button>
        <div className="w-px h-5 bg-slate-700 mx-1"/>
        <select onChange={e=>{exec('formatBlock',e.target.value);}} defaultValue="p"
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1 focus:outline-none cursor-pointer">
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="pre">Code</option>
        </select>
        <div className="w-px h-5 bg-slate-700 mx-1"/>
        {/* Text colour */}
        <div className="relative flex items-center gap-1">
          <span className="text-slate-500 text-xs">A</span>
          <input type="color" defaultValue="#ffffff" onChange={e=>exec('foreColor',e.target.value)}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0" title="Text color"/>
        </div>
        <div className="relative flex items-center gap-1">
          <span className="text-slate-500 text-xs">bg</span>
          <input type="color" defaultValue="#1e3a5f" onChange={e=>exec('hiliteColor',e.target.value)}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0" title="Highlight"/>
        </div>
      </div>

      {/* Document area with border styling */}
      <div className="flex-1 overflow-auto bg-slate-700 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-sm min-h-[792px]"
          style={{boxShadow:'0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px #334155'}}>
          {/* Page header decoration */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-t-sm"/>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e=>onChange((e.target as HTMLDivElement).innerHTML)}
            className="min-h-[750px] p-12 text-gray-900 text-sm leading-relaxed focus:outline-none"
            style={{fontFamily:'Georgia, serif'}}
            data-placeholder="Start writing your document..."
          />
          {/* Page footer decoration */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-b-sm"/>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CanvasPage() {
  const { user, token } = useAuthStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('canvas');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selected, setSelected] = useState<string|null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [preview, setPreview] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [editingText, setEditingText] = useState<string|null>(null);
  const [bgColor, setBgColor] = useState('#235390');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGraphTemplates, setShowGraphTemplates] = useState(false);
  // User can have up to 9 saved graph templates (3×3)
  const [savedGraphTemplates, setSavedGraphTemplates] = useState<{key:string;label:string;icon:string}[]>([]);
  const [docContent, setDocContent] = useState('');

  const historyRef = useRef<CanvasElement[][]>([[]]); const historyIdx = useRef(0);
  const pushHistory = useCallback((els: CanvasElement[]) => {
    const h=historyRef.current.slice(0,historyIdx.current+1); h.push([...els]);
    historyRef.current=h.slice(-30); historyIdx.current=historyRef.current.length-1;
  },[]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([{role:'assistant',text:'Hi! I\'m your SDG Prototype Coach 🌍\n\nTry:\n• "Give me 3 ideas for SDG 13"\n• "Review my canvas"\n• "Structure tips"'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sdgFocus, setSdgFocus] = useState('SDG 13: Climate Action');
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth'});},[chatMsgs]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();if(historyIdx.current>0){historyIdx.current--;setElements([...historyRef.current[historyIdx.current]]);setSelected(null);}}
      if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();if(historyIdx.current<historyRef.current.length-1){historyIdx.current++;setElements([...historyRef.current[historyIdx.current]]);}}
      if((e.key==='Delete'||e.key==='Backspace')&&selected&&document.activeElement===document.body){setElements(p=>{const n=p.filter(el=>el.id!==selected);pushHistory(n);return n;});setSelected(null);}
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[selected,pushHistory]);

  const getPos=(e:React.MouseEvent)=>{const r=canvasRef.current!.getBoundingClientRect();return{x:(e.clientX-r.left-pan.x)/zoom,y:(e.clientY-r.top-pan.y)/zoom};};

  const handleMouseDown=(e:React.MouseEvent)=>{if(tool==='select')return;const pos=getPos(e);setStartPt(pos);setDrawing(true);setSelected(null);};
  const handleMouseMove=(e:React.MouseEvent)=>{if(!drawing||tool==='select')return;const pos=getPos(e);setPreview({x:Math.min(pos.x,startPt.x),y:Math.min(pos.y,startPt.y),w:Math.abs(pos.x-startPt.x),h:Math.abs(pos.y-startPt.y)});};
  const handleMouseUp=(e:React.MouseEvent)=>{
    if(!drawing)return;setDrawing(false);setPreview(null);
    const pos=getPos(e);const w=Math.abs(pos.x-startPt.x);const h=Math.abs(pos.y-startPt.y);const x=Math.min(pos.x,startPt.x);const y=Math.min(pos.y,startPt.y);
    if(tool==='sticky'){const el:CanvasElement={id:uid(),type:'sticky',x:pos.x,y:pos.y,w:160,h:120,text:'Note...',color:'#1a1a2e',bgColor:STICKY_COLORS[Math.floor(Math.random()*STICKY_COLORS.length)],isSticky:true,fontSize:12};setElements(p=>{const n=[...p,el];pushHistory(n);return n;});setEditingText(el.id);return;}
    if(tool==='text'){const el:CanvasElement={id:uid(),type:'text',x:pos.x,y:pos.y,w:200,h:40,text:'Label',color:fgColor,bgColor:'transparent',fontSize:14};setElements(p=>{const n=[...p,el];pushHistory(n);return n;});setEditingText(el.id);return;}
    if(w<5&&h<5)return;
    const el:CanvasElement={id:uid(),type:tool,x,y,w:Math.max(w,60),h:Math.max(h,40),color:fgColor,bgColor,text:tool==='line'||tool==='arrow'?undefined:'Label',...(tool==='line'||tool==='arrow'?{x2:pos.x,y2:pos.y}:{})};
    setElements(p=>{const n=[...p,el];pushHistory(n);return n;});setSelected(el.id);
  };

  const applyCanvasTemplate=(name:string)=>{
    const tmpl=CANVAS_TEMPLATES[name];if(!tmpl)return;
    pushHistory(elements);
    setElements(tmpl.map(t=>({id:uid(),type:t.type||'rect',x:t.x||0,y:t.y||0,w:t.w||120,h:t.h||60,text:t.text||'',color:t.color||'#ffffff',bgColor:t.bgColor||bgColor,fontSize:13} as CanvasElement)));
    setShowTemplates(false);
  };

  const applyGraphTemplate=(key:string)=>{
    const tmpl=GRAPH_TEMPLATES[key];if(!tmpl)return;
    const built=tmpl.build();
    const newEls=built.map(t=>({id:uid(),type:(t.type||'rect') as Tool,x:t.x||0,y:t.y||0,w:t.w||120,h:t.h||60,text:t.text||'',color:t.color||'#ffffff',bgColor:t.bgColor||bgColor,fontSize:t.fontSize||13,...(t.bold?{bold:true}:{})} as CanvasElement));
    pushHistory(elements);setElements(p=>[...p,...newEls]);setShowGraphTemplates(false);
  };

  const addGraphToSaved=(key:string)=>{
    if(savedGraphTemplates.length>=9){alert('Maximum 9 templates (3×3)');return;}
    const t=GRAPH_TEMPLATES[key];
    if(!savedGraphTemplates.find(s=>s.key===key))
      setSavedGraphTemplates(p=>[...p,{key,label:t.label,icon:t.icon}]);
  };

  const deleteSelected=()=>{if(selected){setElements(p=>{const n=p.filter(e=>e.id!==selected);pushHistory(n);return n;});setSelected(null);}};

  const sendChat=async()=>{
    if(!chatInput.trim()||chatLoading)return;
    const msg=chatInput.trim();setChatInput('');setChatMsgs(p=>[...p,{role:'user',text:msg}]);setChatLoading(true);
    try{
      const summary=elements.length>0?`Canvas: ${elements.length} shapes: ${elements.filter(e=>e.text).map(e=>e.text?.slice(0,15)).slice(0,5).join(', ')}`:'empty canvas';
      const r=await api.post('/ai/chat',{prompt:msg,system:`SDG Prototype Coach. Student working on ${sdgFocus}. ${summary}. Give concise practical advice under 120 words.`},{headers:token?{Authorization:`Bearer ${token}`}:{}});
      setChatMsgs(p=>[...p,{role:'assistant',text:r.data?.text||'Let me help!'}]);
    }catch{setChatMsgs(p=>[...p,{role:'assistant',text:'AI offline. Tip: Start with a Problem box, then add Solution and Impact connected by arrows!'}]);}
    setChatLoading(false);
  };

  const exportSVG=()=>{
    const svgEl=elements.map(el=>{
      if(el.type==='rect'||el.type==='sticky')return`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.bgColor}" rx="${el.isSticky?4:8}"/>\n<text x="${el.x+el.w/2}" y="${el.y+el.h/2+5}" text-anchor="middle" fill="${el.color}" font-size="${el.fontSize||13}">${el.text||''}</text>`;
      if(el.type==='circle')return`<ellipse cx="${el.x+el.w/2}" cy="${el.y+el.h/2}" rx="${el.w/2}" ry="${el.h/2}" fill="${el.bgColor}"/><text x="${el.x+el.w/2}" y="${el.y+el.h/2+5}" text-anchor="middle" fill="${el.color}" font-size="13">${el.text||''}</text>`;
      return'';
    }).join('\n');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" style="background:#080c14">\n${svgEl}\n</svg>`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));a.download='prototype.svg';a.click();
  };

  const sel=elements.find(e=>e.id===selected);
  const TOOLS=[
    {id:'select' as Tool,icon:<Move size={15}/>,label:'Select'},
    {id:'rect' as Tool,icon:<Square size={15}/>,label:'Box'},
    {id:'circle' as Tool,icon:<Circle size={15}/>,label:'Circle'},
    {id:'text' as Tool,icon:<Type size={15}/>,label:'Text'},
    {id:'sticky' as Tool,icon:<StickyNote size={15}/>,label:'Sticky'},
    {id:'line' as Tool,icon:<Minus size={15}/>,label:'Line'},
    {id:'arrow' as Tool,icon:<ArrowRight size={15}/>,label:'Arrow'},
  ];

  return (
    <div className="h-screen bg-[#080c14] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-[#040810] border-b border-slate-800 px-3 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-white font-bold text-sm flex items-center gap-1.5 flex-shrink-0"><PenLine size={14} className="text-blue-400"/>Canvas</span>
        <div className="w-px h-5 bg-slate-800 flex-shrink-0"/>
        {/* Mode */}
        <div className="flex bg-slate-800/60 rounded-lg p-0.5">
          <button onClick={()=>setMode('canvas')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${mode==='canvas'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>Canvas</button>
          <button onClick={()=>setMode('document')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${mode==='document'?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}><AlignLeft size={11}/>Doc</button>
        </div>

        {mode==='canvas' && <>
          <div className="w-px h-5 bg-slate-800 flex-shrink-0"/>
          <div className="flex items-center gap-0.5">
            {TOOLS.map(t=>(<button key={t.id} onClick={()=>setTool(t.id)} title={t.label} className={`p-1.5 rounded-lg transition-all ${tool===t.id?'bg-blue-600 text-white':t.id==='sticky'?'text-yellow-400 hover:bg-yellow-900/20':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{t.icon}</button>))}
          </div>
          <div className="w-px h-5 bg-slate-800 flex-shrink-0"/>
          <div className="flex items-center gap-1.5">
            <div className="relative"><div className="w-6 h-6 rounded border-2 border-slate-600 cursor-pointer" style={{background:bgColor}}/><input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-6 h-6" title="Fill color"/></div>
            <div className="relative"><div className="w-6 h-6 rounded border-2 border-slate-600 cursor-pointer" style={{background:fgColor}}/><input type="color" value={fgColor} onChange={e=>setFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-6 h-6" title="Text color"/></div>
          </div>
          {/* Canvas templates */}
          <div className="relative">
            <button onClick={()=>{setShowTemplates(o=>!o);setShowGraphTemplates(false);}} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700">
              <LayoutTemplate size={12}/>Templates
            </button>
            {showTemplates&&(
              <div className="absolute top-full left-0 mt-1 z-50 bg-[#0a1525] border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[200px]">
                {Object.keys(CANVAS_TEMPLATES).map(n=>(<button key={n} onClick={()=>applyCanvasTemplate(n)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white">{n}</button>))}
              </div>
            )}
          </div>
          {/* Graph templates */}
          <div className="relative">
            <button onClick={()=>{setShowGraphTemplates(o=>!o);setShowTemplates(false);}} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700">
              <Network size={12}/>Graphs
            </button>
            {showGraphTemplates&&(
              <div className="absolute top-full left-0 mt-1 z-50 bg-[#0a1525] border border-slate-700 rounded-xl shadow-2xl py-2 w-72">
                <p className="text-[10px] text-slate-500 px-3 mb-2">Click to insert • ⭐ to save (max 9)</p>
                {Object.entries(GRAPH_TEMPLATES).map(([key,t])=>(
                  <div key={key} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 group">
                    <button onClick={()=>applyGraphTemplate(key)} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white flex-1 text-left">
                      <span className="text-lg">{t.icon}</span>{t.label}
                    </button>
                    <button onClick={()=>addGraphToSaved(key)} title="Save to panel (max 9)" className="text-[10px] text-slate-600 group-hover:text-yellow-400 px-1.5 py-0.5 hover:bg-slate-700 rounded">⭐ save</button>
                  </div>
                ))}
                {savedGraphTemplates.length>0&&<>
                  <div className="border-t border-slate-800 mt-2 pt-2 px-3">
                    <p className="text-[10px] text-slate-500 mb-2">Saved ({savedGraphTemplates.length}/9):</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {savedGraphTemplates.map(s=>(
                        <button key={s.key} onClick={()=>applyGraphTemplate(s.key)}
                          className="aspect-square bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 text-center p-1 border border-slate-700 hover:border-blue-600 transition">
                          <span className="text-xl">{s.icon}</span>
                          <span className="text-[9px] text-slate-400 leading-tight">{s.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>}
              </div>
            )}
          </div>
        </>}

        <select value={sdgFocus} onChange={e=>setSdgFocus(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none hidden md:block ml-1">
          {SDGS.map(s=><option key={s}>{s}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          {mode==='canvas'&&<>
            <button onClick={()=>setZoom(z=>Math.max(0.3,z-0.1))} className="p-1.5 text-slate-400 hover:text-white"><ZoomOut size={13}/></button>
            <span className="text-slate-500 text-xs w-9 text-center">{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(2.5,z+0.1))} className="p-1.5 text-slate-400 hover:text-white"><ZoomIn size={13}/></button>
            <button onClick={()=>{if(historyIdx.current>0){historyIdx.current--;setElements([...historyRef.current[historyIdx.current]]);setSelected(null);}}} className="p-1.5 text-slate-400 hover:text-white"><RotateCcw size={13}/></button>
            {selected&&<button onClick={deleteSelected} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 size={13}/></button>}
            <button onClick={exportSVG} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg hidden md:flex"><Download size={11}/>SVG</button>
          </>}
          {mode==='document'&&(
            <button onClick={()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([docContent],{type:'text/html'}));a.download='project-doc.html';a.click();}} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"><Download size={11}/>Export</button>
          )}
          <button onClick={()=>setChatOpen(o=>!o)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${chatOpen?'bg-green-600 text-white':'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'}`}>
            <Bot size={12}/>AI
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {mode==='document' ? (
          <DocEditor content={docContent} onChange={setDocContent}/>
        ) : (
          <div ref={canvasRef} className="flex-1 relative overflow-hidden"
            style={{cursor:tool==='select'?'default':'crosshair',background:'#0d1117'}}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
              <defs><pattern id="grid" width={20*zoom} height={20*zoom} patternUnits="userSpaceOnUse" x={pan.x%(20*zoom)} y={pan.y%(20*zoom)}>
                <path d={`M ${20*zoom} 0 L 0 0 0 ${20*zoom}`} fill="none" stroke="#334155" strokeWidth="0.5"/>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
            <div style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,transformOrigin:'0 0',position:'absolute',inset:0}}>
              {elements.map(el=>(<ElementView key={el.id} el={el} isSelected={selected===el.id} isEditingText={editingText===el.id}
                onSelect={()=>{if(tool==='select')setSelected(el.id);}} onTextChange={t=>setElements(p=>p.map(e=>e.id===el.id?{...e,text:t}:e))}
                onTextBlur={()=>setEditingText(null)} onDoubleClick={()=>setEditingText(el.id)}
                onDrag={(dx,dy)=>setElements(p=>p.map(e=>e.id===el.id?{...e,x:e.x+dx,y:e.y+dy}:e))}
                onResize={(dw,dh)=>setElements(p=>p.map(e=>e.id===el.id?{...e,w:Math.max(40,e.w+dw),h:Math.max(30,e.h+dh)}:e))}/>))}
              {preview&&drawing&&(tool==='rect'||tool==='circle'||tool==='sticky')&&(
                <div style={{position:'absolute',left:preview.x,top:preview.y,width:preview.w,height:preview.h,background:tool==='sticky'?STICKY_COLORS[0]+'88':bgColor+'55',border:`2px dashed ${tool==='sticky'?'#fef08a':bgColor}`,borderRadius:tool==='circle'?'50%':8,pointerEvents:'none'}}/>
              )}
            </div>
            {elements.length===0&&(<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center"><PenLine size={44} className="text-slate-700 mx-auto mb-3"/><p className="text-slate-600 text-sm">Select a template or start drawing</p><p className="text-slate-700 text-xs mt-1">Use Templates or Graphs menu above</p></div></div>)}
          </div>
        )}

        {/* Properties panel */}
        {sel&&tool==='select'&&mode==='canvas'&&(
          <div className="w-44 flex-shrink-0 bg-[#040810] border-l border-slate-800 p-3 overflow-y-auto">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-bold">Properties</div>
            <div className="space-y-2.5">
              <div><label className="text-[10px] text-slate-400 block mb-1">Label</label><input value={sel.text||''} onChange={e=>setElements(p=>p.map(el=>el.id===sel.id?{...el,text:e.target.value}:el))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"/></div>
              <div><label className="text-[10px] text-slate-400 block mb-1">Fill</label><div className="flex flex-wrap gap-1">{COLORS.map(c=>(<button key={c} onClick={()=>setElements(p=>p.map(el=>el.id===sel.id?{...el,bgColor:c}:el))} className={`w-5 h-5 rounded ${sel.bgColor===c?'ring-2 ring-blue-400':''}`} style={{background:c}}/>))}</div></div>
              <div><label className="text-[10px] text-slate-400 block mb-1">Text Color</label><div className="flex flex-wrap gap-1">{['#ffffff','#000000','#1a1a2e','#E5243B','#4C9F38','#26BDE2'].map(c=>(<button key={c} onClick={()=>setElements(p=>p.map(el=>el.id===sel.id?{...el,color:c}:el))} className={`w-5 h-5 rounded ${sel.color===c?'ring-2 ring-blue-400':''}`} style={{background:c}}/>))}</div></div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Font Size</label>
                <input type="number" value={sel.fontSize||13} min={8} max={48} onChange={e=>setElements(p=>p.map(el=>el.id===sel.id?{...el,fontSize:Number(e.target.value)}:el))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"/>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setElements(p=>p.map(el=>el.id===sel.id?{...el,bold:!el.bold}:el))} className={`flex-1 py-1 text-xs rounded-lg border transition ${sel.bold?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-400'}`}><Bold size={11} className="mx-auto"/></button>
                <button onClick={()=>setElements(p=>p.map(el=>el.id===sel.id?{...el,underline:!el.underline}:el))} className={`flex-1 py-1 text-xs rounded-lg border transition ${sel.underline?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-400'}`}><Underline size={11} className="mx-auto"/></button>
              </div>
              <div className="grid grid-cols-2 gap-1">{(['w','h'] as const).map(f=>(<div key={f}><label className="text-[10px] text-slate-500">{f==='w'?'W':'H'}</label><input type="number" value={Math.round((sel as any)[f]||0)} min={20} onChange={e=>setElements(p=>p.map(el=>el.id===sel.id?{...el,[f]:Number(e.target.value)}:el))} className="w-full bg-slate-800 border border-slate-700 text-white text-[10px] rounded px-1.5 py-1 focus:outline-none"/></div>))}</div>
              <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-1 py-1.5 bg-red-900/30 border border-red-700/40 text-red-400 rounded-lg text-xs hover:bg-red-900/50"><Trash2 size={11}/>Delete</button>
            </div>
          </div>
        )}

        {/* AI Chat */}
        {chatOpen&&(
          <div className="w-72 flex-shrink-0 bg-[#040810] border-l border-slate-800 flex flex-col">
            <div className="flex-shrink-0 p-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2"><Bot size={14} className="text-green-400"/><span className="text-white text-xs font-bold">SDG Prototype Coach</span></div>
              <select value={sdgFocus} onChange={e=>setSdgFocus(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1.5 focus:outline-none">{SDGS.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div className="flex-shrink-0 px-2 py-1.5 border-b border-slate-800 flex flex-wrap gap-1">{['3 ideas','Review canvas','Structure tips','SDG targets'].map(q=>(<button key={q} onClick={()=>setChatInput(q)} className="text-[9px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors">{q}</button>))}</div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5" style={{minHeight:0}}>
              {chatMsgs.map((m,i)=>(<div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${m.role==='assistant'?'bg-green-600':'bg-blue-600'} text-white`}>{m.role==='assistant'?<Bot size={11}/>:'U'}</div><div className={`rounded-xl px-2.5 py-2 text-[11px] leading-relaxed max-w-[85%] ${m.role==='assistant'?'bg-slate-800 text-slate-200':'bg-blue-600 text-white'}`} style={{whiteSpace:'pre-wrap'}}>{m.text}</div></div>))}
              {chatLoading&&<div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center"><Bot size={11} className="text-white"/></div><div className="bg-slate-800 rounded-xl px-3 py-2 flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div></div>}
              <div ref={chatEndRef}/>
            </div>
            <div className="flex-shrink-0 p-2.5 border-t border-slate-800 flex gap-2">
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat()} placeholder="Ask for ideas…" className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 placeholder:text-slate-600"/>
              <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()} className="w-8 h-8 bg-green-600 hover:bg-green-500 disabled:opacity-40 rounded-xl flex items-center justify-center"><Send size={12} className="text-white"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ElementView({ el, isSelected, isEditingText, onSelect, onTextChange, onTextBlur, onDoubleClick, onDrag, onResize }: {
  el: CanvasElement; isSelected: boolean; isEditingText: boolean;
  onSelect:()=>void; onTextChange:(t:string)=>void; onTextBlur:()=>void;
  onDoubleClick:()=>void; onDrag:(dx:number,dy:number)=>void; onResize:(dw:number,dh:number)=>void;
}) {
  const dragStart=useRef<{x:number;y:number}|null>(null);
  const handleMouseDown=(e:React.MouseEvent)=>{
    e.stopPropagation();onSelect();dragStart.current={x:e.clientX,y:e.clientY};
    const move=(me:MouseEvent)=>{if(!dragStart.current)return;onDrag(me.clientX-dragStart.current.x,me.clientY-dragStart.current.y);dragStart.current={x:me.clientX,y:me.clientY};};
    const up=()=>{dragStart.current=null;window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);};
    window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
  };
  const handleResizeDown=(e:React.MouseEvent)=>{
    e.stopPropagation();const start={x:e.clientX,y:e.clientY};
    const move=(me:MouseEvent)=>{onResize(me.clientX-start.x,me.clientY-start.y);};
    const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);};
    window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
  };
  const base:React.CSSProperties={position:'absolute',left:el.x,top:el.y,width:el.w,height:el.h,cursor:'move',outline:isSelected?'2px solid #60a5fa':'none',outlineOffset:2};
  const textStyle:React.CSSProperties={color:el.color,fontSize:el.fontSize||13,userSelect:'none',textAlign:'center',padding:'4px',whiteSpace:'pre-wrap',lineHeight:1.3,display:'block',fontWeight:el.bold?'bold':'normal',textDecoration:el.underline?'underline':'none'};
  const content=isEditingText?<textarea autoFocus value={el.text||''} onChange={e=>onTextChange(e.target.value)} onBlur={onTextBlur} style={{width:'100%',height:'100%',background:'transparent',color:el.color,fontSize:el.fontSize||13,border:'none',outline:'none',resize:'none',fontFamily:'inherit',textAlign:'center',padding:'4px',fontWeight:el.bold?'bold':'normal'}}/>:<span style={textStyle}>{el.text}</span>;
  const resizeHandle=isSelected&&<div onMouseDown={handleResizeDown} style={{position:'absolute',right:-4,bottom:-4,width:10,height:10,background:'#60a5fa',borderRadius:2,cursor:'se-resize',zIndex:10}}/>;
  if(el.type==='text')return(<div style={{...base,background:'transparent',display:'flex',alignItems:'center'}} onMouseDown={handleMouseDown} onDoubleClick={onDoubleClick}>{isEditingText?<textarea autoFocus value={el.text||''} onChange={e=>onTextChange(e.target.value)} onBlur={onTextBlur} style={{background:'transparent',color:el.color,fontSize:el.fontSize||14,border:'none',outline:'none',resize:'none',fontFamily:'inherit',width:'100%',fontWeight:el.bold?'bold':'normal'}}/>:<span style={{...textStyle,fontSize:el.fontSize||14}}>{el.text}</span>}{resizeHandle}</div>);
  if(el.type==='circle')return(<div style={{...base,background:el.bgColor,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseDown={handleMouseDown} onDoubleClick={onDoubleClick}>{content}{resizeHandle}</div>);
  if(el.isSticky||el.type==='sticky')return(<div style={{...base,background:el.bgColor,borderRadius:4,boxShadow:'2px 4px 12px rgba(0,0,0,0.3)',padding:8,display:'flex',flexDirection:'column'}} onMouseDown={handleMouseDown} onDoubleClick={onDoubleClick}><div style={{width:'100%',height:8,background:'rgba(0,0,0,0.1)',borderRadius:2,marginBottom:4,flexShrink:0}}/>{isEditingText?<textarea autoFocus value={el.text||''} onChange={e=>onTextChange(e.target.value)} onBlur={onTextBlur} style={{flex:1,background:'transparent',color:el.color,fontSize:el.fontSize||12,border:'none',outline:'none',resize:'none',fontFamily:'inherit'}}/>:<span style={{...textStyle,fontSize:el.fontSize||12,flex:1}}>{el.text}</span>}{resizeHandle}</div>);
  return(<div style={{...base,background:el.bgColor,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',padding:6}} onMouseDown={handleMouseDown} onDoubleClick={onDoubleClick}>{content}{resizeHandle}</div>);
}
