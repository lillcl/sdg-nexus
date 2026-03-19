# SDG Nexus — Architecture & Continuation Guide (v16)
> Read this before editing any file. It describes every layer of the project.

---

## Deployed URLs
| Service | URL |
|---|---|
| **Frontend** | https://frontend-two-gamma-se8c9yvmwd.vercel.app |
| **Backend** | https://sdg-nexus.onrender.com |
| **Supabase** | https://pmqvoluuqmurruedohic.supabase.co |

---

## Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS → Vercel
- **Backend:** FastAPI (Python 3.11) + Supabase (auth + DB) → Render.com (free)
- **AI:** Ollama (local) or OpenAI/Anthropic (set via `AI_PROVIDER` env var)

---

## Directory Structure
```
sdg-nexus-v16/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Router; MapLayout (full-vh); StandardLayout + Footer
│   │   ├── vite-env.d.ts             # VITE_API_URL type declaration
│   │   ├── api/client.ts             # Axios; VITE_API_URL → prod, /api → dev proxy
│   │   ├── store/index.ts            # useAuthStore · useMapStore · useBrandingStore
│   │   ├── types/index.ts            # User · CountryData · SDG_GOALS · scoreColor()
│   │   ├── data/
│   │   │   ├── sdr2025.ts            # EMBEDDED_SDG_DATA (193 countries, instant load)
│   │   │   ├── sdgData.ts            # SDG goal descriptions (v16 uploaded version)
│   │   │   └── sdgGoals.ts
│   │   ├── components/
│   │   │   ├── Layout/Header.tsx     # Hover dropdowns via onMouseEnter/Leave + delay timer
│   │   │   └── WorldMap/
│   │   │       ├── WorldMap.tsx      # D3 map; getBoundingClientRect sizing; V9 pattern
│   │   │       ├── MapControls.tsx   # SDG goal buttons
│   │   │       ├── MapLegend.tsx     # Score legend
│   │   │       ├── MapTooltip.tsx    # Country hover tooltip
│   │   │       └── CountryPanel.tsx  # Right panel with 126 SDR indicators
│   │   └── pages/
│   │       ├── HomePage.tsx          # Hero (branding-aware: appName/tagline/stats/CTAs)
│   │       ├── MapPage.tsx           # Loads EMBEDDED_SDG_DATA; 60ms ready delay
│   │       ├── LoginPage.tsx         # JSON POST /auth/login; SDG logo grid
│   │       ├── DashboardPage.tsx     # StudentDashboard · AdminDashboard · SuperadminDashboard
│   │       │                         # SuperadminDashboard includes BrandingPanel
│   │       ├── EventsPage.tsx        # List/create events; date format dd/mm/yyyy (manual)
│   │       ├── CalendarPage.tsx      # Full-year 2026 UN Days calendar
│   │       ├── GamesPage.tsx         # Flag game + Capital game (client-side, no backend)
│   │       ├── SDGPage.tsx           # 17 SDG explorer
│   │       ├── MUNPage.tsx           # AI committee builder
│   │       ├── MUNCoordPage.tsx      # Live MUN session
│   │       ├── MUNLingoPage.tsx      # MUN glossary
│   │       ├── ClassroomPage.tsx     # AI project generator
│   │       ├── LeaderboardPage.tsx
│   │       ├── NewsPage.tsx
│   │       ├── ResourcesPage.tsx
│   │       └── PartnershipsPage.tsx
│   ├── .env                          # VITE_API_URL=https://sdg-nexus.onrender.com
│   ├── .env.example
│   ├── vercel.json                   # outputDirectory:dist + SPA rewrites
│   └── vite.config.ts                # dev proxy /api→:8000; build to dist/
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # CORS: exact Vercel URL + *.vercel.app + *.onrender.com
│   │   ├── core/
│   │   │   ├── supabase.py           # get_supabase() anon · get_supabase_admin() service-role
│   │   │   ├── config.py             # Pydantic Settings + dotenv
│   │   │   └── database.py           # SQLite async fallback
│   │   └── routers/
│   │       ├── auth_supabase.py      # /auth/* — login/register/me/users/roles
│   │       ├── events_supabase.py    # /events/* — returns array directly (not {events:[]})
│   │       ├── map.py                # /map/countries
│   │       ├── games.py              # /games/* (unused; games are client-side)
│   │       ├── ai.py                 # /ai/* streaming (Ollama/OpenAI/Anthropic)
│   │       ├── mun.py                # /mun/*
│   │       ├── mun_coord.py          # /mun-coord/*
│   │       └── classroom.py          # /classroom/*
│   ├── .env                          # All secrets (never commit)
│   ├── requirements.txt              # Exact pinned versions (v16 uploaded)
│   ├── runtime.txt                   # python-3.11.11
│   └── render.yaml                   # Render.com deploy config
│
├── start.sh                          # Local dev launcher
├── VERCEL_DEPLOY.md                  # Full deploy guide
└── claude.md                         # ← THIS FILE
```

---

## Key Patterns

