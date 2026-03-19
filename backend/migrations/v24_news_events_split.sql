-- =============================================================================
-- V24 MIGRATION — News/Events split + partner logos
-- =============================================================================

-- 1. Organisation news articles table (separate from SDG live news feed)
CREATE TABLE IF NOT EXISTS public.org_news (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  summary       text DEFAULT '',
  body          text DEFAULT '',
  image_url     text DEFAULT '',
  category      text DEFAULT 'news',        -- 'news' | 'event_report'
  published_at  timestamptz DEFAULT now(),
  author        text DEFAULT '',
  language      text DEFAULT 'en',
  featured      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE public.org_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read org_news"  ON public.org_news FOR SELECT USING (true);
CREATE POLICY "Service role full org_news" ON public.org_news FOR ALL
  USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');

-- 2. Event registrations for ONGOING events (Register tab)
-- The existing events table covers upcoming/ongoing; add a dedicated register_interest table
CREATE TABLE IF NOT EXISTS public.event_interests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid REFERENCES public.events(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text NOT NULL,
  organization  text DEFAULT '',
  country       text DEFAULT '',
  message       text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full event_interests" ON public.event_interests FOR ALL
  USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');

-- 3. Partner logo store (filename references, actual files on disk)
CREATE TABLE IF NOT EXISTS public.partner_logos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name  text NOT NULL,
  filename      text NOT NULL,   -- e.g. "un-logo.svg"
  url_path      text NOT NULL,   -- e.g. "/static/uploads/un-logo.svg"
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read partner_logos" ON public.partner_logos FOR SELECT USING (true);
CREATE POLICY "Service role full partner_logos" ON public.partner_logos FOR ALL
  USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_news_slug       ON public.org_news(slug);
CREATE INDEX IF NOT EXISTS idx_org_news_published  ON public.org_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_interests_eid ON public.event_interests(event_id);

-- Sample org news
INSERT INTO public.org_news (title, slug, summary, category, author, featured) VALUES
  ('SDG Nexus Launches V24 Platform', 'sdg-nexus-launches-v24', 'The latest platform update brings Bloomberg-style trend charts, tournament competitions, and Google Drive integration.', 'news', 'SDG Nexus Team', true),
  ('UNESCO IRCAI Accreditation Awarded', 'unesco-ircai-accreditation', 'SDG Nexus partner schools receive prestigious UNESCO IRCAI accreditation for AI in education excellence.', 'news', 'Editorial Team', false),
  ('Asia-Pacific MUN Conference 2025 Recap', 'ap-mun-2025-recap', '500+ delegates from 20 countries competed in the annual Asia-Pacific Model UN Conference focused on SDG action.', 'event_report', 'Events Team', false)
ON CONFLICT (slug) DO NOTHING;
