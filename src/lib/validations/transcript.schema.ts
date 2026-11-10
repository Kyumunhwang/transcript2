import { z } from 'zod';

export const parsedCourseSchema = z.object({
  courseCode: z.string().nullable().optional(),
  courseName: z.string().min(1, 'Course name is required.'),
  credits: z.number().min(0),
  letterGrade: z.string().min(1),
  gradePoints: z.number().nullable().optional(),
  isHonorsOrAp: z.boolean().default(false),
});

export const parsedTermSchema = z.object({
  academicYear: z.string().min(4),
  semester: z.string().min(1),
  gradeLevelAtTerm: z.number().int().min(7).max(12).nullable().optional(),
  termGpaUnweighted: z.number().nullable().optional(),
  termGpaWeighted: z.number().nullable().optional(),
  totalCredits: z.number().default(0),
  courses: z.array(parsedCourseSchema),
});

export const transcriptCommitSchema = z.object({
  previews: z.array(
    z.object({
      sourceFileName: z.string(),
      matchedStudentId: z.string().min(1, 'Valid matched student ID is required.'),
      extractedStudentCode: z.string().nullable().optional(),
      extractedStudentName: z.string(),
      cumulativeGpaUnweighted: z.number().nullable().optional(),
      cumulativeGpaWeighted: z.number().nullable().optional(),
      terms: z.array(parsedTermSchema),
    })
  ),
});

export type TranscriptCommitInput = z.infer<typeof transcriptCommitSchema>;
