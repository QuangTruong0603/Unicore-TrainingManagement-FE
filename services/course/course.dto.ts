import { z } from "zod";

import { BaseResponse, PaginatedResponse } from "../dto";
import { Major } from "../major/major.schema";

import {
  Course,
  courseCertificateSchema,
  courseMaterialSchema,
} from "./course.schema";

/**
 * DTO interfaces for Course API operations
 */
export interface CreateCourseData {
  name: string;
  description: string;
  cost: number;
  isRegistrable: boolean;
  credit: number;
  practicePeriod: number;
  isRequired: boolean;
  majorId: string;
  major: Major;
  minCreditRequired: number | null;
  preCourseIds: string[] | null;
  parallelCourseId: string[] | null;
  courseCertificates?: z.infer<typeof courseCertificateSchema>[];
  courseMaterials?: z.infer<typeof courseMaterialSchema>[];
}

export interface UpdateCourseData {
  code?: string;
  name?: string;
  description?: string;
  cost?: number;
  isRegistrable?: boolean;
  credit?: number;
  practicePeriod?: number;
  isRequired?: boolean;
  majorId?: string;
  major?: Major;
  minCreditRequired?: number | null;
  preCourseIds?: string[] | null;
  parallelCourseId?: string[] | null;
  courseCertificates?: z.infer<typeof courseCertificateSchema>[];
  courseMaterials?: z.infer<typeof courseMaterialSchema>[];
}

export interface CourseResponse extends BaseResponse<Course> {}

export interface CourseListResponse extends PaginatedResponse<Course> {}
