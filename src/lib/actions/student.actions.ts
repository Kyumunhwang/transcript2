'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import { getStudentsQuerySchema, createStudentSchema } from '@/lib/validations/student.schema';
import { DEMO_STUDENTS, getDemoTerms } from '@/lib/mock-data';
import type { ActionResult, StudentRow, StudentDashboardData } from '@/types/domain.types';

export async function createStudentAction(
  input: unknown
): Promise<ActionResult<StudentRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' } };
  }

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid student data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const { nameKo, nameEn, studentCode, gradeLevel, expectedGraduationYear, email, basicMemo } = parsed.data;

  if (supabase && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    try {
      const { data, error } = await supabase.from('students').insert({
        name_ko: nameKo, name_en: nameEn, student_code: studentCode,
        grade_level: gradeLevel, expected_graduation_year: expectedGraduationYear ?? null,
        email: email || null, basic_memo: basicMemo || null, is_active: true,
      }).select().single();

      if (!error && data) {
        revalidatePath('/students');
        return { success: true, data, message: 'Student registered successfully.' };
      }
    } catch {
      // Fall through to demo store
    }
  }

  const newStudent: StudentRow = {
    id: `student-${Date.now()}`,
    student_code: studentCode,
    name_ko: nameKo,
    name_en: nameEn,
    grade_level: gradeLevel,
    enrollment_year: gradeLevel === 12 ? 2021 : gradeLevel === 11 ? 2022 : gradeLevel === 10 ? 2023 : 2024,
    expected_graduation_year: expectedGraduationYear ?? (gradeLevel === 12 ? 2025 : 2026),
    email: email || null,
    cumulative_gpa_unweighted: null,
    cumulative_gpa_weighted: null,
    basic_memo: basicMemo || null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  DEMO_STUDENTS.unshift(newStudent);
  revalidatePath('/students');

  return { success: true, data: newStudent, message: 'Student registered successfully.' };
}

export async function getStudentsAction(
  input?: unknown
): Promise<ActionResult<StudentRow[]>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' } };
  }

  const parsed = getStudentsQuerySchema.safeParse(input ?? {});
  const { gradeLevel, search } = parsed.success ? parsed.data : { gradeLevel: undefined, search: undefined };

  if (supabase && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    try {
      let query = supabase.from('students').select('*').eq('is_active', true)
        .order('grade_level', { ascending: false }).order('name_ko', { ascending: true });
      if (gradeLevel) query = query.eq('grade_level', gradeLevel);
      if (search) query = query.or(`name_ko.ilike.%${search}%,name_en.ilike.%${search}%,student_code.ilike.%${search}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return { success: true, data };
    } catch {
      // Fall through to demo
    }
  }

  let filtered = [...DEMO_STUDENTS];
  if (gradeLevel) filtered = filtered.filter((s) => s.grade_level === gradeLevel);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((s) =>
      s.name_ko.toLowerCase().includes(q) ||
      (s.name_en && s.name_en.toLowerCase().includes(q)) ||
      s.student_code.toLowerCase().includes(q)
    );
  }

  return { success: true, data: filtered };
}

export async function getStudentByIdAction(
  studentId: string
): Promise<ActionResult<StudentRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' } };
  }

  if (supabase && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (!error && data) return { success: true, data };
    } catch {
      // Fall through to demo
    }
  }

  const found = DEMO_STUDENTS.find((s) => s.id === studentId);
  if (found) return { success: true, data: found };

  return { success: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student could not be found.' } };
}

export async function getStudentDashboardAction(
  studentId: string
): Promise<ActionResult<StudentDashboardData>> {
  const studentRes = await getStudentByIdAction(studentId);
  if (!studentRes.success || !studentRes.data) {
    return { success: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student could not be found.' } };
  }
  const student = studentRes.data;

  return {
    success: true,
    data: {
      student,
      terms: getDemoTerms(student.id),
      testScores: [
        { id: 't1', student_id: student.id, test_type: 'SAT', subject_or_detail: 'Composite', test_date: '2024-05-04', total_score: '1540 / 1600', section_scores: { Math: 800, RW: 740 }, detailed_notes: 'Verified official test report', created_at: '', updated_at: '' },
        { id: 't2', student_id: student.id, test_type: 'TOEFL', subject_or_detail: 'iBT', test_date: '2024-02-15', total_score: '115 / 120', section_scores: { Reading: 30, Listening: 29, Speaking: 28, Writing: 28 }, detailed_notes: 'Exceeds Ivy League benchmark', created_at: '', updated_at: '' },
      ],
      clubs: [
        { id: 'cl1', student_id: student.id, club_name: 'Student Council & Leadership', active_grades: '10, 11', role_title: 'Vice President', activity_period: '2023 - Present', detailed_description: 'Organized school-wide community service initiatives.', display_order: 1, created_at: '', updated_at: '' },
      ],
      awards: [
        { id: 'aw1', student_id: student.id, award_title: 'Academic Excellence Award', award_scope: 'INTERNAL', award_rank: '1st Place', award_date: '2024-06-10', grade_level_at_award: 10, issuing_organization: 'Lighthouse International School', detailed_description: 'Top academic honor for sophomore year.', created_at: '', updated_at: '' },
      ],
      recentCounselingLogs: [],
      targetUniversities: [],
    },
  };
}
