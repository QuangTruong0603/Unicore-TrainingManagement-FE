import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { CourseQuery } from "./course.schema";
import {
  CourseListResponse,
  CourseResponse,
  CreateCourseData,
  UpdateCourseData,
} from "./course.dto";

export const courseService = {
  getCourses: async (query: CourseQuery): Promise<CourseListResponse> => {
    const params = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
      ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
      ...(query.orderBy && { "Order.OrderBy": query.orderBy }),
      ...(query.isDesc !== undefined && {
        "Order.IsDesc": query.isDesc.toString(),
      }),

      ...(query.filters?.creditRange && {
        "Filter.MinCredit": query.filters.creditRange[0].toString(),
        "Filter.MaxCredit": query.filters.creditRange[1].toString(),
      }),
      ...(query.filters?.majorIds?.length && {
        "Filter.MajorIds": query.filters.majorIds.join(","),
      }),
      ...(query.filters?.isRegistrable !== undefined &&
        query.filters.isRegistrable !== null && {
          "Filter.IsRegistrable": query.filters.isRegistrable.toString(),
        }),
      ...(query.filters?.practicePeriod !== undefined &&
        query.filters.practicePeriod > 0 && {
          "Filter.practicePeriod": query.filters.practicePeriod.toString(),
        }),
      ...(query.filters?.isRequired !== undefined &&
        query.filters.isRequired !== null && {
          "Filter.IsRequired": query.filters.isRequired.toString(),
        }),
      ...(query.filters?.minCreditRequired !== undefined &&
        query.filters.minCreditRequired > 0 && {
          "Filter.MinCreditRequired":
            query.filters.minCreditRequired.toString(),
        }),
    };

    return courseClient.get(`${API_ENDPOINTS.COURSES}/page`, {
      params,
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

  deleteCourse: async (id: string): Promise<void> => {
    return courseClient.delete(`${API_ENDPOINTS.COURSES}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
