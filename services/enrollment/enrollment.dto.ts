import { BaseResponse, PaginatedResponse } from "../dto";

import { Enrollment } from "./enrollment.schema";

export interface MultipleEnrollmentCreateData {
  studentId: string;
  academicClassIds: string[];
}

export interface MultipleEnrollmentCheckRequest {
  studentId: string;
  academicClassIds: string[];
}

export interface EnrollmentCheckResponse
  extends BaseResponse<{ exists: boolean }> {}

export interface MultipleEnrollmentCheckResponse
  extends BaseResponse<{
    results: Array<{ academicClassId: string; exists: boolean }>;
  }> {}

export interface MoveEnrollmentsDto {
  toClassId: string;
  enrollmentIds: string[];
}

// New DTOs for class conflict checking
export interface EnrollmentConflictCheckDto extends Enrollment {
  isConflict: boolean;
}

export interface CheckClassConflictRequest {
  classToCheckId?: string;
  enrollmentIds: string[];
}

export interface CheckClassConflictResponse {
  enrollments: EnrollmentConflictCheckDto[];
}

export interface EnrollmentResponse extends BaseResponse<Enrollment> {}

export interface EnrollmentListResponse extends PaginatedResponse<Enrollment> {}

export interface CheckClassConflictApiResponse
  extends BaseResponse<CheckClassConflictResponse> {}