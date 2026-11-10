'use server';

import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import {
  testScoreSchema,
  studentClubSchema,
  studentAwardSchema,
} from '@/lib/validations/records.schema';
import type {
  ActionResult,
  TestScoreRow,
  StudentClubRow,
  StudentAwardRow,
} from '@/types/domain.types';
import { revalidatePath } from 'next/cache';

async function requireCounselor() {
  return await getAuthenticatedCounselor();
}

// -------------------------------------------------------------
// Test Scores (TOEFL, SAT, AP)
// -------------------------------------------------------------
export async function upsertTestScoreAction(
  input: unknown
): Promise<ActionResult<TestScoreRow>> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' } };
  }

  const parsed = testScoreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid test score data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const payload = parsed.data;

  try {
    const { data, error } = await supabase
      .from('test_scores')
      .upsert(
        {
          id: payload.id,
          student_id: payload.studentId,
          test_type: payload.testType,
          subject_or_detail: payload.subjectOrDetail ?? null,
          test_date: payload.testDate ?? null,
          total_score: payload.totalScore,
          section_scores: payload.sectionScores as any,
          detailed_notes: payload.detailedNotes ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save test score: ${error?.message}`);
    }

    revalidatePath(`/students/${payload.studentId}`);
    revalidatePath(`/students/${payload.studentId}/records`);

    return { success: true, data: data as TestScoreRow, message: 'Test score saved successfully.' };
  } catch (err) {
    return { success: false, error: { code: 'DB_ERROR', message: err instanceof Error ? err.message : 'Database error.' } };
  }
}

export async function deleteTestScoreAction(
  scoreId: string,
  studentId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } };
  }

  const { error } = await supabase.from('test_scores').delete().eq('id', scoreId);
  if (error) {
    return { success: false, error: { code: 'DELETE_FAILED', message: error.message } };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath(`/students/${studentId}/records`);
  return { success: true, message: 'Score deleted.' };
}

// -------------------------------------------------------------
// Student Clubs
// -------------------------------------------------------------
export async function upsertStudentClubAction(
  input: unknown
): Promise<ActionResult<StudentClubRow>> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } };
  }

  const parsed = studentClubSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid club data.', details: parsed.error.flatten().fieldErrors } };
  }

  const payload = parsed.data;

  try {
    const { data, error } = await supabase
      .from('student_clubs')
      .upsert(
        {
          id: payload.id,
          student_id: payload.studentId,
          club_name: payload.clubName,
          active_grades: payload.activeGrades ?? null,
          role_title: payload.roleTitle ?? null,
          activity_period: payload.activityPeriod ?? null,
          detailed_description: payload.detailedDescription,
          display_order: payload.displayOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save club record: ${error?.message}`);
    }

    revalidatePath(`/students/${payload.studentId}`);
    revalidatePath(`/students/${payload.studentId}/records`);
    return { success: true, data: data as StudentClubRow, message: 'Club record saved.' };
  } catch (err) {
    return { success: false, error: { code: 'DB_ERROR', message: err instanceof Error ? err.message : 'Database error.' } };
  }
}

export async function deleteStudentClubAction(
  clubId: string,
  studentId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } };
  }

  const { error } = await supabase.from('student_clubs').delete().eq('id', clubId);
  if (error) {
    return { success: false, error: { code: 'DELETE_FAILED', message: error.message } };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath(`/students/${studentId}/records`);
  return { success: true, message: 'Club removed.' };
}

// -------------------------------------------------------------
// Student Awards
// -------------------------------------------------------------
export async function upsertStudentAwardAction(
  input: unknown
): Promise<ActionResult<StudentAwardRow>> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } };
  }

  const parsed = studentAwardSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid award data.', details: parsed.error.flatten().fieldErrors } };
  }

  const payload = parsed.data;

  try {
    const { data, error } = await supabase
      .from('student_awards')
      .upsert(
        {
          id: payload.id,
          student_id: payload.studentId,
          award_title: payload.awardTitle,
          award_scope: payload.awardScope,
          award_rank: payload.awardRank ?? null,
          award_date: payload.awardDate ?? null,
          grade_level_at_award: payload.gradeLevelAtAward ?? null,
          issuing_organization: payload.issuingOrganization ?? null,
          detailed_description: payload.detailedDescription,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save award record: ${error?.message}`);
    }

    revalidatePath(`/students/${payload.studentId}`);
    revalidatePath(`/students/${payload.studentId}/records`);
    return { success: true, data: data as StudentAwardRow, message: 'Award record saved.' };
  } catch (err) {
    return { success: false, error: { code: 'DB_ERROR', message: err instanceof Error ? err.message : 'Database error.' } };
  }
}

export async function deleteStudentAwardAction(
  awardId: string,
  studentId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireCounselor();
  if (!supabase || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } };
  }

  const { error } = await supabase.from('student_awards').delete().eq('id', awardId);
  if (error) {
    return { success: false, error: { code: 'DELETE_FAILED', message: error.message } };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath(`/students/${studentId}/records`);
  return { success: true, message: 'Award removed.' };
}
