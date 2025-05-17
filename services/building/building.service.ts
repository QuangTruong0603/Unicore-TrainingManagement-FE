import { API_ENDPOINTS } from "../api/api-config";
import { buildingClient } from "../api/http-client";

import {
  Building,
  BuildingListResponse,
  BuildingQuery,
} from "./building.schema";

export interface CreateBuildingData {
  name: string;
  locationId: string;
}

export interface UpdateBuildingData {
  name: string;
}

class BuildingService {
  async getBuildings(query: BuildingQuery): Promise<BuildingListResponse> {
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

    // Add filters if provided
    if (query.filter) {
      if (query.filter.locationId) {
        params["Filter.LocationId"] = query.filter.locationId;
      }

      if (query.filter.name) {
        params["Filter.Name"] = query.filter.name;
      }

      if (query.filter.isActive !== undefined) {
        params["Filter.IsActive"] = query.filter.isActive.toString();
      }
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    // return buildingClient.get(this.baseUrl, { params });
    return buildingClient.get(`${API_ENDPOINTS.BUILDINGS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  }

  async createBuilding(data: CreateBuildingData): Promise<Building> {
    return buildingClient.post(API_ENDPOINTS.BUILDINGS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async updateBuilding(
    id: string,
    data: UpdateBuildingData
  ): Promise<Building> {
    return buildingClient.put(`${API_ENDPOINTS.BUILDINGS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async activateBuilding(id: string): Promise<Building> {
    return buildingClient.post(
      `${API_ENDPOINTS.BUILDINGS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async deactivateBuilding(id: string): Promise<Building> {
    return buildingClient.post(
      `${API_ENDPOINTS.BUILDINGS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }
  async toggleStatus(id: string): Promise<Building> {
    const building = await this.getBuildingById(id);

    if (building.isActive) {
      return this.deactivateBuilding(id);
    } else {
      return this.activateBuilding(id);
    }
  }

  async getBuildingById(id: string): Promise<Building> {
    return buildingClient.get(`${API_ENDPOINTS.BUILDINGS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  // async getAllBuildings(locationId?: string): Promise<Building[]> {
  //   if (locationId) {
  //     // Use the new endpoint for filtering by location
  //     return buildingClient.get(
  //       `${API_ENDPOINTS.BUILDINGS}/byLocation/${locationId}`,
  //       {
  //         headers: {
  //           accept: "text/plain",
  //         },
  //       }
  //     );
  //   }

  //   // Default behavior - get all buildings
  //   return buildingClient.get(`${API_ENDPOINTS.BUILDINGS}`, {
  //     headers: {
  //       accept: "text/plain",
  //     },
  //   });
  // }

  // New method to get buildings by location
  async getBuildingsByLocation(locationId: string): Promise<Building[]> {
    return buildingClient.get(
      `${API_ENDPOINTS.BUILDINGS}/byLocation/${locationId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }
}

export const buildingService = new BuildingService();
