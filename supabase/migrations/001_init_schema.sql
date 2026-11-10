-- ==============================================================================
-- Lighthouse College Counseling Portal - Initial Database Schema Migration
-- Target: Supabase (PostgreSQL 15+)
-- Tables: students, academic_terms, course_grades, test_scores, 
--         student_clubs, student_awards, counseling_logs, target_universities
-- ==============================================================================

-- 0. Extensions & Helper Functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. ENUM Types
DO $$ BEGIN
    CREATE TYPE test_type_enum AS ENUM ('TOEFL', 'SAT', 'PSAT', 'AP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE award_scope_enum AS ENUM ('INTERNAL', 'EXTERNAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proposer_type_enum AS ENUM ('TEACHER', 'STUDENT', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code VARCHAR(50) UNIQUE NOT NULL,        -- Gradelink student matching key
    name_ko VARCHAR(100) NOT NULL,                   -- Student Korean name
    name_en VARCHAR(100),                            -- Student English name on transcript
    grade_level SMALLINT NOT NULL CHECK (grade_level BETWEEN 7 AND 12),
    enrollment_year SMALLINT,                        -- Enrollment year
    expected_graduation_year SMALLINT,               -- Graduation year
    email VARCHAR(255),
    cumulative_gpa_unweighted NUMERIC(4, 2),         -- Unweighted GPA cache (e.g., 3.85)
    cumulative_gpa_weighted NUMERIC(4, 2),           -- Weighted GPA cache (e.g., 4.12)
    basic_memo TEXT,                                 -- Special notes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         -- Active enrollment flag
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Academic Terms Table
CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,              -- e.g. '2025-2026'
    semester VARCHAR(30) NOT NULL,                   -- e.g. 'Semester 1', 'Semester 2', 'Summer'
    grade_level_at_term SMALLINT,                    -- Grade level during term (9, 10, 11, 12)
    term_gpa_unweighted NUMERIC(4, 2),               -- Term unweighted GPA
    term_gpa_weighted NUMERIC(4, 2),                 -- Term weighted GPA
    total_credits NUMERIC(5, 2) DEFAULT 0.00,        -- Total completed credits
    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE, -- Counselor manual GPA override flag
    override_reason TEXT,                            -- Reason for manual override
    source_pdf_filename VARCHAR(255),                -- Gradelink original PDF filename
    last_parsed_at TIMESTAMPTZ,                      -- Last parsing timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_term UNIQUE(student_id, academic_year, semester)
);

-- 4. Course Grades Table
CREATE TABLE IF NOT EXISTS public.course_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_code VARCHAR(50),
    course_name VARCHAR(200) NOT NULL,
    credits NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    letter_grade VARCHAR(10) NOT NULL,
    grade_points NUMERIC(4, 2),
    is_honors_or_ap BOOLEAN NOT NULL DEFAULT FALSE,
    -- Credit Make-up tracking columns
    is_credit_makeup BOOLEAN NOT NULL DEFAULT FALSE,
    original_letter_grade VARCHAR(10),
    original_grade_points NUMERIC(4, 2),
    makeup_date DATE,
    makeup_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Test Scores Table
CREATE TABLE IF NOT EXISTS public.test_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    test_type test_type_enum NOT NULL,
    subject_or_detail VARCHAR(150),
    test_date DATE,
    total_score VARCHAR(50) NOT NULL,
    section_scores JSONB DEFAULT '{}'::jsonb,
    detailed_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Student Clubs Table
CREATE TABLE IF NOT EXISTS public.student_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    club_name VARCHAR(200) NOT NULL,
    active_grades VARCHAR(50),
    role_title VARCHAR(150),
    activity_period VARCHAR(100),
    detailed_description TEXT NOT NULL,
    display_order SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Student Awards Table
CREATE TABLE IF NOT EXISTS public.student_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    award_title VARCHAR(255) NOT NULL,
    award_scope award_scope_enum NOT NULL DEFAULT 'INTERNAL',
    award_rank VARCHAR(100),
    award_date DATE,
    grade_level_at_award SMALLINT,
    issuing_organization VARCHAR(200),
    detailed_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Counseling Logs Table
CREATE TABLE IF NOT EXISTS public.counseling_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    counselor_name VARCHAR(100) NOT NULL DEFAULT '진학담당교사',
    counseling_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_topic VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    action_items TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Target Universities Table
CREATE TABLE IF NOT EXISTS public.target_universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    university_name VARCHAR(200) NOT NULL,
    country_or_region VARCHAR(100),
    intended_major VARCHAR(200),
    proposer_type proposer_type_enum NOT NULL,
    application_round VARCHAR(50),
    pros TEXT,
    cons TEXT,
    strategic_notes TEXT,
    priority_order SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_students_grade_name ON public.students(grade_level, name_ko);
CREATE INDEX IF NOT EXISTS idx_academic_terms_student ON public.academic_terms(student_id, academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_course_grades_term ON public.course_grades(term_id);
CREATE INDEX IF NOT EXISTS idx_course_grades_student ON public.course_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_test_scores_student_type ON public.test_scores(student_id, test_type);
CREATE INDEX IF NOT EXISTS idx_student_clubs_student ON public.student_clubs(student_id, display_order);
CREATE INDEX IF NOT EXISTS idx_student_awards_student ON public.student_awards(student_id, award_scope);
CREATE INDEX IF NOT EXISTS idx_counseling_logs_student_date ON public.counseling_logs(student_id, is_pinned DESC, counseling_date DESC);
CREATE INDEX IF NOT EXISTS idx_target_univ_student_proposer ON public.target_universities(student_id, proposer_type, priority_order);

-- 11. Updated_at Triggers
DROP TRIGGER IF EXISTS tr_students_updated_at ON public.students;
CREATE TRIGGER tr_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_academic_terms_updated_at ON public.academic_terms;
CREATE TRIGGER tr_academic_terms_updated_at BEFORE UPDATE ON public.academic_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_course_grades_updated_at ON public.course_grades;
CREATE TRIGGER tr_course_grades_updated_at BEFORE UPDATE ON public.course_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_test_scores_updated_at ON public.test_scores;
CREATE TRIGGER tr_test_scores_updated_at BEFORE UPDATE ON public.test_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_student_clubs_updated_at ON public.student_clubs;
CREATE TRIGGER tr_student_clubs_updated_at BEFORE UPDATE ON public.student_clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_student_awards_updated_at ON public.student_awards;
CREATE TRIGGER tr_student_awards_updated_at BEFORE UPDATE ON public.student_awards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_counseling_logs_updated_at ON public.counseling_logs;
CREATE TRIGGER tr_counseling_logs_updated_at BEFORE UPDATE ON public.counseling_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_target_universities_updated_at ON public.target_universities;
CREATE TRIGGER tr_target_universities_updated_at BEFORE UPDATE ON public.target_universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_universities ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies: Authenticated Counselors full CRUD
DROP POLICY IF EXISTS "Allow authenticated full access to students" ON public.students;
CREATE POLICY "Allow authenticated full access to students" ON public.students
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to academic_terms" ON public.academic_terms;
CREATE POLICY "Allow authenticated full access to academic_terms" ON public.academic_terms
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to course_grades" ON public.course_grades;
CREATE POLICY "Allow authenticated full access to course_grades" ON public.course_grades
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to test_scores" ON public.test_scores;
CREATE POLICY "Allow authenticated full access to test_scores" ON public.test_scores
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to student_clubs" ON public.student_clubs;
CREATE POLICY "Allow authenticated full access to student_clubs" ON public.student_clubs
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to student_awards" ON public.student_awards;
CREATE POLICY "Allow authenticated full access to student_awards" ON public.student_awards
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to counseling_logs" ON public.counseling_logs;
CREATE POLICY "Allow authenticated full access to counseling_logs" ON public.counseling_logs
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated full access to target_universities" ON public.target_universities;
CREATE POLICY "Allow authenticated full access to target_universities" ON public.target_universities
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
