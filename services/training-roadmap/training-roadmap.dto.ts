import { BaseResponse, PaginatedResponse } from "../dto";

import {
  TrainingRoadmap,
  TrainingRoadmapAddComponentsDto,
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
  coursesGroups?: {
    groupName: string;
  }[];
  coursesGroupSemesters?: {
    semesterNumber: number;
    coursesGroupId?: string;
  }[];
  batchIds: string[];
}

export interface UpdateTrainingRoadmapData {
  majorId?: string;
  name?: string;
  description?: string;
  code?: string;
  batchIds?: string[];
  trainingRoadmapCourses?: {
    courseId: string;
    semesterNumber: number;
  }[];
  coursesGroups?: {
    id?: string;
    groupName: string;
  }[];
  coursesGroupSemesters?: {
    id?: string;
    semesterNumber: number;
    coursesGroupId: string;
  }[];
}

export interface AddComponentsToTrainingRoadmapData
  extends TrainingRoadmapAddComponentsDto {}

export interface TrainingRoadmapResponse
  extends BaseResponse<TrainingRoadmap> {}

export interface TrainingRoadmapListResponse
  extends PaginatedResponse<TrainingRoadmap> {}
