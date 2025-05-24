import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { SemesterQuery } from "./semester.schema";
import {
  SemesterListResponse,
  SemesterResponse,
  CreateSemesterData,
  UpdateSemesterData,
} from "./semester.dto";

export const semesterService = {
  getSemesters: async (query: SemesterQuery): Promise<SemesterListResponse> => {
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

    // Add semester filters if provided
    if (query.filters) {
      if (query.filters.semesterNumber !== undefined) {
        params["Filter.SemesterNumber"] =
          query.filters.semesterNumber.toString();
      }

      if (query.filters.year !== undefined) {
        params["Filter.Year"] = query.filters.year.toString();
      }

      if (query.filters.isActive !== undefined) {
        params["Filter.IsActive"] = query.filters.isActive!.toString();
      }
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return courseClient.get(`${API_ENDPOINTS.SEMESTERS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },
  getSemester: async (id: string): Promise<SemesterResponse> => {
    return courseClient.get(`${API_ENDPOINTS.SEMESTERS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createSemester: async (
    data: CreateSemesterData
  ): Promise<SemesterResponse> => {
    return courseClient.post(API_ENDPOINTS.SEMESTERS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  updateSemester: async (
    id: string,
    data: UpdateSemesterData
  ): Promise<SemesterResponse> => {
    return courseClient.put(`${API_ENDPOINTS.SEMESTERS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  activateSemester: async (id: string): Promise<SemesterResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.SEMESTERS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deactivateSemester: async (id: string): Promise<SemesterResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.SEMESTERS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
