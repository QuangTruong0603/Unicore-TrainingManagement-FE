import { z } from "zod";

export const courseCertificateSchema = z.object({
  certificateId: z.string(),
  name: z.string(),
  requiredScore: z.number()
});

export const courseMaterialSchema = z.object({
  materialId: z.string(),
  name: z.string(),
  fileUrl: z.string()
});

export const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  isOpening: z.boolean(),
  credit: z.number(),
  isHavePracticeClass: z.boolean(),
  isUseForCalculateScore: z.boolean(),
  minCreditCanApply: z.number(),
  majorId: z.string(),
  compulsoryCourseId: z.string().nullable(),
  parallelCourseId: z.string().nullable(),
  courseCertificates: z.array(courseCertificateSchema),
  courseMaterials: z.array(courseMaterialSchema)
});

export type Course = z.infer<typeof courseSchema>;

export const courseQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false)
});

export type CourseQuery = z.infer<typeof courseQuerySchema>; 