import { z } from "zod";

import { courseSchema } from "../course/course.schema";
import { semesterSchema } from "../semester/semester.schema";

const timeSpanSchema = z.string().refine(
  (value) => {
    const parts = value.split(":");

    return parts.length === 3 && parts.every((p) => !isNaN(parseInt(p)));
  },
  {
    message: "TimeSpan must be in HH:mm:ss format",
  }
);

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  availableSeats: z.number(),
  floorId: z.string(),
});

export const shiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: timeSpanSchema,
  endTime: timeSpanSchema,
});

export const scheduleInDaySchema = z.object({
  id: z.string(),
  dayOfWeek: z.string(),
  roomId: z.string(),
  room: roomSchema,
  shiftId: z.string(),
  shift: shiftSchema,
});

export const academicClassBasic = z.object({
  id: z.string(),
  name: z.string(),
  groupNumber: z.number(),
  capacity: z.number(),
  listOfWeeks: z.array(z.number()),
  isRegistrable: z.boolean(),
  courseId: z.string(),
  course: courseSchema,
  semesterId: z.string(),
  semester: semesterSchema,
  scheduleInDays: z.array(scheduleInDaySchema),
  registrationOpenTime: z.date().optional(),
  registrationCloseTime: z.date().optional(),
  enrollmentCount: z.number(),
  minEnrollmentRequired: z.number().optional(),
  enrollmentStatus: z.number().optional(),
  lecturerId: z.string().optional(),
});

export const academicClassSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    groupNumber: z.number(),
    capacity: z.number(),
    listOfWeeks: z.array(z.number()),
    isRegistrable: z.boolean(),
    courseId: z.string(),
    course: courseSchema,
    semesterId: z.string(),
    semester: semesterSchema,
    parentTheoryAcademicClassId: z.string().optional(),
    parentTheoryAcademicClass: z.lazy(() => academicClassBasic).optional(),
    childPracticeAcademicClassIds: z.array(z.string()),
    childPracticeAcademicClasses: z.array(z.lazy(() => academicClassBasic)),
    scheduleInDays: z.array(scheduleInDaySchema),
    registrationOpenTime: z.date().optional(),
    registrationCloseTime: z.date().optional(),
    enrollmentCount: z.number(),
    minEnrollmentRequired: z.number().optional(),
    enrollmentStatus: z.number().optional(),
    lecturerId: z.string().optional(),
  })
);

export type AcademicClass = z.infer<typeof academicClassSchema>;

export const academicClassFilterSchema = z.object({
  name: z.string().optional(),
  groupNumber: z.number().optional(),
  minCapacity: z.number().optional(),
  maxCapacity: z.number().optional(),
  isRegistrable: z.boolean().optional(),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
  shiftId: z.string().optional(),
  roomId: z.string().optional(),
  scheduleInDayIds: z.array(z.string()).optional(),
  enrollmentStatus: z.number().optional(),
  lecturerId: z.string().optional(),
});

export type AcademicClassFilter = z.infer<typeof academicClassFilterSchema>;

export const academicClassQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: academicClassFilterSchema.optional(),
});

export type AcademicClassQuery = z.infer<typeof academicClassQuerySchema>;
