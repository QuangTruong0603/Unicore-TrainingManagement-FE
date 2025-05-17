import { API_ENDPOINTS } from "../api/api-config";
import { buildingClient } from "../api/http-client";

import {
  Floor,
  FloorListResponse,
  FloorQuery,
  CreateFloorDto,
  UpdateFloorDto,
} from "./floor.schema";

class FloorService {
  async getFloors(query: FloorQuery): Promise<FloorListResponse> {
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
    } // Add filters if provided
    if (query.filter) {
      if (query.filter.buildingId) {
        params["Filter.BuildingId"] = query.filter.buildingId;
      }

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

    return buildingClient.get(`${API_ENDPOINTS.FLOORS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  }

  async createFloor(data: CreateFloorDto): Promise<Floor> {
    return buildingClient.post(API_ENDPOINTS.FLOORS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async updateFloor(id: string, data: UpdateFloorDto): Promise<Floor> {
    return buildingClient.put(`${API_ENDPOINTS.FLOORS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async activateFloor(id: string): Promise<Floor> {
    return buildingClient.post(
      `${API_ENDPOINTS.FLOORS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async deactivateFloor(id: string): Promise<Floor> {
    return buildingClient.post(
      `${API_ENDPOINTS.FLOORS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async toggleStatus(id: string): Promise<Floor> {
    const floor = await this.getFloorById(id);

    if (floor.isActive) {
      return this.deactivateFloor(id);
    } else {
      return this.activateFloor(id);
    }
  }

  async getFloorById(id: string): Promise<Floor> {
    return buildingClient.get(`${API_ENDPOINTS.FLOORS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  }  
  async getAllFloors(locationId?: string, buildingId?: string): Promise<Floor[]> {
    // If locationId is provided, use the new endpoint
    if (locationId) {
      return buildingClient.get(`${API_ENDPOINTS.FLOORS}/byLocation/${locationId}`, {
        headers: {
          accept: "text/plain",
        },
      });
    }
    
    // If only buildingId is provided
    if (buildingId) {
      return buildingClient.get(`${API_ENDPOINTS.FLOORS}?buildingId=${buildingId}`, {
        headers: {
          accept: "text/plain",
        },
      });
    }
    
    // Default case - get all floors
    return buildingClient.get(`${API_ENDPOINTS.FLOORS}`, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  // New method to get floors by location
  async getFloorsByLocation(locationId: string): Promise<Floor[]> {
    return buildingClient.get(`${API_ENDPOINTS.FLOORS}/byLocation/${locationId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  }
}

export const floorService = new FloorService();
