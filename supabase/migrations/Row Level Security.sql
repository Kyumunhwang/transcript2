-- 모든 핵심 테이블에 RLS 활성화
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_universities ENABLE ROW LEVEL SECURITY;

-- 인증된 교사(authenticated)에게만 전체 CRUD 권한 부여 (예시: students 외 7개 테이블 동일 적용)
CREATE POLICY "Allow full access to authenticated counselors"
ON public.students
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
-- (주의: 마이그레이션 작성 시 나머지 7개 테이블에도 동일한 정책을 빠짐없이 생성할 것)