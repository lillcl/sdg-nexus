-- =============================================================================
-- V23 MIGRATION — Run in Supabase SQL Editor
-- Supabase v18 compatible (uses standard PostgreSQL + Supabase auth patterns)
-- =============================================================================

-- 1. Teacher–Student assignments
CREATE TABLE IF NOT EXISTS public.teacher_student_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL,
  student_id  uuid NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (teacher_id, student_id)
);
ALTER TABLE public.teacher_student_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superadmin full access" ON public.teacher_student_assignments
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 2. User profiles (extended metadata beyond auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id     uuid PRIMARY KEY,
  username    text,
  full_name   text DEFAULT '',
  avatar_url  text DEFAULT '',
  bio         text DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON public.user_profiles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_ta_teacher ON public.teacher_student_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ta_student ON public.teacher_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.user_profiles(user_id);

-- =============================================================================
-- Notes for v23 user management:
-- • Superadmin creates users via Supabase admin API (auth.admin.createUser)
-- • Role assigned immediately via roles table INSERT
-- • Teacher–student links stored in teacher_student_assignments
-- • Batch CSV creates handled in frontend → backend loop
-- =============================================================================
