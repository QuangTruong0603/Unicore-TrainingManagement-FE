import { z } from "zod";

// User Data Schema
export const grpcUserDataSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  personId: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

// Student Data Schema
export const grpcStudentDataSchema = z.object({
  id: z.string(),
  studentCode: z.string().nullable(),
  accumulateCredits: z.number(),
  accumulateScore: z.number(),
  accumulateActivityScore: z.number(),
  majorId: z.string(),
  batchId: z.string(),
  applicationUserId: z.string(),
  user: grpcUserDataSchema.nullable(),
});

// Semester Data Schema
export const grpcSemesterDataSchema = z.object({
  id: z.string(),
  semesterNumber: z.number(),
  year: z.number(),
  isActive: z.boolean(),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  numberOfWeeks: z.number(),
});

// Course Data Schema
export const grpcCourseDataSchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  credit: z.number(),
  practicePeriod: z.number(),
  isRequired: z.boolean(),
  cost: z.number(),
});

// Room Data Schema
export const grpcRoomDataSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  capacity: z.number(),
  description: z.string().nullable(),
  isActive: z.boolean(),
});

// Shift Data Schema
export const grpcShiftDataSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

// Schedule In Day Data Schema
export const grpcScheduleInDayDataSchema = z.object({
  id: z.string(),
  dayOfWeek: z.string().nullable(),
  roomId: z.string(),
  room: grpcRoomDataSchema.nullable(),
  shiftId: z.string(),
  shift: grpcShiftDataSchema.nullable(),
});

// Academic Class Data Schema
export const grpcAcademicClassDataSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  groupNumber: z.number(),
  capacity: z.number(),
  listOfWeeks: z.array(z.number()).nullable(),
  isRegistrable: z.boolean(),
  semesterId: z.string(),
  semester: grpcSemesterDataSchema.nullable(),
  courseId: z.string(),
  course: grpcCourseDataSchema.nullable(),
  scheduleInDays: z.array(grpcScheduleInDayDataSchema).nullable(),
});

// Main Enrollment Schema
export const enrollmentSchema = z.object({
  id: z.string(),
  status: z.number(),
  studentId: z.string(),
  academicClassId: z.string(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
  student: grpcStudentDataSchema.nullable(),
  academicClass: grpcAcademicClassDataSchema.nullable(),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;
export type GrpcUserData = z.infer<typeof grpcUserDataSchema>;
export type GrpcStudentData = z.infer<typeof grpcStudentDataSchema>;
export type GrpcSemesterData = z.infer<typeof grpcSemesterDataSchema>;
export type GrpcCourseData = z.infer<typeof grpcCourseDataSchema>;
export type GrpcRoomData = z.infer<typeof grpcRoomDataSchema>;
export type GrpcShiftData = z.infer<typeof grpcShiftDataSchema>;
export type GrpcScheduleInDayData = z.infer<typeof grpcScheduleInDayDataSchema>;
export type GrpcAcademicClassData = z.infer<typeof grpcAcademicClassDataSchema>;

// Enrollment Filter Schema
export const enrollmentFilterSchema = z.object({
  status: z.number().optional(),
  academicClassId: z.string().optional(),
  semesterId: z.string().optional(),
  courseId: z.string().optional(),
  studentCode: z.string().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

export type EnrollmentFilter = z.infer<typeof enrollmentFilterSchema>;

// Enrollment Query Schema
export const enrollmentQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: enrollmentFilterSchema.optional(),
});

export type EnrollmentQuery = z.infer<typeof enrollmentQuerySchema>;
