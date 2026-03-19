-- =============================================================================
-- V18 MIGRATION — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/pmqvoluuqmurruedohic/sql
-- =============================================================================

-- 1. Extend events table with full fields
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type       text DEFAULT 'conference',
  ADD COLUMN IF NOT EXISTS organizer        text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location         text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_virtual       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS date_end         date,
  ADD COLUMN IF NOT EXISTS image_url        text DEFAULT '',
  ADD COLUMN IF NOT EXISTS sdg_goals        text DEFAULT '';

-- 2. App settings table (persistent branding)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read settings"      ON public.app_settings;
DROP POLICY IF EXISTS "service full app_settings" ON public.app_settings;
CREATE POLICY "public read settings"          ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "service full app_settings"     ON public.app_settings FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.app_settings (key, value) VALUES
  ('branding', '{"appName":"SDG Nexus","tagline":"A comprehensive platform for exploring, learning and advocating for the UN Sustainable Development Goals.","subtagline":"Powered by SDSN Sustainable Development Report 2025 · 193 countries · 126 indicators","footerNote":"AI for Global Language · AI for Science · AI for SDGs","stats":{"countries":"193","avgScore":"68.1","indicators":"126","targets":"169"},"ctaExplore":"Explore the Map","ctaLearn":"Learn the SDGs"}')
ON CONFLICT (key) DO NOTHING;

-- 3. Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip           text NOT NULL,
  endpoint     text NOT NULL,
  hits         int DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  UNIQUE(ip, endpoint)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service full rate_limits" ON public.rate_limits;
CREATE POLICY "service full rate_limits" ON public.rate_limits FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_events_date    ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_type    ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_rate_ip        ON public.rate_limits(ip, endpoint);

-- =============================================================================
-- V21 ADDITIONS
-- =============================================================================

-- Event registrations table (for /events/{id}/register endpoint)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid REFERENCES public.events(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text NOT NULL,
  organization  text DEFAULT '',
  country       text DEFAULT '',
  message       text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service full event_registrations" ON public.event_registrations FOR ALL
  USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');

-- AI config key in app_settings
INSERT INTO public.app_settings (key, value) VALUES
  ('ai_config', '{"provider":"ollama","api_key":"","base_url":"http://localhost:11434","model":"llama3"}')
ON CONFLICT (key) DO NOTHING;
