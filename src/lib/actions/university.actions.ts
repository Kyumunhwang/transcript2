'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import {
  createTargetUniversitySchema,
  updateTargetUniversitySchema,
  deleteTargetUniversitySchema,
} from '@/lib/validations/university.schema';
import type { ActionResult, TargetUniversityRow } from '@/types/domain.types';

export async function getTargetUniversitiesAction(
  studentId: string
): Promise<ActionResult<TargetUniversityRow[]>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('target_universities')
        .select('*')
        .eq('student_id', studentId)
        .order('priority_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && data) return { success: true, data };
    } catch {
      // Fall through to empty demo list
    }
  }

  return { success: true, data: [] };
}

export async function createTargetUniversityAction(
  input: unknown
): Promise<ActionResult<TargetUniversityRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = createTargetUniversitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const {
    studentId, universityName, countryOrRegion, intendedMajor,
    proposerType, applicationRound, pros, cons, strategicNotes, priorityOrder,
  } = parsed.data;

  try {
    const { data, error } = await supabase
      .from('target_universities')
      .insert({
        student_id: studentId,
        university_name: universityName,
        country_or_region: countryOrRegion || null,
        intended_major: intendedMajor || null,
        proposer_type: proposerType,
        application_round: applicationRound || null,
        pros: pros || null,
        cons: cons || null,
        strategic_notes: strategicNotes || null,
        priority_order: priorityOrder,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: { code: 'INSERT_ERROR', message: error?.message ?? 'Failed.' } };
    }

    revalidatePath(`/students/${studentId}/universities`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, data, message: 'Target university added.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}

export async function updateTargetUniversityAction(
  input: unknown
): Promise<ActionResult<TargetUniversityRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = updateTargetUniversitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const {
    id, studentId, universityName, countryOrRegion, intendedMajor,
    proposerType, applicationRound, pros, cons, strategicNotes, priorityOrder,
  } = parsed.data;

  try {
    const { data, error } = await supabase
      .from('target_universities')
      .update({
        university_name: universityName,
        country_or_region: countryOrRegion || null,
        intended_major: intendedMajor || null,
        proposer_type: proposerType,
        application_round: applicationRound || null,
        pros: pros || null,
        cons: cons || null,
        strategic_notes: strategicNotes || null,
        priority_order: priorityOrder,
      })
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: { code: 'UPDATE_ERROR', message: error?.message ?? 'Failed.' } };
    }

    revalidatePath(`/students/${studentId}/universities`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, data, message: 'Target university updated.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}

export async function deleteTargetUniversityAction(
  input: unknown
): Promise<ActionResult<void>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = deleteTargetUniversitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters.' } };
  }

  const { id, studentId } = parsed.data;

  try {
    const { error } = await supabase
      .from('target_universities')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId);

    if (error) return { success: false, error: { code: 'DELETE_ERROR', message: error.message } };

    revalidatePath(`/students/${studentId}/universities`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, message: 'University removed.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}
