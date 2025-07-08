import { z } from "zod";

import { grpcStudentDataSchema } from "../enrollment/enrollment.schema";

// Exam gRPC Room Data Schema
export const examGrpcRoomDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  availableSeats: z.number(),
  floorId: z.string(),
});

// Exam gRPC Academic Class Data Schema
export const examGrpcAcademicClassDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  groupNumber: z.number(),
  capacity: z.number(),
  listOfWeeks: z.array(z.number()).nullable(),
  isRegistrable: z.boolean(),
  semesterId: z.string(),
  courseId: z.string(),
});

// Exam Create Schema
export const examCreateSchema = z.object({
  group: z.number().min(1, "Group must be greater than 0"),
  type: z.number().min(1, "Type must be greater than 0"),
  examTime: z.date(),
  duration: z.number().min(1, "Duration must be greater than 0"),
  academicClassId: z.string().min(1, "Academic Class ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
});

// Enrollment Exam Read Schema
export const enrollmentExamReadDtoSchema = z.object({
  id: z.string(),
  examId: z.string(),
  enrollmentId: z.string(),
  studentId: z.string(),
  student: grpcStudentDataSchema.nullable(),
});

// Exam Read Schema
export const examReadSchema = z.object({
  id: z.string(),
  group: z.number(),
  type: z.number(),
  examTime: z.string(),
  duration: z.number(),
  academicClassId: z.string(),
  roomId: z.string(),
  totalEnrollment: z.number(),
  room: examGrpcRoomDataSchema.nullable(),
  academicClass: examGrpcAcademicClassDataSchema.nullable(),
  enrollmentExams: z.array(enrollmentExamReadDtoSchema).nullable(),
});

// Exam List Filter Schema
export const examListFilterSchema = z.object({
  academicClassId: z.string().optional(),
  roomId: z.string().optional(),
  type: z.number().optional(),
  minExamTime: z.date().optional(),
  maxExamTime: z.date().optional(),
});

// Exam Query Schema
export const examQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: examListFilterSchema.optional(),
});

// Type exports
export type ExamGrpcRoomData = z.infer<typeof examGrpcRoomDataSchema>;
export type ExamGrpcAcademicClassData = z.infer<
  typeof examGrpcAcademicClassDataSchema
>;
export type ExamCreate = z.infer<typeof examCreateSchema>;
export type ExamRead = z.infer<typeof examReadSchema>;
export type ExamListFilter = z.infer<typeof examListFilterSchema>;
export type ExamQuery = z.infer<typeof examQuerySchema>;
export type Exam = ExamRead;
export type EnrollmentExamReadDto = z.infer<typeof enrollmentExamReadDtoSchema>;
