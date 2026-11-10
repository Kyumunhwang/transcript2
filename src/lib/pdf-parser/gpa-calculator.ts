export const STANDARD_GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

export interface CourseGpaInput {
  credits: number;
  letterGrade?: string;
  letter_grade?: string;
  gradePoints?: number | null;
  grade_points?: number | null;
  isHonorsOrAp?: boolean;
  is_honors_or_ap?: boolean;
}

export interface TermGpaInput {
  termGpaUnweighted?: number | null;
  term_gpa_unweighted?: number | null;
  termGpaWeighted?: number | null;
  term_gpa_weighted?: number | null;
  totalCredits?: number | null;
  total_credits?: number | null;
}

export interface TermGpaResult {
  unweightedGpa: number | null;
  weightedGpa: number | null;
  totalCredits: number;
}

export interface CumulativeGpaResult {
  cumulativeUnweightedGpa: number | null;
  cumulativeWeightedGpa: number | null;
  totalCredits: number;
}

/**
 * Returns base grade points for a letter grade.
 */
export function getBaseGradePoints(letterGrade: string): number | null {
  const normalized = letterGrade.trim().toUpperCase();
  return STANDARD_GRADE_POINTS[normalized] ?? null;
}

/**
 * Calculates Unweighted and Weighted GPA for a list of courses in a term. (SKILL-02)
 * Supports both domain DTOs (camelCase) and DB Row schemas (snake_case).
 */
export function calculateTermGpa(courses: CourseGpaInput[]): TermGpaResult {
  let totalCredits = 0;
  let totalUnweightedQualityPoints = 0;
  let totalWeightedQualityPoints = 0;
  let gpaCountableCredits = 0;

  for (const course of courses) {
    const credits = course.credits;
    if (credits <= 0) continue;

    totalCredits += credits;
    const letter = (course.letterGrade ?? course.letter_grade ?? '').trim();
    if (!letter) continue;

    const rawPoints =
      course.gradePoints !== undefined
        ? course.gradePoints
        : course.grade_points !== undefined
          ? course.grade_points
          : getBaseGradePoints(letter);

    // Skip non-letter grade courses like Pass/Fail, Incomplete
    if (rawPoints === null || rawPoints === undefined) continue;

    const isWeighted = Boolean(course.isHonorsOrAp ?? course.is_honors_or_ap);

    gpaCountableCredits += credits;
    totalUnweightedQualityPoints += rawPoints * credits;

    // Honors / AP courses get +1.0 weight unless grade is F (0.0)
    const weightBonus = isWeighted && rawPoints > 0 ? 1.0 : 0.0;
    totalWeightedQualityPoints += (rawPoints + weightBonus) * credits;
  }

  if (gpaCountableCredits === 0) {
    return {
      unweightedGpa: null,
      weightedGpa: null,
      totalCredits: Number(totalCredits.toFixed(2)),
    };
  }

  const unweightedGpa = Number(
    (totalUnweightedQualityPoints / gpaCountableCredits).toFixed(2)
  );
  const weightedGpa = Number(
    (totalWeightedQualityPoints / gpaCountableCredits).toFixed(2)
  );

  return {
    unweightedGpa,
    weightedGpa,
    totalCredits: Number(totalCredits.toFixed(2)),
  };
}

/**
 * Calculates cumulative GPA across all academic terms weighted by term credits.
 * Supports both camelCase and snake_case inputs.
 */
export function calculateCumulativeGpa(
  terms: TermGpaInput[]
): CumulativeGpaResult {
  let totalCumulativeCredits = 0;
  let totalUnweightedProduct = 0;
  let totalWeightedProduct = 0;

  for (const term of terms) {
    const credits = term.totalCredits ?? term.total_credits ?? 0;
    if (credits <= 0) continue;

    const unweighted =
      term.termGpaUnweighted !== undefined
        ? term.termGpaUnweighted
        : term.term_gpa_unweighted;

    const weighted =
      term.termGpaWeighted !== undefined
        ? term.termGpaWeighted
        : term.term_gpa_weighted;

    if (unweighted !== null && unweighted !== undefined && weighted !== null && weighted !== undefined) {
      totalCumulativeCredits += credits;
      totalUnweightedProduct += unweighted * credits;
      totalWeightedProduct += weighted * credits;
    }
  }

  if (totalCumulativeCredits === 0) {
    return {
      cumulativeUnweightedGpa: null,
      cumulativeWeightedGpa: null,
      totalCredits: 0,
    };
  }

  return {
    cumulativeUnweightedGpa: Number(
      (totalUnweightedProduct / totalCumulativeCredits).toFixed(2)
    ),
    cumulativeWeightedGpa: Number(
      (totalWeightedProduct / totalCumulativeCredits).toFixed(2)
    ),
    totalCredits: Number(totalCumulativeCredits.toFixed(2)),
  };
}
