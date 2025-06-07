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

export interface EnrollmentResponse extends BaseResponse<Enrollment> {}

export interface EnrollmentListResponse extends PaginatedResponse<Enrollment> {}
