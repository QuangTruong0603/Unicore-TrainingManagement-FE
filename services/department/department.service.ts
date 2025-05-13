import { majorClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { GetDepartmentsParams } from "./department.dto";
import { DepartmentResponse, DepartmentQuery } from "./department.schema";
import { DepartmentListResponse } from "./department.dto";

export const departmentService = {
  getDepartments: async (
    params?: GetDepartmentsParams
  ): Promise<DepartmentResponse> => {
    return majorClient.get(API_ENDPOINTS.DEPARTMENTS, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },

  getDepartmentsPagination: async (
    query: DepartmentQuery
  ): Promise<DepartmentListResponse> => {
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
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return majorClient.get(`${API_ENDPOINTS.DEPARTMENTS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getDepartmentById: async (id: string) => {
    return majorClient.get(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createDepartment: async (data: any) => {
    return majorClient.post(API_ENDPOINTS.DEPARTMENTS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  updateDepartment: async (id: string, data: any) => {
    return majorClient.put(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  deleteDepartment: async (id: string) => {
    return majorClient.delete(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
