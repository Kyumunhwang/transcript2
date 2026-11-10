'use server';

import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import { creditMakeupSchema } from '@/lib/validations/credit-makeup.schema';
import {
  calculateTermGpa,
  calculateCumulativeGpa,
  getBaseGradePoints,
} from '@/lib/pdf-parser/gpa-calculator';
import type { ActionResult, CourseGradeRow, CreditMakeupResult } from '@/types/domain.types';
import { revalidatePath } from 'next/cache';

/**
 * Updates a course grade via Credit Make-up and recalculates term and cumulative GPA. (SKILL-02)
 */
export async function updateCourseGradeMakeupAction(
  input: unknown
): Promise<ActionResult<CreditMakeupResult>> {
  const { user, supabase } = await getAuthenticatedCounselor();

  if (!user || !supabase) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' },
    };
  }

  const parsed = creditMakeupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid Credit Make-up input parameters.',
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { courseId, newLetterGrade, newGradePoints, makeupNote, makeupDate } =
    parsed.data;

  try {
    // 1. Fetch target course
    const { data: targetCourse, error: fetchError } = await supabase
      .from('course_grades')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError || !targetCourse) {
      return {
        success: false,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course record could not be found.' },
      };
    }

    const termId = targetCourse.term_id;
    const studentId = targetCourse.student_id;

    // 2. Preserve original grade on first make-up
    const originalLetter =
      targetCourse.original_letter_grade ?? targetCourse.letter_grade;
    const originalPoints =
      targetCourse.original_grade_points ?? targetCourse.grade_points;

    const calculatedPoints =
      newGradePoints !== undefined && newGradePoints !== null
        ? newGradePoints
        : getBaseGradePoints(newLetterGrade);

    // 3. Update course record with Credit Make-up tagging
    const { error: updateCourseError } = await supabase
      .from('course_grades')
      .update({
        letter_grade: newLetterGrade.toUpperCase(),
        grade_points: calculatedPoints,
        is_credit_makeup: true,
        original_letter_grade: originalLetter,
        original_grade_points: originalPoints,
        makeup_date: makeupDate ?? new Date().toISOString().split('T')[0],
        makeup_note: makeupNote,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId);

    if (updateCourseError) {
      throw new Error(`Failed to update course grade: ${updateCourseError.message}`);
    }

    // 4. Recalculate term GPA
    const { data: termCourses, error: termCoursesError } = await supabase
      .from('course_grades')
      .select('*')
      .eq('term_id', termId);

    if (termCoursesError || !termCourses) {
      throw new Error('Failed to fetch updated term courses.');
    }

    const termGpa = calculateTermGpa(termCourses as CourseGradeRow[]);

    await supabase
      .from('academic_terms')
      .update({
        term_gpa_unweighted: termGpa.unweightedGpa,
        term_gpa_weighted: termGpa.weightedGpa,
        total_credits: termGpa.totalCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', termId);

    // 5. Recalculate cumulative GPA across all terms for the student
    const { data: allTerms, error: allTermsError } = await supabase
      .from('academic_terms')
      .select('term_gpa_unweighted, term_gpa_weighted, total_credits')
      .eq('student_id', studentId);

    if (allTermsError || !allTerms) {
      throw new Error('Failed to fetch student academic terms.');
    }

    const cumulativeGpa = calculateCumulativeGpa(allTerms);

    await supabase
      .from('students')
      .update({
        cumulative_gpa_unweighted: cumulativeGpa.cumulativeUnweightedGpa,
        cumulative_gpa_weighted: cumulativeGpa.cumulativeWeightedGpa,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    revalidatePath(`/students/${studentId}`);
    revalidatePath(`/students/${studentId}/records`);

    return {
      success: true,
      data: {
        updatedTermGpaWeighted: termGpa.weightedGpa,
        updatedCumulativeGpaWeighted: cumulativeGpa.cumulativeWeightedGpa,
      },
      message: 'Credit Make-up recorded and GPAs recalculated successfully.',
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'MAKEUP_UPDATE_FAILED',
        message: err instanceof Error ? err.message : 'Failed to process Credit Make-up.',
      },
    };
  }
}
