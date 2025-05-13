import { majorClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import {
  CreateMajorGroupData,
  GetMajorGroupsParams,
  MajorGroupListResponse,
} from "./major-group.dto";
import { MajorGroupResponse, MajorGroupQuery } from "./major-group.schema";

export const majorGroupService = {
  getMajorGroups: async (
    params?: GetMajorGroupsParams
  ): Promise<MajorGroupResponse> => {
    return majorClient.get(API_ENDPOINTS.MAJOR_GROUPS, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },

  getMajorGroupsPagination: async (
    query: MajorGroupQuery
  ): Promise<MajorGroupListResponse> => {
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
      if (query.filters.code) {
        params["Filter.Code"] = query.filters.code;
      }

      if (query.filters.name) {
        params["Filter.Name"] = query.filters.name;
      }

      if (query.filters.isActive !== undefined) {
        params["Filter.IsActive"] = query.filters.isActive.toString();
      }

      if (query.filters.departmentId) {
        params["Filter.DepartmentId"] = query.filters.departmentId;
      }
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return majorClient.get(`${API_ENDPOINTS.MAJOR_GROUPS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getMajorGroupById: async (id: string) => {
    return majorClient.get(`${API_ENDPOINTS.MAJOR_GROUPS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  createMajorGroup: async (data: CreateMajorGroupData) => {
    return majorClient.post(API_ENDPOINTS.MAJOR_GROUPS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  updateMajorGroup: async (id: string, data: Partial<CreateMajorGroupData>) => {
    return majorClient.put(`${API_ENDPOINTS.MAJOR_GROUPS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  deleteMajorGroup: async (id: string) => {
    return majorClient.delete(`${API_ENDPOINTS.MAJOR_GROUPS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
