import { z } from "zod";

// Basic course reference schema (to avoid circular dependencies)
export const courseReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  credit: z.number(),
  majorId: z.string(),
});

// CoursesGroup schema
export const coursesGroupSchema = z.object({
  id: z.string(),
  semesterNumber: z.number(),
  courses: z.array(courseReferenceSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type CoursesGroup = z.infer<typeof coursesGroupSchema>;

// TrainingRoadmapCourse schema
export const trainingRoadmapCourseSchema = z.object({
  id: z.string(),
  trainingRoadmapId: z.string(),
  courseId: z.string(),
  course: courseReferenceSchema,
  semesterNumber: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type TrainingRoadmapCourse = z.infer<typeof trainingRoadmapCourseSchema>;

// TrainingRoadmap schema
export const trainingRoadmapSchema = z.object({
  id: z.string(),
  majorId: z.string(),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  startYear: z.number(),
  coursesGroups: z.array(coursesGroupSchema),
  trainingRoadmapCourses: z.array(trainingRoadmapCourseSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type TrainingRoadmap = z.infer<typeof trainingRoadmapSchema>;

// TrainingRoadmap filter schema
export const trainingRoadmapFilterSchema = z.object({
  majorIds: z.array(z.string()).optional(),
  startYearRange: z.tuple([z.number(), z.number()]).optional(),
  code: z.string().optional(),
});

export type TrainingRoadmapFilter = z.infer<typeof trainingRoadmapFilterSchema>;

// TrainingRoadmap query schema
export const trainingRoadmapQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: trainingRoadmapFilterSchema.optional(),
});

export type TrainingRoadmapQuery = z.infer<typeof trainingRoadmapQuerySchema>;