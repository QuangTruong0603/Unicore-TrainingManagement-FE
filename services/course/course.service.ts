import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { Course, CourseQuery } from "./course.schema";
import {
  CourseListResponse,
  CourseResponse,
  CreateCourseData,
  UpdateCourseData,
} from "./course.dto";

export const courseService = {
  getCourses: async (query: CourseQuery): Promise<CourseListResponse> => {
    // Start with the basic params
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    };

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] =
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1);
    }

    if (query.isDesc !== undefined) {
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    if (query.filters?.name) {
      params["Filter.Name"] = query.filters.name;
    }

    if (query.filters?.code) {
      params["Filter.Code"] = query.filters.code;
    }

    // Add credit range if provided
    if (query.filters?.creditRange) {
      params["Filter.MinCredit"] = query.filters.creditRange[0].toString();
      params["Filter.MaxCredit"] = query.filters.creditRange[1].toString();
    }

    // Add boolean filters if provided
    if (
      query.filters?.isOpenForAll !== undefined &&
      query.filters.isOpenForAll !== null
    ) {
      params["Filter.IsOpenForAll"] = query.filters.isOpenForAll.toString();
    }

    if (
      query.filters?.isActive !== undefined &&
      query.filters.isActive !== null
    ) {
      params["Filter.IsActive"] = query.filters.isActive.toString();
    }

    if (
      query.filters?.isRequired !== undefined &&
      query.filters.isRequired !== null
    ) {
      params["Filter.IsRequired"] = query.filters.isRequired.toString();
    }

    // Create URLSearchParams object to handle multiple values for the same parameter
    const searchParams = new URLSearchParams();

    // Add all basic params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    if (query.filters?.majorIds?.length) {
      query.filters.majorIds.forEach((id) => {
        searchParams.append("Filter.MajorIds", id);
      });
    }

    // Add preCourseIds as multiple parameters with the same name
    if (query.filters?.preCourseIds?.length) {
      query.filters.preCourseIds.forEach((id) => {
        searchParams.append("Filter.PreCourseIds", id);
      });
    }

    // Add parallelCourseIds as multiple parameters with the same name
    if (query.filters?.parallelCourseIds?.length) {
      query.filters.parallelCourseIds.forEach((id) => {
        searchParams.append("Filter.ParallelCourseIds", id);
      });
    }

    return courseClient.get(`${API_ENDPOINTS.COURSES}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  createCourse: async (data: CreateCourseData): Promise<CourseResponse> => {
    return courseClient.post(API_ENDPOINTS.COURSES, data);
  },

  updateCourse: async (
    id: string,
    data: UpdateCourseData
  ): Promise<CourseResponse> => {
    return courseClient.put(`${API_ENDPOINTS.COURSES}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  activateCourse: async (id: string) => {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deactivateCourse: async (id: string) => {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
  getCoursesByMajorId: async (majorId: string): Promise<{ data: Course[] }> => {
    return courseClient.get(`${API_ENDPOINTS.COURSES}/major/${majorId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
