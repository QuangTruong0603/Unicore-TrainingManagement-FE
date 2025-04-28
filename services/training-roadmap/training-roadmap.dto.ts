import { z } from "zod";

import { BaseResponse, PaginatedResponse } from "../dto";
import { Major } from "../major/major.schema";

import {
  TrainingRoadmap,
  coursesGroupSchema,
  trainingRoadmapCourseSchema
} from "./training-roadmap.schema";

/**
 * DTO interfaces for Training Roadmap API operations
 */

// Simplified course reference for training roadmap relations
export interface CourseReference {
  id: string;
  code: string;
  name: string;
  description: string;
  credit: number;
  majorId: string;
}

export interface CreateTrainingRoadmapData {
  majorId: string;
  name: string;
  description: string;
  code: string;
  startYear: number;
  trainingRoadmapCourses?: {
    courseId: string;
    semesterNumber: number;
  }[];
}

export interface UpdateTrainingRoadmapData {
  majorId?: string;
  name?: string;
  description?: string;
  code?: string;
  startYear?: number;
  trainingRoadmapCourses?: {
    courseId: string;
    semesterNumber: number;
  }[];
}

export interface TrainingRoadmapResponse extends BaseResponse<TrainingRoadmap> {}

export interface TrainingRoadmapListResponse extends PaginatedResponse<TrainingRoadmap> {}