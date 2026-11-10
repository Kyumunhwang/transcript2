import { z } from 'zod';

export const proposerTypeEnum = z.enum(['TEACHER', 'STUDENT', 'BOTH']);
export type ProposerType = z.infer<typeof proposerTypeEnum>;

export const createTargetUniversitySchema = z.object({
  studentId: z.string().uuid({ message: 'Valid student ID is required.' }),
  universityName: z
    .string()
    .min(2, { message: 'University name must be at least 2 characters.' })
    .max(120, { message: 'University name cannot exceed 120 characters.' }),
  countryOrRegion: z.string().optional().nullable(),
  intendedMajor: z.string().optional().nullable(),
  proposerType: proposerTypeEnum.default('TEACHER'),
  applicationRound: z.string().optional().nullable(), // e.g., 'ED1', 'EA', 'RD'
  pros: z.string().optional().nullable(),
  cons: z.string().optional().nullable(),
  strategicNotes: z.string().optional().nullable(),
  priorityOrder: z.number().int().min(0).default(0),
});

export type CreateTargetUniversityInput = z.infer<
  typeof createTargetUniversitySchema
>;

export const updateTargetUniversitySchema = createTargetUniversitySchema.extend({
  id: z.string().uuid({ message: 'Valid university ID is required.' }),
});

export type UpdateTargetUniversityInput = z.infer<
  typeof updateTargetUniversitySchema
>;

export const deleteTargetUniversitySchema = z.object({
  id: z.string().uuid({ message: 'Valid university ID is required.' }),
  studentId: z.string().uuid({ message: 'Valid student ID is required.' }),
});

export type DeleteTargetUniversityInput = z.infer<
  typeof deleteTargetUniversitySchema
>;
