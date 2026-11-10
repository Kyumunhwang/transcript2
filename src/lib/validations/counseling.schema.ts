import { z } from 'zod';

export const createCounselingLogSchema = z.object({
  studentId: z.string().uuid({ message: 'Valid student ID is required.' }),
  counselorName: z.string().min(1, { message: 'Counselor name is required.' }),
  counselingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format.' }),
  sessionTopic: z
    .string()
    .min(2, { message: 'Session topic must be at least 2 characters.' })
    .max(150, { message: 'Session topic cannot exceed 150 characters.' }),
  content: z
    .string()
    .min(5, { message: 'Counseling content must be at least 5 characters.' }),
  actionItems: z.string().optional().nullable(),
  isPinned: z.boolean().default(false),
});

export type CreateCounselingLogInput = z.infer<typeof createCounselingLogSchema>;

export const updateCounselingLogSchema = createCounselingLogSchema.extend({
  id: z.string().uuid({ message: 'Valid log ID is required.' }),
});

export type UpdateCounselingLogInput = z.infer<typeof updateCounselingLogSchema>;

export const togglePinCounselingSchema = z.object({
  id: z.string().uuid({ message: 'Valid log ID is required.' }),
  studentId: z.string().uuid({ message: 'Valid student ID is required.' }),
  isPinned: z.boolean(),
});

export type TogglePinCounselingInput = z.infer<typeof togglePinCounselingSchema>;

export const deleteCounselingLogSchema = z.object({
  id: z.string().uuid({ message: 'Valid log ID is required.' }),
  studentId: z.string().uuid({ message: 'Valid student ID is required.' }),
});

export type DeleteCounselingLogInput = z.infer<typeof deleteCounselingLogSchema>;
