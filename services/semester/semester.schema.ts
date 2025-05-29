import { z } from "zod";

export const semesterSchema = z.object({
  id: z.string(),
  semesterNumber: z.number(),
  year: z.number(),
  isActive: z.boolean(),
  startDate: z.date(),
  endDate: z.date(),
  numberOfWeeks: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Semester = z.infer<typeof semesterSchema>;

export const semesterFilterSchema = z.object({
  semesterNumber: z.number().optional(),
  year: z.number().optional(),
  isActive: z.boolean().nullable().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  numberOfWeeks: z.number().optional(),
});

export type SemesterFilter = z.infer<typeof semesterFilterSchema>;

export const semesterQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: semesterFilterSchema.optional(),
});

export type SemesterQuery = z.infer<typeof semesterQuerySchema>;
