-- SDG Nexus V12 - Supabase Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pmqvoluuqmurruedohic

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Roles table (user permissions)
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('visitor', 'student', 'admin', 'superadmin')),
  status text DEFAULT 'active',
  requested_role text CHECK (requested_role IN ('student', 'admin', 'superadmin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Events table (calendar events)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  sdg_tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDEXES (for performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_role ON public.roles(role);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role" ON public.roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.roles;
DROP POLICY IF EXISTS "Users can update own role request" ON public.roles;
DROP POLICY IF EXISTS "Superadmin can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

-- Roles table policies
CREATE POLICY "Users can view own role" ON public.roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON public.roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role request" ON public.roles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Superadmin can view all roles" ON public.roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Events table policies
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================================================
-- TRIGGERS (auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA (optional - create first superadmin manually after user signup)
-- ============================================================================

-- After a user registers, run this to make them superadmin:
-- UPDATE public.roles SET role = 'superadmin' WHERE user_id = 'USER_ID_FROM_AUTH_USERS';

-- ============================================================================
-- VERIFICATION QUERIES (run these to verify setup)
-- ============================================================================

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('roles', 'events');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('roles', 'events');

-- Check policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('roles', 'events');

-- ============================================================================
-- DONE! 
-- Next steps:
-- 1. Register a user via the app
-- 2. Find their user_id in auth.users table
-- 3. Update their role to 'superadmin' manually
-- 4. They can now approve other users' role requests
-- ============================================================================

-- ============================================================================
-- SERVICE ROLE BYPASS (required for backend to read/write all rows)
-- ============================================================================

-- Allow service role to bypass RLS on roles table
CREATE POLICY "Service role full access to roles" ON public.roles
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow service role to bypass RLS on events table  
CREATE POLICY "Service role full access to events" ON public.events
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- MOODLE LMS TABLES (v17)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moodle_courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text DEFAULT '',
  sdg_focus text DEFAULT '',
  teacher_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moodle_lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES public.moodle_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',  -- markdown
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moodle_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES public.moodle_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  due_date date,
  max_points int DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moodle_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES public.moodle_tasks(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id),
  content text DEFAULT '',
  notes text DEFAULT '',
  points int,
  feedback text DEFAULT '',
  graded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.moodle_enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES public.moodle_courses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- RLS
ALTER TABLE public.moodle_courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodle_lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodle_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodle_enrollments ENABLE ROW LEVEL SECURITY;

-- Public read for courses/lessons/tasks
CREATE POLICY "public read courses"  ON public.moodle_courses     FOR SELECT USING (true);
CREATE POLICY "public read lessons"  ON public.moodle_lessons     FOR SELECT USING (true);
CREATE POLICY "public read tasks"    ON public.moodle_tasks       FOR SELECT USING (true);

-- Service role full access (backend)
CREATE POLICY "service full moodle_courses"     ON public.moodle_courses     FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
CREATE POLICY "service full moodle_lessons"     ON public.moodle_lessons     FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
CREATE POLICY "service full moodle_tasks"       ON public.moodle_tasks       FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
CREATE POLICY "service full moodle_submissions" ON public.moodle_submissions FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
CREATE POLICY "service full moodle_enrollments" ON public.moodle_enrollments FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
