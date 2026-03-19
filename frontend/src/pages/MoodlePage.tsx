// src/pages/MoodlePage.tsx — LMS: teachers (admin/superadmin) and students
import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, ChevronRight, ChevronDown, CheckCircle, Clock, Award, Send, Edit3, Trash2, Search } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/store';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Course { id:string; title:string; description:string; sdg_focus:string; teacher_id:string; created_at:string; }
interface Lesson  { id:string; course_id:string; title:string; content:string; order:number; }
interface Task    { id:string; course_id:string; title:string; description:string; due_date:string|null; max_points:number; }
interface Submission { id:string; task_id:string; student_id:string; content:string; notes:string; points:number|null; feedback:string; graded:boolean; }

// ── Small shared components ───────────────────────────────────────────────────
const Input = ({ label, value, onChange, textarea=false, placeholder='' }: any) => (
  <div>
    {label && <label className="text-xs text-slate-400 mb-1 block">{label}</label>}
    {textarea
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={5}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none"/>
      : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"/>}
  </div>
);

const Btn = ({ children, onClick, disabled=false, variant='primary', size='md', className='' }: any) => {
  const base = 'flex items-center gap-1.5 font-semibold rounded-xl transition-all disabled:opacity-40';
  const sizes: Record<string,string> = { sm:'px-2.5 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5 text-sm' };
  const variants: Record<string,string> = {
    primary:'bg-blue-600 hover:bg-blue-500 text-white',
    danger:'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/40',
    ghost:'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
    success:'bg-green-600 hover:bg-green-500 text-white',
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

// ── Modals ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0a1525] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16}/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ── Teacher: Course list + create ─────────────────────────────────────────────
function TeacherView() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [form, setForm] = useState({ title:'', description:'', sdg_focus:'' });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [courseStats, setCourseStats] = useState<Record<string,{lessons:number;tasks:number}>>({});

  const load = async () => {
    try {
      const r = await api.get('/moodle/my-courses');
      setCourses(r.data);
      setLoadError('');
      // fetch stats per course
      const stats: Record<string,{lessons:number;tasks:number}> = {};
      for (const c of r.data) {
        try {
          const [lr, tr] = await Promise.all([
            api.get(`/moodle/courses/${c.id}/lessons`),
            api.get(`/moodle/courses/${c.id}/tasks`),
          ]);
          stats[c.id] = { lessons: lr.data.length, tasks: tr.data.length };
        } catch { stats[c.id] = { lessons: 0, tasks: 0 }; }
      }
      setCourseStats(stats);
    } catch(e: any) {
      setLoadError(e?.response?.data?.detail || e?.message || 'Failed to load courses');
      console.error('Moodle error:', e?.response?.data || e?.message);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) return;
    setLoading(true);
    try { await api.post('/moodle/courses', form); await load(); setShowCreate(false); setForm({ title:'', description:'', sdg_focus:'' }); }
    catch {}
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/moodle/courses/${id}`); await load(); if (selected?.id===id) setSelected(null); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };

  if (selected) return <CourseEditor course={selected} onBack={() => { setSelected(null); load(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-blue-400"/>My Courses</h2>
        <Btn onClick={() => setShowCreate(true)}><Plus size={14}/>New Course</Btn>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30"/>
          <p>No courses yet. Create your first course.</p>
        </div>
      )}

      {loadError && (
        <div className="bg-red-900/30 border border-red-800/40 rounded-xl px-4 py-3 text-red-400 text-xs mb-2">
          ⚠️ {loadError} — Check that VITE_API_URL is set to your backend URL.
        </div>
      )}
      {/* Search */}
      <div className="relative mb-2">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={courseSearch} onChange={e=>setCourseSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {courses.filter(c=>!courseSearch||c.title.toLowerCase().includes(courseSearch.toLowerCase())).map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-bold">{c.title}</h3>
                {c.sdg_focus && <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">{c.sdg_focus}</span>}
              </div>
              <Btn variant="danger" size="sm" onClick={() => del(c.id)}><Trash2 size={11}/></Btn>
            </div>
            {c.description && <p className="text-slate-400 text-xs mb-2">{c.description}</p>}
          {courseStats[c.id] && (
            <div className="flex gap-3 text-[11px] text-slate-500 mb-3">
              <span>📚 {courseStats[c.id].lessons} lessons</span>
              <span>✅ {courseStats[c.id].tasks} tasks</span>
            </div>
          )}
            <Btn onClick={() => setSelected(c)} variant="ghost"><Edit3 size={12}/>Manage<ChevronRight size={12}/></Btn>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Create Course" onClose={() => setShowCreate(false)}>
          <Input label="Title *" value={form.title} onChange={(v:string)=>setForm(f=>({...f,title:v}))} placeholder="Course title"/>
          <Input label="Description" value={form.description} onChange={(v:string)=>setForm(f=>({...f,description:v}))} textarea placeholder="What students will learn..."/>
          <Input label="SDG Focus (e.g. SDG 4, SDG 13)" value={form.sdg_focus} onChange={(v:string)=>setForm(f=>({...f,sdg_focus:v}))} placeholder="Optional"/>
          <Btn onClick={create} disabled={loading || !form.title} size="lg" className="w-full justify-center">
            {loading ? 'Creating…' : 'Create Course'}
          </Btn>
        </Modal>
      )}
    </div>
  );
}

// ── Teacher: Course Editor (lessons + tasks + submissions) ────────────────────
function CourseEditor({ course, onBack }: { course:Course; onBack:()=>void }) {
  const [tab, setTab] = useState<'lessons'|'tasks'|'submissions'>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title:'', content:'', order:0 });
  const [taskForm, setTaskForm] = useState({ title:'', description:'', due_date:'', max_points:100 });
  const [selectedTask, setSelectedTask] = useState<Task|null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradeForm, setGradeForm] = useState<Record<string,{points:string;feedback:string}>>({});

  const loadLessons = async () => { try { const r = await api.get(`/moodle/courses/${course.id}/lessons`); setLessons(r.data); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); } };
  const loadTasks   = async () => { try { const r = await api.get(`/moodle/courses/${course.id}/tasks`);   setTasks(r.data);   } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); } };

  useEffect(() => { loadLessons(); loadTasks(); }, [course.id]);

  const addLesson = async () => {
    try { await api.post('/moodle/lessons', { ...lessonForm, course_id: course.id }); await loadLessons(); setShowAddLesson(false); setLessonForm({ title:'', content:'', order:0 }); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };
  const delLesson = async (id:string) => { try { await api.delete(`/moodle/lessons/${id}`); await loadLessons(); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); } };
  const addTask = async () => {
    try { await api.post('/moodle/tasks', { ...taskForm, max_points:Number(taskForm.max_points), course_id:course.id }); await loadTasks(); setShowAddTask(false); setTaskForm({ title:'', description:'', due_date:'', max_points:100 }); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };
  const delTask = async (id:string) => { try { await api.delete(`/moodle/tasks/${id}`); await loadTasks(); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); } };

  const viewSubmissions = async (task: Task) => {
    setSelectedTask(task);
    try { const r = await api.get(`/moodle/tasks/${task.id}/submissions`); setSubmissions(r.data); setTab('submissions'); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };

  const grade = async (subId: string) => {
    const g = gradeForm[subId];
    if (!g) return;
    try { await api.post('/moodle/grade', { submission_id: subId, points: Number(g.points), feedback: g.feedback });
      setSubmissions(s => s.map(sub => sub.id===subId ? { ...sub, points:Number(g.points), feedback:g.feedback, graded:true } : sub));
    } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };

  const TABS = [{ key:'lessons', label:'Lessons' }, { key:'tasks', label:'Tasks' }, { key:'submissions', label:'Submissions' }] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-500 hover:text-white text-sm flex items-center gap-1"><ChevronRight size={14} className="rotate-180"/>Back</button>
        <h2 className="text-lg font-bold text-white">{course.title}</h2>
      </div>

      <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t.key?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='lessons' && (
        <div className="space-y-3">
          <Btn onClick={()=>setShowAddLesson(true)} size="sm"><Plus size={12}/>Add Lesson</Btn>
          {lessons.length===0 && <p className="text-slate-500 text-sm">No lessons yet.</p>}
          {lessons.map(l => (
            <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{l.order+1}. {l.title}</span>
                <Btn variant="danger" size="sm" onClick={()=>delLesson(l.id)}><Trash2 size={11}/></Btn>
              </div>
              <pre className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed font-sans">{l.content}</pre>
            </div>
          ))}
          {showAddLesson && (
            <Modal title="Add Lesson" onClose={()=>setShowAddLesson(false)}>
              <Input label="Title *" value={lessonForm.title} onChange={(v:string)=>setLessonForm(f=>({...f,title:v}))} placeholder="Lesson title"/>
              <Input label="Content (markdown supported)" value={lessonForm.content} onChange={(v:string)=>setLessonForm(f=>({...f,content:v}))} textarea placeholder="Lesson content..."/>
              <Input label="Order" value={String(lessonForm.order)} onChange={(v:string)=>setLessonForm(f=>({...f,order:Number(v)}))} placeholder="0"/>
              <Btn onClick={addLesson} disabled={!lessonForm.title} size="lg" className="w-full justify-center">Add Lesson</Btn>
            </Modal>
          )}
        </div>
      )}

      {tab==='tasks' && (
        <div className="space-y-3">
          <Btn onClick={()=>setShowAddTask(true)} size="sm"><Plus size={12}/>Add Task</Btn>
          {tasks.length===0 && <p className="text-slate-500 text-sm">No tasks yet.</p>}
          {tasks.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold text-sm">{t.title}</h4>
                  <p className="text-slate-400 text-xs mt-1">{t.description}</p>
                  <div className="flex gap-3 mt-2 text-[10px] text-slate-500">
                    {t.due_date && <span className="flex items-center gap-1"><Clock size={10}/>{t.due_date}</span>}
                    <span className="flex items-center gap-1"><Award size={10}/>{t.max_points} pts</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={()=>viewSubmissions(t)}>Submissions</Btn>
                  <Btn variant="danger" size="sm" onClick={()=>delTask(t.id)}><Trash2 size={11}/></Btn>
                </div>
              </div>
            </div>
          ))}
          {showAddTask && (
            <Modal title="Add Task" onClose={()=>setShowAddTask(false)}>
              <Input label="Title *" value={taskForm.title} onChange={(v:string)=>setTaskForm(f=>({...f,title:v}))} placeholder="Task title"/>
              <Input label="Description" value={taskForm.description} onChange={(v:string)=>setTaskForm(f=>({...f,description:v}))} textarea placeholder="What students should do..."/>
              <Input label="Due Date" value={taskForm.due_date} onChange={(v:string)=>setTaskForm(f=>({...f,due_date:v}))} placeholder="YYYY-MM-DD"/>
              <Input label="Max Points" value={String(taskForm.max_points)} onChange={(v:string)=>setTaskForm(f=>({...f,max_points:Number(v)}))} placeholder="100"/>
              <Btn onClick={addTask} disabled={!taskForm.title} size="lg" className="w-full justify-center">Add Task</Btn>
            </Modal>
          )}
        </div>
      )}

      {tab==='submissions' && (
        <div className="space-y-3">
          {selectedTask && <p className="text-slate-400 text-xs">Submissions for: <span className="text-white font-semibold">{selectedTask.title}</span></p>}
          {submissions.length===0 && <p className="text-slate-500 text-sm">No submissions yet.</p>}
          {submissions.map(sub => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500">{sub.student_id?.slice(0,16)}…</span>
                {sub.graded
                  ? <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/>{sub.points}/{selectedTask?.max_points} pts</span>
                  : <span className="text-yellow-400 text-xs">Ungraded</span>}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-3 bg-slate-800/50 rounded-lg p-2">{sub.content}</p>
              {sub.notes && <p className="text-slate-500 text-xs italic mb-3">Note: {sub.notes}</p>}
              {!sub.graded && (
                <div className="flex gap-2">
                  <input type="number" placeholder="Points" max={selectedTask?.max_points}
                    value={gradeForm[sub.id]?.points||''}
                    onChange={e=>setGradeForm(f=>({...f,[sub.id]:{...f[sub.id],points:e.target.value}}))}
                    className="w-20 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"/>
                  <input placeholder="Feedback…"
                    value={gradeForm[sub.id]?.feedback||''}
                    onChange={e=>setGradeForm(f=>({...f,[sub.id]:{...f[sub.id],feedback:e.target.value}}))}
                    className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"/>
                  <Btn variant="success" size="sm" onClick={()=>grade(sub.id)}><Send size={11}/>Grade</Btn>
                </div>
              )}
              {sub.graded && sub.feedback && <p className="text-green-400/70 text-xs italic mt-1">Feedback: {sub.feedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Student View ──────────────────────────────────────────────────────────────
function StudentView() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course|null>(null);
  const [tab, setTab] = useState<'browse'|'mine'>('browse');
  const [courseStats, setCourseStats] = useState<Record<string,{lessons:number;tasks:number}>>({});

  const loadAll  = async () => {
    try {
      const r = await api.get('/moodle/courses');
      setAllCourses(r.data);
      const stats: Record<string,{lessons:number;tasks:number}> = {};
      for (const c of r.data) {
        try {
          const [lr, tr] = await Promise.all([
            api.get(`/moodle/courses/${c.id}/lessons`),
            api.get(`/moodle/courses/${c.id}/tasks`),
          ]);
          stats[c.id] = { lessons: lr.data.length, tasks: tr.data.length };
        } catch { stats[c.id] = { lessons: 0, tasks: 0 }; }
      }
      setCourseStats(stats);
    } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };
  const loadMine = async () => { try { const r = await api.get('/moodle/my-courses');  setMyCourses(r.data);  } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); } };

  useEffect(() => { loadAll(); loadMine(); }, []);

  const enroll = async (courseId: string) => {
    try { await api.post(`/moodle/courses/${courseId}/enroll`); await loadMine(); } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };

  const enrolled = (id: string) => myCourses.some(c => c.id === id);

  if (selected) return <StudentCourse course={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-blue-400"/>Courses</h2>

      <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit">
        {[{key:'browse',label:'All Courses'},{key:'mine',label:'My Courses'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t.key?'bg-blue-600 text-white':'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='browse' && (
        <div className="grid md:grid-cols-2 gap-4">
          {allCourses.length===0 && <p className="text-slate-500 text-sm">No courses available yet.</p>}
          {allCourses.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all">
              <h3 className="text-white font-bold mb-1">{c.title}</h3>
              {c.sdg_focus && <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full block w-fit mb-2">{c.sdg_focus}</span>}
              {c.description && <p className="text-slate-400 text-xs mb-2">{c.description}</p>}
          {courseStats[c.id] && (
            <div className="flex gap-3 text-[11px] text-slate-500 mb-3">
              <span>📚 {courseStats[c.id].lessons} lessons</span>
              <span>✅ {courseStats[c.id].tasks} tasks</span>
            </div>
          )}
              <div className="flex gap-2">
                {enrolled(c.id)
                  ? <Btn variant="ghost" onClick={() => setSelected(c)}><ChevronRight size={12}/>Open</Btn>
                  : <Btn onClick={() => enroll(c.id)}><Plus size={12}/>Enrol</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='mine' && (
        <div className="grid md:grid-cols-2 gap-4">
          {myCourses.length===0 && <p className="text-slate-500 text-sm">You haven't enrolled in any courses yet.</p>}
          {myCourses.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all cursor-pointer" onClick={() => setSelected(c)}>
              <h3 className="text-white font-bold mb-1">{c.title}</h3>
              {c.description && <p className="text-slate-400 text-xs">{c.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Student: Course view (lessons + tasks + submit) ───────────────────────────
function StudentCourse({ course, onBack }: { course:Course; onBack:()=>void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openLesson, setOpenLesson] = useState<string|null>(null);
  const [submitForm, setSubmitForm] = useState<Record<string,{content:string;notes:string}>>({});
  const [submitted, setSubmitted] = useState<Record<string,Submission>>({});

  useEffect(() => {
    api.get(`/moodle/courses/${course.id}/lessons`).then(r => setLessons(r.data)).catch(()=>{});
    api.get(`/moodle/courses/${course.id}/tasks`).then(async r => {
      setTasks(r.data);
      // Load own submissions
      const subs: Record<string,Submission> = {};
      for (const t of r.data) {
        try {
          const sr = await api.get(`/moodle/tasks/${t.id}/submissions`);
          if (sr.data.length) subs[t.id] = sr.data[0];
        } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
      }
      setSubmitted(subs);
    }).catch(()=>{});
  }, [course.id]);

  const submit = async (taskId: string) => {
    const f = submitForm[taskId];
    if (!f?.content) return;
    try {
      const r = await api.post('/moodle/submissions', { task_id: taskId, content: f.content, notes: f.notes||'' });
      setSubmitted(s => ({ ...s, [taskId]: r.data }));
    } catch(e: any) { console.error('Moodle error:', e?.response?.data || e?.message); }
  };

  const formatDate = (d: string|null) => {
    if (!d) return '';
    const dt = new Date(d+'T12:00:00');
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-500 hover:text-white text-sm flex items-center gap-1"><ChevronRight size={14} className="rotate-180"/>Back</button>
        <h2 className="text-lg font-bold text-white">{course.title}</h2>
      </div>

      {/* Lessons */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><BookOpen size={14} className="text-blue-400"/>Lessons</h3>
        {lessons.length===0 && <p className="text-slate-500 text-sm">No lessons yet.</p>}
        {lessons.map(l => (
          <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl mb-2">
            <button onClick={() => setOpenLesson(openLesson===l.id ? null : l.id)}
              className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-white text-sm font-semibold">{l.order+1}. {l.title}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openLesson===l.id?'rotate-180':''}`}/>
            </button>
            {openLesson===l.id && (
              <div className="px-4 pb-4">
                <pre className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed font-sans bg-slate-800/50 rounded-xl p-3">{l.content}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><CheckCircle size={14} className="text-green-400"/>Tasks</h3>
        {tasks.length===0 && <p className="text-slate-500 text-sm">No tasks yet.</p>}
        {tasks.map(t => {
          const sub = submitted[t.id];
          return (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-semibold text-sm">{t.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{t.description}</p>
                  <div className="flex gap-3 mt-1.5 text-[10px] text-slate-500">
                    {t.due_date && <span className="flex items-center gap-1"><Clock size={10}/>Due: {formatDate(t.due_date)}</span>}
                    <span className="flex items-center gap-1"><Award size={10}/>{t.max_points} pts</span>
                  </div>
                </div>
                {sub?.graded && (
                  <span className="text-green-400 text-xs font-bold flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded-lg">
                    <CheckCircle size={10}/>{sub.points}/{t.max_points}
                  </span>
                )}
              </div>

              {sub ? (
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Your submission:</p>
                  <p className="text-slate-300 text-xs">{sub.content}</p>
                  {sub.feedback && <p className="text-green-400/70 text-xs italic mt-2">Teacher feedback: {sub.feedback}</p>}
                  {!sub.graded && <p className="text-yellow-500/70 text-[10px] mt-1">Awaiting grade…</p>}
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={submitForm[t.id]?.content||''} rows={3} placeholder="Your answer..."
                    onChange={e=>setSubmitForm(f=>({...f,[t.id]:{...f[t.id],content:e.target.value}}))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"/>
                  <input placeholder="Notes (optional)" value={submitForm[t.id]?.notes||''}
                    onChange={e=>setSubmitForm(f=>({...f,[t.id]:{...f[t.id],notes:e.target.value}}))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"/>
                  <Btn onClick={() => submit(t.id)} disabled={!submitForm[t.id]?.content} size="sm">
                    <Send size={11}/>Submit
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function MoodlePage() {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'admin' || user?.role === 'superadmin';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen size={48} className="text-blue-400 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-white mb-2">SDG Nexus Moodle</h1>
          <p className="text-slate-500 mb-6">Sign in to access courses and learning materials.</p>
          <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <BookOpen size={20} className="text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SDG Nexus Moodle</h1>
            <p className="text-slate-500 text-xs">
              {isTeacher ? '🎓 Teacher — create courses, lessons and tasks'
                         : '📚 Student — browse courses and submit tasks'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
              isTeacher
                ? 'bg-amber-900/40 text-amber-300 border-amber-700/40'
                : 'bg-blue-900/40 text-blue-300 border-blue-700/40'
            }`}>
              {isTeacher ? '🎓 Teacher' : '📚 Student'}
            </span>
          </div>
        </div>

        {isTeacher ? <TeacherView /> : <StudentView />}
      </div>
    </div>
  );
}
