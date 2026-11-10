import { z } from 'zod';

export const getStudentsQuerySchema = z.object({
  gradeLevel: z.number().int().min(7).max(12).optional().nullable(),
  search: z.string().trim().max(100).optional(),
});

export type GetStudentsQueryInput = z.infer<typeof getStudentsQuerySchema>;

export const createStudentSchema = z.object({
  nameKo: z.string().min(1, 'Korean name is required.').max(50),
  nameEn: z.string().min(1, 'English name is required.').max(100),
  studentCode: z.string().min(2, 'Student code is required.').max(30),
  gradeLevel: z.coerce.number().int().min(9).max(12),
  expectedGraduationYear: z.coerce.number().int().min(2024).max(2035).optional().nullable(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  basicMemo: z.string().max(500).optional().nullable(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