### Auth Flow
1. POST `{email, password}` JSON → `/auth/login`
2. Supabase `sign_in_with_password()` → returns JWT
3. Frontend stores `token` + `user` JSON in `localStorage`
4. `useAuthStore` rehydrates on load
5. All API calls send `Authorization: Bearer <token>`
6. Backend verifies via `supabase.auth.get_user(token)` + joins `roles` table

### Role System
| Role | Can do |
|---|---|
| visitor | Read; request student upgrade |
| student | Badges/XP UI |
| admin | Create/edit/delete events; approve role requests |
| superadmin | All admin + set any role + BrandingPanel |

### Nav Dropdowns (Header.tsx)
- **MUN:** Build MUN, Coordinate
- **Learn:** Games, Classroom, MUNLingo
- **Info:** News, Calendar, Resources
- Implementation: `useState` + `onMouseEnter`/`onMouseLeave` + 120ms hide delay
- **Why not CSS hover?** Tailwind arbitrary `group/dd` variants fail in production builds

### Branding System
- `useBrandingStore` in `store/index.ts`
- Fields: `appName`, `tagline`, `subtagline`, `footerNote`, `stats`, `ctaExplore`, `ctaLearn`
- Saved in `localStorage`; superadmin edits via `BrandingPanel` in DashboardPage
- Used in: `Header`, `HomePage`, `App.tsx Footer`

### World Map
- `WorldMap.tsx`: D3 v7 + topojson + world-atlas CDN
- Sizing: `getBoundingClientRect()` (not `clientWidth` which returns 0 pre-paint)
- `MapPage.tsx`: 60ms `ready` delay lets DOM settle before D3 measures
- Map route uses `MapLayout` in `App.tsx` with `height:100vh` — no footer

### Events
- Backend `GET /events/` returns `response.data` (array) directly
- Frontend handles both: `Array.isArray(r.data) ? r.data : (r.data?.events ?? [])`
- Date display: manual `dd/mm/yyyy` construction (no `toLocaleDateString`)
- Create modal sends: `{title, description, date: form.date_start, sdg_tags: [...]}`

### AI / Ollama
- Set via `AI_PROVIDER` env var: `ollama` | `openai` | `anthropic`
- Ollama reads `OLLAMA_BASE_URL` from env
- **On Render.com:** Render can't reach `localhost:11434`
  - Expose your local Ollama via: `ngrok http 11434` or Cloudflare Tunnel
  - Set `OLLAMA_BASE_URL` in Render dashboard to the tunnel URL

---

## Supabase Schema
```sql
public.roles (id, user_id→auth.users, role, status, requested_role, created_at, updated_at)
public.events (id, title, description, date, sdg_tags[], created_by→auth.users, created_at, updated_at)
```
See `backend/supabase_setup.sql` for full RLS policies + service-role bypass.

---

## Environment Variables

### Backend (`backend/.env` / Render env vars)
```
SUPABASE_URL=https://pmqvoluuqmurruedohic.supabase.co
SUPABASE_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service role key>
SECRET_KEY=<random hex>
DATABASE_URL=sqlite+aiosqlite:///./sdg_nexus.db
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434   # or ngrok URL for production
OLLAMA_MODEL=gpt-oss:20b
```

### Frontend (`frontend/.env` / Vercel env vars)
```
VITE_API_URL=https://sdg-nexus.onrender.com
```

---

## Deployment

### Backend → Render.com
1. Push repo to GitHub
2. New Web Service → Root Dir: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars in Render Dashboard
6. URL: `https://sdg-nexus.onrender.com`

### Frontend → Vercel
1. New Project → Root Dir: `frontend`
2. Add env var: `VITE_API_URL=https://sdg-nexus.onrender.com`
3. `vercel.json` handles SPA rewrites + `outputDirectory: dist`
4. URL: `https://frontend-two-gamma-se8c9yvmwd.vercel.app`

### Local Dev
```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
# Vite proxies /api → localhost:8000
```

---

## Known Issues / Next Steps
| # | Issue | Fix |
|---|---|---|
| 1 | Branding only in localStorage | Add `settings` Supabase table + `GET/PUT /settings/branding` |
| 2 | Events table missing `event_type`, `location`, `organizer` fields | Alter table in Supabase; update `EventCreate` model |
| 3 | Ollama not reachable from Render | Use ngrok tunnel; set `OLLAMA_BASE_URL` in Render env |
| 4 | Legacy `auth.py` + `events.py` still present | Delete after confirming Supabase auth stable |
| 5 | Games backend routes unused | Remove `/games/*` backend; games are fully client-side |

---

## Version History
| Version | Key Changes |
|---|---|
| v12 | Initial: Supabase auth, world map, games, events, MUN |
| v13 | Fixed: supabase.py lazy init; LoginPage JSON; WorldMap V9; Dashboard roles; 2 games; CalendarPage |
| v14 | Fixed: Map black screen; nav groups; BadgesPage→Dashboard; date dd/mm/yyyy; exact requirements |
| v15 | Fixed: dropdown hover; login SDG logo; events date field; branding store+panel; user email; Render CORS |
| v16 | Fixed: dropdown JS hover (works in prod); CORS exact URLs; events returns array; VITE_API_URL set; uploaded WorldMap/sdgData/requirements/runtime; footer note updated |
