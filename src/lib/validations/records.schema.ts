import { z } from 'zod';

export const testTypeEnumSchema = z.enum(['TOEFL', 'SAT', 'PSAT', 'AP']);
export const awardScopeEnumSchema = z.enum(['INTERNAL', 'EXTERNAL']);

export const testScoreSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  testType: testTypeEnumSchema,
  subjectOrDetail: z.string().trim().max(150).nullable().optional(),
  testDate: z.string().nullable().optional(),
  totalScore: z.string().trim().min(1, 'Total score is required.'),
  sectionScores: z.record(z.unknown()).default({}),
  detailedNotes: z.string().trim().nullable().optional(),
});

export const studentClubSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  clubName: z.string().trim().min(1, 'Club name is required.').max(200),
  activeGrades: z.string().trim().max(50).nullable().optional(),
  roleTitle: z.string().trim().max(150).nullable().optional(),
  activityPeriod: z.string().trim().max(100).nullable().optional(),
  detailedDescription: z
    .string()
    .trim()
    .min(3, 'Detailed description of achievements/leadership is required.'),
  displayOrder: z.number().int().default(0),
});

export const studentAwardSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  awardTitle: z.string().trim().min(1, 'Award title is required.').max(255),
  awardScope: awardScopeEnumSchema.default('INTERNAL'),
  awardRank: z.string().trim().max(100).nullable().optional(),
  awardDate: z.string().nullable().optional(),
  gradeLevelAtAward: z.number().int().min(7).max(12).nullable().optional(),
  issuingOrganization: z.string().trim().max(200).nullable().optional(),
  detailedDescription: z
    .string()
    .trim()
    .min(3, 'Detailed description and context are required.'),
});

export type TestScoreInput = z.infer<typeof testScoreSchema>;
export type StudentClubInput = z.infer<typeof studentClubSchema>;
export type StudentAwardInput = z.infer<typeof studentAwardSchema>;
