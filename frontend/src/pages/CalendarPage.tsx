import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UN_DAYS: Record<string, { icon: string; title: string; sdg: number; category: string }[]> = {
  '2026-01-01': [{ icon: '🌍', title: "World Interfaith Harmony Week (Feb 1–7)", sdg: 16, category: 'Peace' }],
  '2026-02-04': [{ icon: '🎗️', title: 'World Cancer Day', sdg: 3, category: 'Health' }],
  '2026-02-20': [{ icon: '⚖️', title: 'World Day of Social Justice', sdg: 10, category: 'Equality' }],
  '2026-03-08': [{ icon: '🌸', title: "International Women's Day", sdg: 5, category: 'Gender Equality' }],
  '2026-03-21': [{ icon: '🌳', title: 'International Day of Forests', sdg: 15, category: 'Environment' }],
  '2026-03-22': [{ icon: '💧', title: 'World Water Day', sdg: 6, category: 'Water' }],
  '2026-03-23': [{ icon: '🌡️', title: 'World Meteorological Day', sdg: 13, category: 'Climate' }],
  '2026-04-07': [{ icon: '🏥', title: 'World Health Day', sdg: 3, category: 'Health' }],
  '2026-04-22': [{ icon: '🌍', title: 'Earth Day', sdg: 13, category: 'Environment' }],
  '2026-04-25': [{ icon: '🦟', title: 'World Malaria Day', sdg: 3, category: 'Health' }],
  '2026-05-03': [{ icon: '📰', title: 'World Press Freedom Day', sdg: 16, category: 'Freedom' }],
  '2026-05-15': [{ icon: '👨‍👩‍👧', title: 'International Day of Families', sdg: 1, category: 'Social' }],
  '2026-05-22': [{ icon: '🦋', title: 'International Day for Biological Diversity', sdg: 15, category: 'Biodiversity' }],
  '2026-06-05': [{ icon: '🌿', title: 'World Environment Day', sdg: 15, category: 'Environment' }],
  '2026-06-08': [{ icon: '🌊', title: 'World Oceans Day', sdg: 14, category: 'Oceans' }],
  '2026-06-12': [{ icon: '🚫', title: 'World Day Against Child Labour', sdg: 8, category: 'Labour' }],
  '2026-06-17': [{ icon: '🏜️', title: 'World Day to Combat Desertification', sdg: 15, category: 'Environment' }],
  '2026-06-20': [{ icon: '🏕️', title: 'World Refugee Day', sdg: 10, category: 'Migration' }],
  '2026-07-11': [{ icon: '👥', title: 'World Population Day', sdg: 11, category: 'Population' }],
  '2026-07-18': [{ icon: '✊', title: 'Nelson Mandela International Day', sdg: 10, category: 'Peace' }],
  '2026-07-30': [{ icon: '🔗', title: 'World Day Against Trafficking in Persons', sdg: 16, category: 'Justice' }],
  '2026-08-12': [{ icon: '🧒', title: 'International Youth Day', sdg: 4, category: 'Youth' }],
  '2026-08-19': [{ icon: '🤝', title: 'World Humanitarian Day', sdg: 17, category: 'Partnerships' }],
  '2026-09-08': [{ icon: '📚', title: 'International Literacy Day', sdg: 4, category: 'Education' }],
  '2026-09-16': [{ icon: '🌞', title: 'International Day for the Preservation of the Ozone Layer', sdg: 13, category: 'Climate' }],
  '2026-09-21': [{ icon: '🕊️', title: 'International Day of Peace', sdg: 16, category: 'Peace' }],
  '2026-10-01': [{ icon: '👴', title: 'International Day of Older Persons', sdg: 3, category: 'Health' }],
  '2026-10-05': [{ icon: '🍎', title: 'World Teachers\' Day', sdg: 4, category: 'Education' }],
  '2026-10-10': [{ icon: '🧠', title: 'World Mental Health Day', sdg: 3, category: 'Health' }],
  '2026-10-13': [{ icon: '🌪️', title: 'International Day for Disaster Risk Reduction', sdg: 11, category: 'Resilience' }],
  '2026-10-16': [{ icon: '🌾', title: 'World Food Day', sdg: 2, category: 'Food Security' }],
  '2026-10-17': [{ icon: '💔', title: 'International Day for Eradicating Poverty', sdg: 1, category: 'Poverty' }],
  '2026-10-31': [{ icon: '🌆', title: 'World Cities Day', sdg: 11, category: 'Urban' }],
  '2026-11-06': [{ icon: '☢️', title: 'International Day for Preventing Exploitation of the Environment in War', sdg: 16, category: 'Peace' }],
  '2026-11-14': [{ icon: '💉', title: 'World Diabetes Day', sdg: 3, category: 'Health' }],
  '2026-11-16': [{ icon: '🎭', title: 'International Day for Tolerance', sdg: 16, category: 'Tolerance' }],
  '2026-11-19': [{ icon: '🚽', title: 'World Toilet Day', sdg: 6, category: 'Sanitation' }],
  '2026-11-25': [{ icon: '🚫', title: 'International Day for Elimination of Violence Against Women', sdg: 5, category: 'Gender' }],
  '2026-12-01': [{ icon: '🎗️', title: 'World AIDS Day', sdg: 3, category: 'Health' }],
  '2026-12-02': [{ icon: '⛓️', title: 'International Day for the Abolition of Slavery', sdg: 8, category: 'Justice' }],
  '2026-12-05': [{ icon: '🤝', title: 'International Volunteer Day', sdg: 17, category: 'Partnerships' }],
  '2026-12-10': [{ icon: '📜', title: 'Human Rights Day', sdg: 16, category: 'Rights' }],
  '2026-12-18': [{ icon: '✈️', title: 'International Migrants Day', sdg: 10, category: 'Migration' }],
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31]; // 2026 is not leap year

