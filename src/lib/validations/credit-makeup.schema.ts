import { z } from 'zod';

export const creditMakeupSchema = z.object({
  courseId: z.string().uuid('Valid course ID is required.'),
  newLetterGrade: z
    .string()
    .trim()
    .min(1, 'Please select or enter a valid grade.')
    .max(5),
  newGradePoints: z.number().min(0).max(5).optional().nullable(),
  makeupNote: z
    .string()
    .trim()
    .min(3, 'Detailed reason for Credit Make-up is required.'),
  makeupDate: z.string().optional().nullable(),
});

export type CreditMakeupInput = z.infer<typeof creditMakeupSchema>;
