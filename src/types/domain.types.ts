import type { Database } from './database.types';

export type StudentRow = Database['public']['Tables']['students']['Row'];
export type AcademicTermRow = Database['public']['Tables']['academic_terms']['Row'];
export type CourseGradeRow = Database['public']['Tables']['course_grades']['Row'];
export type TestScoreRow = Database['public']['Tables']['test_scores']['Row'];
export type StudentClubRow = Database['public']['Tables']['student_clubs']['Row'];
export type StudentAwardRow = Database['public']['Tables']['student_awards']['Row'];
export type CounselingLogRow = Database['public']['Tables']['counseling_logs']['Row'];
export type TargetUniversityRow = Database['public']['Tables']['target_universities']['Row'];

// Standard Server Action & API Response (RULES.md 4.1)
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
      };
    };

// SKILL-01: Gradelink PDF Parsing Specification
export interface ParsedCourseRow {
  courseCode: string | null;
  courseName: string;
  credits: number;
  letterGrade: string;
  gradePoints?: number | null;
  isHonorsOrAp: boolean;
}

export interface ParsedTermBlock {
  academicYear: string; // e.g. "2024-2025"
  semester: string; // e.g. "Semester 1"
  gradeLevelAtTerm: number | null;
  termGpaUnweighted: number | null;
  termGpaWeighted: number | null;
  totalCredits: number;
  courses: ParsedCourseRow[];
}

export type ParseStatus =
  | 'READY'
  | 'UNMATCHED_STUDENT'
  | 'CONTAINS_MAKEUP_CONFLICT'
  | 'PARSE_ERROR';

export interface TranscriptPreviewDTO {
  sourceFileName: string;
  matchedStudentId: string | null;
  extractedStudentCode: string | null;
  extractedStudentName: string;
  parseStatus: ParseStatus;
  conflictCourseCount: number;
  cumulativeGpaUnweighted?: number | null;
  cumulativeGpaWeighted?: number | null;
  terms: ParsedTermBlock[];
  errorMessage?: string;
}

// Credit Makeup Mutation Result
export interface CreditMakeupResult {
  updatedTermGpaWeighted: number | null;
  updatedCumulativeGpaWeighted: number | null;
}

// Student Dashboard Aggregate Type
export interface StudentDashboardData {
  student: StudentRow;
  terms: (AcademicTermRow & { courses: CourseGradeRow[] })[];
  testScores: TestScoreRow[];
  clubs: StudentClubRow[];
  awards: StudentAwardRow[];
  recentCounselingLogs: CounselingLogRow[];
  targetUniversities: TargetUniversityRow[];
}
