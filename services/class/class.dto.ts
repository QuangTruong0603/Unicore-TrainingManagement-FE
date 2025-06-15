import { BaseResponse, PaginatedResponse } from "../dto";

import { AcademicClass } from "./class.schema";

export interface ScheduleInDayCreateDto {
  dayOfWeek: string;
  roomId: string;
  academicClassId: string;
}

export interface ScheduleInDayCreateForClassDto {
  dayOfWeek: string;
  roomId: string;
  shiftId: string;
}

export interface AcademicClassCreateDto {
  name: string;
  groupNumber: number;
  capacity: number;
  listOfWeeks: number[];
  isRegistrable: boolean;
  courseId: string;
  semesterId: string;
  minEnrollmentRequired: number;
  parentTheoryAcademicClassId: string | null;
  scheduleInDays: ScheduleInDayCreateForClassDto[];
}

export interface ClassRegistrationScheduleDto {
  academicClassIds: string[];
  registrationOpenTime: Date;
  registrationCloseTime: Date;
}

export interface AcademicClassResponse extends BaseResponse<AcademicClass> {}

export interface AcademicClassListResponse
  extends PaginatedResponse<AcademicClass> {}
