import { BaseResponse, PaginatedResponse } from "../dto";

import { Semester } from "./semester.schema";

export interface CreateSemesterData {
  semesterNumber: number;
  year: number;
}

export interface UpdateSemesterData {
  semesterNumber?: number;
  year?: number;
  isActive?: boolean;
}

export interface SemesterResponse extends BaseResponse<Semester> {}

export interface SemesterListResponse extends PaginatedResponse<Semester> {}
