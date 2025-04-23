import { BaseResponse, PaginatedResponse } from "../dto";

import { Course } from "./course.schema";

/**
 * DTO interfaces for Course API operations
 */
export interface CreateCourseData {
  code: string;
  name: string;
  description: string;
  price: number;
  isOpening: boolean;
  credit: number;
  isHavePracticeClass: boolean;
  isUseForCalculateScore: boolean;
  minCreditCanApply: number;
  majorId: string;
  compulsoryCourseId?: string;
  parallelCourseId?: string;
}

export interface UpdateCourseData {
  name: string;
  description: string;
  price: number;
  majorId: string;
  isActive: boolean;
}

export interface CourseResponse extends BaseResponse<Course> {}

export interface CourseListResponse extends PaginatedResponse<Course> {}