const SDG_COLORS = [
  '#E5243B','#DDA63A','#4C9F38','#C5192D','#FF3A21','#26BDE2','#FCC30B',
  '#A21942','#FD6925','#DD1367','#FD9D24','#BF8B2E','#3F7E44','#0A97D9',
  '#56C02B','#00689D','#19486A',
];

function getDayOfWeek(year: number, month: number, day: number) {
  return new Date(year, month, day).getDay();
}

function padKey(month: number, day: number) {
  return `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(2); // March (index)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = 2026;
  const daysInMonth = DAYS_IN_MONTH[currentMonth];
  const firstDay = getDayOfWeek(year, currentMonth, 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prev = () => setCurrentMonth(m => m > 0 ? m - 1 : 0);
  const next = () => setCurrentMonth(m => m < 11 ? m + 1 : 11);

  const selectedEvents = selectedDay ? (UN_DAYS[selectedDay] || []) : [];

  // Collect all events for sidebar (this month)
  const monthEvents: { key: string; day: number; events: typeof UN_DAYS[string] }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = padKey(currentMonth, d);
    if (UN_DAYS[key]) monthEvents.push({ key, day: d, events: UN_DAYS[key] });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">📅 UN Events Calendar 2026</h1>
          <p className="text-blue-200">International Days, UN observances & SDG events — full year view</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Main */}
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prev} disabled={currentMonth === 0}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-white">{MONTHS[currentMonth]} {year}</h2>
              <button onClick={next} disabled={currentMonth === 11}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg transition">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Month tabs */}
            <div className="grid grid-cols-6 gap-1 mb-4">
              {MONTHS.slice(0, 6).map((m, i) => (
                <button key={i} onClick={() => setCurrentMonth(i)}
                  className={`text-[10px] md:text-xs py-1 rounded-lg transition font-medium ${currentMonth === i ? 'bg-violet-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-1 mb-5">
              {MONTHS.slice(6).map((m, i) => (
                <button key={i + 6} onClick={() => setCurrentMonth(i + 6)}
                  className={`text-[10px] md:text-xs py-1 rounded-lg transition font-medium ${currentMonth === i + 6 ? 'bg-violet-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-slate-500 text-xs font-semibold py-1">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }).map((_, idx) => {
                const dayNum = idx - firstDay + 1;
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={idx} className="aspect-square" />;
                }
                const key = padKey(currentMonth, dayNum);
                const hasEvents = Boolean(UN_DAYS[key]);
                const evts = UN_DAYS[key] || [];
                const isSelected = selectedDay === key;
                const isToday = currentMonth === 2 && dayNum === 14; // March 14
                return (
                  <button key={idx} onClick={() => setSelectedDay(isSelected ? null : key)}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all text-[10px] md:text-xs relative
                      ${isSelected ? 'ring-2 ring-violet-400 bg-violet-900/60' :
                        hasEvents ? 'bg-gradient-to-br from-blue-600/25 to-violet-600/25 border border-blue-500/40 hover:scale-105 cursor-pointer' :
                        'bg-slate-700/25 hover:bg-slate-700/40 cursor-pointer'}
                      ${isToday ? 'ring-2 ring-blue-400' : ''}`}>
                    <span className={`font-semibold ${isToday ? 'text-blue-300' : 'text-white'}`}>{dayNum}</span>
                    {hasEvents && (
                      <div className="flex flex-wrap gap-[1px] mt-0.5 justify-center">
                        {evts.slice(0, 2).map((e, i) => (
                          <span key={i} className="text-2xl leading-none">{e.icon}</span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day detail */}
            {selectedDay && selectedEvents.length > 0 && (
              <div className="mt-4 p-4 bg-violet-900/30 border border-violet-700/40 rounded-xl">
                <div className="text-xs text-violet-300 font-semibold mb-2">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {selectedEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 mt-2">
                    <span className="text-4xl">{e.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{e.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-800/50 text-violet-300">{e.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold"
                          style={{ background: SDG_COLORS[(e.sdg - 1)] + 'cc' }}>SDG {e.sdg}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — this month's events */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-bold text-white mb-3">{MONTHS[currentMonth]} Events</h3>
            {monthEvents.length === 0 ? (
              <p className="text-slate-500 text-xs">No UN days this month.</p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {monthEvents.map(({ key, day, events }) => (
                  <button key={key} onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-slate-700/70 transition border ${selectedDay === key ? 'border-violet-500/60 bg-violet-900/20' : 'border-slate-700/40 bg-slate-700/30'}`}>
                    {events.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                        <span className="text-2xl flex-shrink-0">{e.icon}</span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-white leading-tight truncate">{e.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {MONTHS[currentMonth].slice(0, 3)} {day}
                            <span className="ml-1 font-bold" style={{ color: SDG_COLORS[e.sdg - 1] }}>· SDG {e.sdg}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-500 mb-2 font-semibold">SDG Colors</div>
              <div className="flex flex-wrap gap-1">
                {SDG_COLORS.map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ background: c }} title={`SDG ${i + 1}`}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
