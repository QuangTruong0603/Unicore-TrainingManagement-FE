import { BaseResponse, PaginatedResponse } from "../dto";

import { Semester } from "./semester.schema";

export interface CreateSemesterData {
  semesterNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  numberOfWeeks: number;
}

export interface UpdateSemesterData {
  semesterNumber?: number;
  year?: number;
  startDate?: Date;
  endDate?: Date;
  numberOfWeeks?: number;
  isActive?: boolean;
}

export interface SemesterResponse extends BaseResponse<Semester> {}

export interface SemesterListResponse extends PaginatedResponse<Semester> {}
