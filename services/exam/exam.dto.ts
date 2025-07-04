import { BaseResponse, PaginatedResponse } from "../dto";

import { Exam } from "./exam.schema";

// Exam Create Request DTO
export interface ExamCreateDto {
  group: number;
  type: number;
  examTime: Date;
  duration: number;
  academicClassId: string;
  roomId: string;
  semesterId?: string;
}

// Exam Update Request DTO
export interface ExamUpdateDto {
  group?: number;
  type?: number;
  examTime?: Date;
  duration?: number;
  academicClassId?: string;
  roomId?: string;
  semesterId?: string;
}

// Exam Filter Parameters for API requests
export interface ExamListFilterParams {
  semesterId?: string;
  courseId?: string;
  academicClassId?: string;
  type?: number;
  minExamTime?: Date;
  maxExamTime?: Date;
}

// Exam Response DTOs
export interface ExamResponse extends BaseResponse<Exam> {}

export interface ExamListResponse extends PaginatedResponse<Exam> {}

export interface ExamCreateResponse extends BaseResponse<Exam> {}

export interface ExamUpdateResponse extends BaseResponse<Exam> {}

export interface ExamDeleteResponse extends BaseResponse<boolean> {}

// Bulk operations DTOs
export interface BulkExamDeleteDto {
  examIds: string[];
}

// Enrollment Exam DTOs
export interface EnrollmentExamDto {
  id: string;
  examId: string;
  enrollmentId: string;
  status: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddEnrollmentToExamDto {
  examId: string;
  enrollmentIds: string[];
}

export interface AddEnrollmentToExamResponse {
  enrollmentExams: EnrollmentExamDto[];
}

export interface AddEnrollmentToExamApiResponse
  extends BaseResponse<EnrollmentExamDto[]> {}

export interface BulkExamDeleteResponse
  extends BaseResponse<{
    deletedCount: number;
    failedIds: string[];
  }> {}

// Exam statistics DTOs
export interface ExamStatisticsDto {
  totalExams: number;
  totalEnrollments: number;
  averagePassRate: number;
  averageScore: number;
  examsByType: { type: number; count: number }[];
  examsByGroup: { group: number; count: number }[];
}

export interface ExamStatisticsResponse
  extends BaseResponse<ExamStatisticsDto> {}

// Exam conflict checking DTOs
export interface ExamConflictCheckDto {
  examTime: Date;
  duration: number;
  roomId: string;
  excludeExamId?: string; // For update operations
}

export interface ExamConflictResult {
  hasConflict: boolean;
  conflictingExams: Exam[];
}

export interface ExamConflictCheckResponse
  extends BaseResponse<ExamConflictResult> {}
