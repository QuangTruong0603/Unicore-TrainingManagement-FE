import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../api";

import { TrainingRoadmapQuery } from "./training-roadmap.schema";
import {
  TrainingRoadmapListResponse,
  TrainingRoadmapResponse,
  CreateTrainingRoadmapData,
  UpdateTrainingRoadmapData,
  AddComponentsToTrainingRoadmapData,
} from "./training-roadmap.dto";

export const trainingRoadmapService = {
  getTrainingRoadmaps: async (
    query: TrainingRoadmapQuery
  ): Promise<TrainingRoadmapListResponse> => {
    // Start with the basic params
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    };

    // Add search query if provided
    if (query.searchQuery) {
      params["Filter.SearchQuery"] = query.searchQuery;
    }

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] =
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1);
    }

    if (query.isDesc !== undefined) {
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    // Add major IDs if provided
    if (query.filters?.majorIds?.length) {
      params["Filter.MajorId"] = query.filters.majorIds.join(",");
    }

    // Add code filter if provided
    if (query.filters?.code) {
      params["Filter.Code"] = query.filters.code;
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return courseClient.get(`${API_ENDPOINTS.TRAINING_ROADMAPS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getTrainingRoadmapById: async (
    id: string
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.get(`${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createTrainingRoadmap: async (
    data: CreateTrainingRoadmapData
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.post(API_ENDPOINTS.TRAINING_ROADMAPS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  updateTrainingRoadmap: async (
    id: string,
    data: UpdateTrainingRoadmapData
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.put(`${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  addComponentsToTrainingRoadmap: async (
    data: AddComponentsToTrainingRoadmapData
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.TRAINING_ROADMAPS}/components`,
      data,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
  createMultipleCourseGroups: async (
    courseGroups: {
      groupName: string;
      courseIds: string[];
      majorId: string | null;
    }[]
  ): Promise<any> => {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES_GROUP}/multiple`,
      courseGroups,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  getCourseGroupsByMajorId: async (majorId: string): Promise<any> => {
    return courseClient.get(`${API_ENDPOINTS.COURSES_GROUP}/major/${majorId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  getOpenForAllCourseGroups: async (): Promise<any> => {
    return courseClient.get(`${API_ENDPOINTS.COURSES_GROUP}/open-for-all`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  activateTrainingRoadmap: async (
    id: string
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deactivateTrainingRoadmap: async (
    id: string
  ): Promise<TrainingRoadmapResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deleteTrainingRoadmap: async (id: string): Promise<BaseResponse<boolean>> => {
    return courseClient.delete(`${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}`);
  },
};
