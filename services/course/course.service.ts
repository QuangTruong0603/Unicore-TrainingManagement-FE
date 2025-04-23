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

      // Add the new filter parameters
      ...(query.filters?.priceRange && {
        "Filter.MinPrice": query.filters.priceRange[0].toString(),
        "Filter.MaxPrice": query.filters.priceRange[1].toString(),
      }),
      ...(query.filters?.creditRange && {
        "Filter.MinCredit": query.filters.creditRange[0].toString(),
        "Filter.MaxCredit": query.filters.creditRange[1].toString(),
      }),
      ...(query.filters?.majorIds?.length && {
        "Filter.MajorIds": query.filters.majorIds.join(","),
      }),
      ...(query.filters?.isOpening !== undefined &&
        query.filters.isOpening !== null && {
          "Filter.IsOpening": query.filters.isOpening.toString(),
        }),
      ...(query.filters?.isHavePracticeClass !== undefined &&
        query.filters.isHavePracticeClass !== null && {
          "Filter.IsHavePracticeClass":
            query.filters.isHavePracticeClass.toString(),
        }),
      ...(query.filters?.isUseForCalculateScore !== undefined &&
        query.filters.isUseForCalculateScore !== null && {
          "Filter.IsUseForCalculateScore":
            query.filters.isUseForCalculateScore.toString(),
        }),
      ...(query.filters?.minCreditCanApply !== undefined &&
        query.filters.minCreditCanApply > 0 && {
          "Filter.MinCreditCanApply":
            query.filters.minCreditCanApply.toString(),
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
