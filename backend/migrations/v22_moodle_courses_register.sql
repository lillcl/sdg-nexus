-- 先創建 moodle_courses 表
CREATE TABLE IF NOT EXISTS moodle_courses (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title         TEXT NOT NULL,
    description   TEXT,
    teacher_id    UUID NOT NULL,
    sdg_focus     TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE moodle_courses ENABLE ROW LEVEL SECURITY;

-- Policies with correct UUID comparison
CREATE POLICY "Anyone can view courses" ON moodle_courses FOR SELECT USING (true);
CREATE POLICY "Teachers can create courses" ON moodle_courses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
CREATE POLICY "Teachers can update their own courses" ON moodle_courses FOR UPDATE USING (
    teacher_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moodle_courses_teacher ON moodle_courses(teacher_id);

COMMENT ON TABLE moodle_courses IS 'Moodle-style courses for SDG learning (V22)';

-- V22: Moodle course registrations & tournament results tables
CREATE TABLE IF NOT EXISTS moodle_course_registrations (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id     UUID NOT NULL REFERENCES moodle_courses(id) ON DELETE CASCADE,
    student_id    UUID NOT NULL,
    enrolled_at   TIMESTAMPTZ DEFAULT NOW(),
    status        TEXT DEFAULT 'active' CHECK (status IN ('active','completed','dropped')),
    progress_pct  INTEGER DEFAULT 0,
    UNIQUE (course_id, student_id)
);

-- Tournament results
CREATE TABLE IF NOT EXISTS tournament_results (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id   TEXT NOT NULL,
    tournament_name TEXT,
    user_id         UUID NOT NULL,
    username        TEXT,
    score           INTEGER NOT NULL,
    total           INTEGER NOT NULL,
    time_taken      INTEGER DEFAULT 0,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE moodle_course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Policies with correct UUID comparison
CREATE POLICY "Users can register for courses" ON moodle_course_registrations 
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own registrations" ON moodle_course_registrations 
    FOR SELECT USING (
        auth.uid() = student_id OR 
        EXISTS (SELECT 1 FROM roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Anyone authenticated can insert tournament results" ON tournament_results 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view tournament results" ON tournament_results 
    FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moodle_reg_course ON moodle_course_registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_moodle_reg_student ON moodle_course_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_tid ON tournament_results(tournament_id);

COMMENT ON TABLE moodle_course_registrations IS 'Tracks student enrollment in Moodle courses (V22)';
COMMENT ON TABLE tournament_results IS 'Stores SDG tournament quiz results per user (V22)';