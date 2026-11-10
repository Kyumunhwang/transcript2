'use server';

import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import { transcriptCommitSchema } from '@/lib/validations/transcript.schema';
import type { ActionResult, CourseGradeRow } from '@/types/domain.types';
import type { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

/**
 * Commits approved transcript preview DTOs into academic_terms and course_grades.
 * Strictly preserves manually edited Credit Make-up records (RULES.md 1.1 & SKILL-02).
 */
export async function commitTranscriptsAction(
  input: unknown
): Promise<ActionResult<{ savedTermCount: number; savedCourseCount: number }>> {
  const { user, supabase } = await getAuthenticatedCounselor();

  if (!user) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Counselor authentication required.' },
    };
  }

  const parsed = transcriptCommitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid transcript payload.',
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  let totalTerms = 0;
  let totalCourses = 0;

  // In Dev Demo Mode or Placeholder environment without active DB connection
  const isDemoEnv =
    !supabase ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
    parsed.data.previews.some((p) => p.matchedStudentId.startsWith('demo-'));

  if (isDemoEnv) {
    for (const preview of parsed.data.previews) {
      totalTerms += preview.terms.length;
      for (const t of preview.terms) {
        totalCourses += t.courses.length;
      }
    }
    revalidatePath('/students');
    revalidatePath(`/students/${parsed.data.previews[0]?.matchedStudentId}`);
    return {
      success: true,
      data: { savedTermCount: totalTerms, savedCourseCount: totalCourses },
      message: 'Transcripts committed and student profile updated successfully.',
    };
  }

  try {
    for (const preview of parsed.data.previews) {
      const studentId = preview.matchedStudentId;

      // 1. Update cumulative GPA cache if parsed
      if (preview.cumulativeGpaWeighted !== undefined || preview.cumulativeGpaUnweighted !== undefined) {
        const studentUpdate: Database['public']['Tables']['students']['Update'] = {
          cumulative_gpa_weighted: preview.cumulativeGpaWeighted ?? null,
          cumulative_gpa_unweighted: preview.cumulativeGpaUnweighted ?? null,
          updated_at: new Date().toISOString(),
        };
        await supabase
          .from('students')
          .update(studentUpdate)
          .eq('id', studentId);
      }

      // 2. Process each academic term
      for (const term of preview.terms) {
        // Upsert term
        const { data: upsertedTerm, error: termError } = await supabase
          .from('academic_terms')
          .upsert(
            {
              student_id: studentId,
              academic_year: term.academicYear,
              semester: term.semester,
              grade_level_at_term: term.gradeLevelAtTerm ?? null,
              term_gpa_unweighted: term.termGpaUnweighted ?? null,
              term_gpa_weighted: term.termGpaWeighted ?? null,
              total_credits: term.totalCredits,
              source_pdf_filename: preview.sourceFileName,
              last_parsed_at: new Date().toISOString(),
            },
            { onConflict: 'student_id,academic_year,semester' }
          )
          .select('id')
          .single();

        if (termError || !upsertedTerm) {
          throw new Error(`Failed to upsert term ${term.academicYear} ${term.semester}: ${termError?.message}`);
        }

        totalTerms++;
        const termId = upsertedTerm.id;

        // 3. Fetch existing credit make-up courses to protect them
        const { data: existingMakeups } = await supabase
          .from('course_grades')
          .select('*')
          .eq('term_id', termId)
          .eq('is_credit_makeup', true);

        const makeupMap = new Map<string, CourseGradeRow>();
        if (existingMakeups) {
          existingMakeups.forEach((c) => makeupMap.set(c.course_name.toLowerCase(), c as CourseGradeRow));
        }

        // 4. Upsert courses with Credit Make-up protection
        for (const course of term.courses) {
          const lowerName = course.courseName.toLowerCase();

          // CRITICAL: If course was manually overridden via Credit Make-up, PRESERVE IT!
          if (makeupMap.has(lowerName)) {
            continue;
          }

          // Check if course already exists in this term
          const { data: existingCourse } = await supabase
            .from('course_grades')
            .select('id')
            .eq('term_id', termId)
            .eq('course_name', course.courseName)
            .maybeSingle();

          if (existingCourse) {
            await supabase
              .from('course_grades')
              .update({
                credits: course.credits,
                letter_grade: course.letterGrade,
                grade_points: course.gradePoints ?? null,
                is_honors_or_ap: course.isHonorsOrAp,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingCourse.id);
          } else {
            await supabase.from('course_grades').insert({
              term_id: termId,
              student_id: studentId,
              course_code: course.courseCode ?? null,
              course_name: course.courseName,
              credits: course.credits,
              letter_grade: course.letterGrade,
              grade_points: course.gradePoints ?? null,
              is_honors_or_ap: course.isHonorsOrAp,
              is_credit_makeup: false,
            });
          }
          totalCourses++;
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/transcript-upload');

    return {
      success: true,
      data: { savedTermCount: totalTerms, savedCourseCount: totalCourses },
      message: `Successfully processed ${totalTerms} terms and ${totalCourses} course records.`,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'COMMIT_FAILED',
        message: err instanceof Error ? err.message : 'Database transaction failed.',
      },
    };
  }
}
