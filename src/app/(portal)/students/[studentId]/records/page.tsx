import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TranscriptRecordsView } from '@/components/records/transcript-records-view';
import { TestScoreForm } from '@/components/records/test-score-form';
import { ClubAwardForm } from '@/components/records/club-award-form';
import type {
  AcademicTermRow,
  CourseGradeRow,
  TestScoreRow,
  StudentClubRow,
  StudentAwardRow,
} from '@/types/domain.types';

interface RecordsPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentRecordsPage({ params }: RecordsPageProps) {
  const { studentId } = await params;
  const supabase = await createClient();

  // 1. Verify student exists
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, name_ko, student_code')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    notFound();
  }

  // 2. Fetch terms and nested courses
  const { data: termsData } = await supabase
    .from('academic_terms')
    .select('*')
    .eq('student_id', studentId)
    .order('academic_year', { ascending: false })
    .order('semester', { ascending: false });

  const termIds = (termsData ?? []).map((t) => t.id);

  let coursesData: CourseGradeRow[] = [];
  if (termIds.length > 0) {
    const { data: cData } = await supabase
      .from('course_grades')
      .select('*')
      .in('term_id', termIds);
    coursesData = (cData as CourseGradeRow[]) ?? [];
  }

  const termsWithCourses = (termsData ?? []).map((term) => ({
    ...(term as AcademicTermRow),
    courses: coursesData.filter((c) => c.term_id === term.id),
  }));

  // 3. Fetch test scores
  const { data: testScoresData } = await supabase
    .from('test_scores')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  // 4. Fetch clubs and awards
  const { data: clubsData } = await supabase
    .from('student_clubs')
    .select('*')
    .eq('student_id', studentId)
    .order('display_order', { ascending: true });

  const { data: awardsData } = await supabase
    .from('student_awards')
    .select('*')
    .eq('student_id', studentId)
    .order('award_date', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-content-primary">
          Academic Records & Extracurricular Activities
        </h2>
        <p className="text-xs text-content-secondary">
          Detailed management of courses, GPA make-up, standardized exams, clubs, and awards.
        </p>
      </div>

      {/* 1. Academic Course Grades & Credit Make-up View */}
      <TranscriptRecordsView terms={termsWithCourses} />

      {/* 2. Standardized Test Scores (TOEFL, SAT, AP) Form */}
      <TestScoreForm
        studentId={studentId}
        initialScores={(testScoresData as TestScoreRow[]) ?? []}
      />

      {/* 3. Clubs & Honors/Awards Forms */}
      <ClubAwardForm
        studentId={studentId}
        initialClubs={(clubsData as StudentClubRow[]) ?? []}
        initialAwards={(awardsData as StudentAwardRow[]) ?? []}
      />
    </div>
  );
}
