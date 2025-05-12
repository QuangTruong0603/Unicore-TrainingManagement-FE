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

// Major data reference schema
export const majorReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  costPerCredit: z.number().optional(),
});

// CoursesGroup schema
export const coursesGroupSchema = z.object({
  id: z.string(),
  groupName: z.string(),
  majorId: z.string(),
  courses: z.array(courseReferenceSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type CoursesGroup = z.infer<typeof coursesGroupSchema>;

// CoursesGroupSemester schema
export const coursesGroupSemesterSchema = z.object({
  id: z.string(),
  semesterNumber: z.number(),
  coursesGroupId: z.string(),
  trainingRoadmapId: z.string(),
  coursesGroup: coursesGroupSchema.optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export type CoursesGroupSemester = z.infer<typeof coursesGroupSemesterSchema>;

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
  majorData: majorReferenceSchema.optional(),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  startYear: z.number(),
  coursesGroupSemesters: z.array(coursesGroupSemesterSchema),
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

// DTO for adding courses to training roadmap
export const coursesGroupSemesterDtoSchema = z.object({
  semesterNumber: z.number(),
  coursesGroupId: z.string(),
});

export type CoursesGroupSemesterDto = z.infer<
  typeof coursesGroupSemesterDtoSchema
>;

export const trainingRoadmapCourseDtoSchema = z.object({
  courseId: z.string(),
  semesterNumber: z.number(),
});

export type TrainingRoadmapCourseDto = z.infer<
  typeof trainingRoadmapCourseDtoSchema
>;

export const trainingRoadmapAddComponentsDtoSchema = z.object({
  trainingRoadmapId: z.string(),
  coursesGroupSemesters: z.array(coursesGroupSemesterDtoSchema).optional(),
  trainingRoadmapCourses: z.array(trainingRoadmapCourseDtoSchema).optional(),
});

export type TrainingRoadmapAddComponentsDto = z.infer<
  typeof trainingRoadmapAddComponentsDtoSchema
>;
