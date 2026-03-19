# SDG Nexus — Vercel Deployment Guide

This project deploys as **two separate Vercel projects**:
- **Frontend** — React/Vite SPA (static)
- **Backend** — FastAPI serverless functions (Python)

---

## Prerequisites

- [Vercel account](https://vercel.com) (free tier is fine)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- Git repo (GitHub / GitLab / Bitbucket) — or deploy directly via CLI
- Your Supabase project credentials (already in `.env`)

---

## Step 1 — Push to GitHub

```bash
cd sdg-nexus-v14
git init
git add .
git commit -m "SDG Nexus v14"
git remote add origin https://github.com/YOUR_USERNAME/sdg-nexus.git
git push -u origin main
```

---

## Step 2 — Deploy the Backend

### 2a. Import project on Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"** → select your repo
3. When prompted for **Root Directory**, enter: `backend`
4. Vercel will auto-detect Python from `vercel.json`

### 2b. Set Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add ALL of these:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://pmqvoluuqmurruedohic.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIs...` (your anon key) |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIs...` (your service key) |
| `SECRET_KEY` | Generate: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./sdg_nexus.db` |
| `AI_PROVIDER` | `ollama` (or `openai` / `anthropic`) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` |
| `OLLAMA_MODEL` | `gpt-oss:20b` |
| `DATABASE_PASSWORD` | `qIl7j4jAOOLIsyzF` |

> **Note:** For AI features in production, switch `AI_PROVIDER` to `openai` and add `OPENAI_API_KEY`.

### 2c. Deploy

Click **"Deploy"**. Wait for the build to complete.

Your backend URL will be something like:
```
https://sdg-nexus-backend.vercel.app
```

Test it: visit `https://sdg-nexus-backend.vercel.app/health` — should return `{"status":"healthy"}`.

---

## Step 3 — Deploy the Frontend

### 3a. Import project on Vercel (second project)

1. Go to https://vercel.com/new again
2. Import the **same repo**
3. When prompted for **Root Directory**, enter: `frontend`
4. **Framework Preset**: Vite (auto-detected)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### 3b. Set Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://sdg-nexus-backend.vercel.app` ← your backend URL from Step 2 |

> **Important:** The `VITE_` prefix is required — Vite bakes these into the build at compile time.

### 3c. Deploy

Click **"Deploy"**. Your frontend URL will be:
```
https://sdg-nexus.vercel.app
```

---

## Step 4 — Update Backend CORS

After you know your frontend URL, go back to the **backend Vercel project**:

1. **Settings → Environment Variables**
2. Add: `FRONTEND_URL` = `https://sdg-nexus.vercel.app`

Then update `backend/app/main.py` — add your frontend URL to `allow_origins`:

```python
allow_origins=[
    "https://sdg-nexus.vercel.app",        # ← your real frontend URL
    "https://*.vercel.app",
    "http://localhost:5173",
],
```

Commit and push — Vercel redeploys automatically.

---

## Step 5 — Set Up Supabase Database

Run the SQL setup script in your Supabase project:

1. Go to https://supabase.com/dashboard/project/pmqvoluuqmurruedohic
2. Click **SQL Editor** → **New query**
3. Paste the contents of `backend/supabase_setup.sql`
4. Click **Run**

This creates the `roles` and `events` tables with RLS policies.

### 5a. Create your first Superadmin

1. Register an account through the app (use your deployed frontend URL)
2. In Supabase → **Table Editor** → `roles` table
3. Find your `user_id` (from `auth.users` table)
4. Change `role` from `visitor` → `superadmin`
5. Click **Save**

Now you can log in as superadmin and promote other users from the Dashboard.

---

## Step 6 — Verify Everything Works

Test each endpoint:

```bash
# Backend health
curl https://sdg-nexus-backend.vercel.app/health

# Auth (should return 422 without body, proving the endpoint exists)
curl https://sdg-nexus-backend.vercel.app/auth/login

# Map data
curl https://sdg-nexus-backend.vercel.app/map/countries | head -c 200
```

Visit your frontend and:
- [ ] World Map loads with colours (not all black)
- [ ] Login / Register works
- [ ] Dashboard shows correct role-based view
- [ ] Events date shows as `dd/mm/yyyy`
- [ ] MUN / Learn / Info nav dropdowns work

---

## Alternative: Deploy via CLI

If you prefer the terminal:

```bash
# Install CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend  
cd ../frontend
vercel --prod
```

The CLI will prompt you for env vars interactively.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend returns 500 | Check Vercel Function Logs → look for `[Supabase]` log lines |
| Map is black | Check browser console — likely a fetch error for world-atlas CDN |
| Login fails | Confirm `SUPABASE_KEY` and `SUPABASE_SERVICE_KEY` are set in backend env vars |
| CORS error | Add your exact frontend URL to `allow_origins` in `main.py` |
| Build fails | Check Node version is ≥18; Python version is 3.11 |
| `supabase` import error | Vercel uses `requirements.txt` — confirm exact versions match |

---

## Local Development (after cloning)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit with your keys
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if needed
npm run dev
# → http://localhost:5173
```
