// src/types/index.ts
export type TrendDir = 'On Track'|'Moderately Improving'|'Stagnating'|'Moderately Declining'|'Declining';

export interface CountryData {
  iso3: string; iso2: string; name: string;
  region: string; subregion: string; income_group: string;
  population: number; overall_score: number; rank: number;
  scores: Record<string, number>;
  trends: Record<string, TrendDir>;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  requested_role?: string | null;
}

export interface Committee {
  id: number; name: string; sdg_focus: string; topic: string;
  country_count: number; countries: string;
  background_guide: string; output_length: string;
  formality: string; level: string; director_id: number;
}

export interface PositionPaper {
  id: number; committee_id: number; country_iso3: string;
  country_name: string; content: string;
}

export interface ProjectTopic {
  id: number; classroom_id: number; title: string;
  problem_statement: string; prototype_brief: string;
  difficulty: number; domain: string; sdg_goal: number;
  rubric: string; assigned_to: string;
}

export interface Classroom {
  id: number; name: string; teacher_id: number;
  sdg_focus: string; level: string;
}

export const SDG_GOALS = [
  { goal:1, title:'No Poverty', short:'No Poverty', color:'#E5243B' },
  { goal:2, title:'Zero Hunger', short:'Zero Hunger', color:'#DDA63A' },
  { goal:3, title:'Good Health & Well-Being', short:'Good Health', color:'#4C9F38' },
  { goal:4, title:'Quality Education', short:'Education', color:'#C5192D' },
  { goal:5, title:'Gender Equality', short:'Gender Eq.', color:'#FF3A21' },
  { goal:6, title:'Clean Water & Sanitation', short:'Clean Water', color:'#26BDE2' },
  { goal:7, title:'Affordable & Clean Energy', short:'Clean Energy', color:'#FCC30B' },
  { goal:8, title:'Decent Work & Economic Growth', short:'Decent Work', color:'#A21942' },
  { goal:9, title:'Industry, Innovation & Infra.', short:'Industry', color:'#FD6925' },
  { goal:10, title:'Reduced Inequalities', short:'Inequalities', color:'#DD1367' },
  { goal:11, title:'Sustainable Cities', short:'Sust. Cities', color:'#FD9D24' },
  { goal:12, title:'Responsible Consumption', short:'Consumption', color:'#BF8B2E' },
  { goal:13, title:'Climate Action', short:'Climate', color:'#3F7E44' },
  { goal:14, title:'Life Below Water', short:'Life Water', color:'#0A97D9' },
  { goal:15, title:'Life on Land', short:'Life Land', color:'#56C02B' },
  { goal:16, title:'Peace, Justice & Institutions', short:'Peace', color:'#00689D' },
  { goal:17, title:'Partnerships for the Goals', short:'Partnerships', color:'#19486A' },
];

export function getTrend(t: string): { arrow: string; cls: string; label: string } {
  if (t?.includes('On Track'))              return { arrow:'▲', cls:'text-green-400', label:'On Track' };
  if (t?.includes('Moderately Improving'))  return { arrow:'↗', cls:'text-lime-400', label:'Improving' };
  if (t?.includes('Moderately Declin'))     return { arrow:'↘', cls:'text-orange-400', label:'Declining' };
  if (t?.includes('Declin') || t?.includes('Decreas')) return { arrow:'▼', cls:'text-red-400', label:'Declining' };
  return { arrow:'→', cls:'text-yellow-400', label:'Stagnating' };
}

export function scoreColor(s: number): string {
  if (s >= 80) return '#22c55e';
  if (s >= 70) return '#84cc16';
  if (s >= 60) return '#eab308';
  if (s >= 50) return '#f97316';
  return '#ef4444';
}
