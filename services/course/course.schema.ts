import { z } from "zod";

export const courseCertificateSchema = z.object({
  certificateId: z.string(),
  name: z.string(),
  requiredScore: z.number(),
});

export const courseMaterialSchema = z.object({
  materialId: z.string(),
  name: z.string(),
  fileUrl: z.string(),
});

export const majorSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  costPerCredit: z.number(),
});

export const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  isRegistrable: z.boolean(),
  credit: z.number(),
  practicePeriod: z.number(),
  isRequired: z.boolean(),
  majorId: z.string(),
  major: majorSchema,
  minCreditRequired: z.number().nullable(),
  preCourseIds: z.array(z.string()).nullable(),
  parallelCourseIds: z.array(z.string()).nullable(),
  courseCertificates: z.array(courseCertificateSchema),
  courseMaterials: z.array(courseMaterialSchema),
});

export type Course = z.infer<typeof courseSchema>;

export const courseFilterSchema = z.object({
  creditRange: z.tuple([z.number(), z.number()]).optional(),
  majorIds: z.array(z.string()).optional(),
  isRegistrable: z.boolean().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  practicePeriod: z.number().optional(),
  isRequired: z.boolean().nullable().optional(),
  minCreditRequired: z.number().optional(),
  preCourseIds: z.array(z.string()).optional(),
  parallelCourseIds: z.array(z.string()).optional(),
});

export type CourseFilter = z.infer<typeof courseFilterSchema>;

export const courseQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: courseFilterSchema.optional(),
});

export type CourseQuery = z.infer<typeof courseQuerySchema>;
