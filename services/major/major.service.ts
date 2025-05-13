import { majorClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { GetMajorsParams } from "./major.dto";
import { MajorResponse, MajorListResponse, MajorQuery } from "./major.schema";

export const majorService = {
  getMajors: async (params?: GetMajorsParams): Promise<MajorResponse> => {
    return majorClient.get(API_ENDPOINTS.MAJORS, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },

  getMajorsPagination: async (
    query: MajorQuery
  ): Promise<MajorListResponse> => {
    // Start with the basic params
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    };

    // Add search query if provided
    if (query.searchQuery) {
      params["Filter.Name"] = query.searchQuery;
    }

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] =
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1);
    }

    if (query.isDesc !== undefined) {
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    // Add filters if provided
    if (query.filters) {
      if (query.filters.name) {
        params["Filter.Name"] = query.filters.name;
      }

      if (query.filters.code) {
        params["Filter.Code"] = query.filters.code;
      }

      if (query.filters.isActive !== undefined) {
        params["Filter.IsActive"] = query.filters.isActive.toString();
      }

      if (query.filters.majorGroupId) {
        params["Filter.MajorGroupId"] = query.filters.majorGroupId;
      }
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return majorClient.get(`${API_ENDPOINTS.MAJORS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getMajorById: async (id: string) => {
    return majorClient.get(`${API_ENDPOINTS.MAJORS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createMajor: async (data: any) => {
    return majorClient.post(API_ENDPOINTS.MAJORS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  updateMajor: async (id: string, data: any) => {
    return majorClient.put(`${API_ENDPOINTS.MAJORS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  deleteMajor: async (id: string) => {
    return majorClient.delete(`${API_ENDPOINTS.MAJORS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  activateMajor: async (id: string) => {
    return majorClient.post(
      `${API_ENDPOINTS.MAJORS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deactivateMajor: async (id: string) => {
    return majorClient.post(
      `${API_ENDPOINTS.MAJORS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
