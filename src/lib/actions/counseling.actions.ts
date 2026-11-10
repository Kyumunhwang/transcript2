'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import {
  createCounselingLogSchema,
  updateCounselingLogSchema,
  togglePinCounselingSchema,
  deleteCounselingLogSchema,
} from '@/lib/validations/counseling.schema';
import type { ActionResult, CounselingLogRow } from '@/types/domain.types';

export async function getCounselingLogsAction(
  studentId: string
): Promise<ActionResult<CounselingLogRow[]>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('counseling_logs').select('*').eq('student_id', studentId)
        .order('is_pinned', { ascending: false }).order('counseling_date', { ascending: false });

      if (!error && data) return { success: true, data };
    } catch {
      // Fall through to empty demo logs
    }
  }

  return { success: true, data: [] };
}

export async function createCounselingLogAction(
  input: unknown
): Promise<ActionResult<CounselingLogRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = createCounselingLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const { studentId, counselorName, counselingDate, sessionTopic, content, actionItems, isPinned } = parsed.data;

  try {
    const { data, error } = await supabase
      .from('counseling_logs')
      .insert({
        student_id: studentId,
        counselor_name: counselorName,
        counselor_id: user.id,
        counseling_date: counselingDate,
        session_topic: sessionTopic,
        content,
        action_items: actionItems || null,
        is_pinned: isPinned,
      })
      .select().single();

    if (error || !data) return { success: false, error: { code: 'INSERT_ERROR', message: error?.message ?? 'Failed.' } };

    revalidatePath(`/students/${studentId}/counseling`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, data, message: 'Counseling log saved.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}

export async function updateCounselingLogAction(
  input: unknown
): Promise<ActionResult<CounselingLogRow>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = updateCounselingLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data.', details: parsed.error.flatten().fieldErrors },
    };
  }

  const { id, studentId, counselorName, counselingDate, sessionTopic, content, actionItems, isPinned } = parsed.data;

  try {
    const { data, error } = await supabase
      .from('counseling_logs')
      .update({
        counselor_name: counselorName,
        counseling_date: counselingDate,
        session_topic: sessionTopic,
        content,
        action_items: actionItems || null,
        is_pinned: isPinned,
      })
      .eq('id', id).eq('student_id', studentId).select().single();

    if (error || !data) return { success: false, error: { code: 'UPDATE_ERROR', message: error?.message ?? 'Failed.' } };

    revalidatePath(`/students/${studentId}/counseling`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, data, message: 'Counseling log updated.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}

export async function togglePinCounselingAction(
  input: unknown
): Promise<ActionResult<{ isPinned: boolean }>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = togglePinCounselingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pin parameters.' } };
  }

  const { id, studentId, isPinned } = parsed.data;

  try {
    const { error } = await supabase
      .from('counseling_logs').update({ is_pinned: isPinned }).eq('id', id).eq('student_id', studentId);

    if (error) return { success: false, error: { code: 'PIN_ERROR', message: error.message } };

    revalidatePath(`/students/${studentId}/counseling`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, data: { isPinned }, message: isPinned ? 'Pinned.' : 'Unpinned.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}

export async function deleteCounselingLogAction(
  input: unknown
): Promise<ActionResult<void>> {
  const { user, supabase } = await getAuthenticatedCounselor();
  if (!user || !supabase) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required.' } };
  }

  const parsed = deleteCounselingLogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters.' } };
  }

  const { id, studentId } = parsed.data;

  try {
    const { error } = await supabase
      .from('counseling_logs').delete().eq('id', id).eq('student_id', studentId);

    if (error) return { success: false, error: { code: 'DELETE_ERROR', message: error.message } };

    revalidatePath(`/students/${studentId}/counseling`);
    revalidatePath(`/students/${studentId}`);
    return { success: true, message: 'Deleted.' };
  } catch (err) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } };
  }
}
