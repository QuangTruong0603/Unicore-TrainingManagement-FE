import { locationClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { LocationQuery } from "./location.schema";
import {
  LocationListResponse,
  LocationResponse,
  CreateLocationData,
} from "./location.dto";

export const locationService = {
  getLocations: async (query: LocationQuery): Promise<LocationListResponse> => {
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

    // Add name filter if provided
    if (query.filters?.name) {
      params["Filter.Name"] = query.filters.name;
    }

    return locationClient.get(`${API_ENDPOINTS.LOCATIONS}/page`, {
      params: params,
      headers: {
        accept: "text/plain",
      },
    });
  },

  createLocation: async (data: CreateLocationData): Promise<LocationResponse> => {
    return locationClient.post(API_ENDPOINTS.LOCATIONS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  getLocationById: async (id: string): Promise<LocationResponse> => {
    return locationClient.get(`${API_ENDPOINTS.LOCATIONS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  activateLocation: async (id: string) => {
    return locationClient.post(
      `${API_ENDPOINTS.LOCATIONS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deactivateLocation: async (id: string) => {
    return locationClient.post(
      `${API_ENDPOINTS.LOCATIONS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
