import { API_ENDPOINTS } from "../api/api-config";
import { buildingClient } from "../api/http-client";

import {
  Room,
  RoomListResponse,
  RoomQuery,
  RoomCreateDto,
  RoomUpdateDto,
} from "./room.schema";

class RoomService {
  async getRooms(query: RoomQuery): Promise<RoomListResponse> {
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber?.toString() || "1",
      "Pagination.ItemsPerpage": query.itemsPerpage?.toString() || "10",
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
      if (query.filter.name) {
        params["Filter.Name"] = query.filter.name;
      }

      if (query.filter.floorId) {
        params["Filter.FloorId"] = query.filter.floorId;
      }

      if (query.filter.buildingId) {
        params["Filter.BuildingId"] = query.filter.buildingId;
      }

      if (query.filter.locationId) {
        params["Filter.LocationId"] = query.filter.locationId;
      }

      if (query.filter.availableSeats) {
        params["Filter.AvailableSeats"] = query.filter.availableSeats.toString();
      }
    }

    // Add direct filters
    if (query.floorId) {
      params["Filter.FloorId"] = query.floorId;
    }

    if (query.buildingId) {
      params["Filter.BuildingId"] = query.buildingId;
    }

    if (query.locationId) {
      params["Filter.LocationId"] = query.locationId;
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return buildingClient.get(`${API_ENDPOINTS.ROOMS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  }

  async createRoom(data: RoomCreateDto): Promise<Room> {
    return buildingClient.post(API_ENDPOINTS.ROOMS, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async updateRoom(id: string, data: RoomUpdateDto): Promise<Room> {
    return buildingClient.put(`${API_ENDPOINTS.ROOMS}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async activateRoom(id: string): Promise<Room> {
    return buildingClient.post(
      `${API_ENDPOINTS.ROOMS}/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async deactivateRoom(id: string): Promise<Room> {
    return buildingClient.post(
      `${API_ENDPOINTS.ROOMS}/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async toggleStatus(id: string): Promise<Room> {
    const room = await this.getRoomById(id);

    if (room.isActive) {
      return this.deactivateRoom(id);
    } else {
      return this.activateRoom(id);
    }
  }

  async getRoomById(id: string): Promise<Room> {
    return buildingClient.get(`${API_ENDPOINTS.ROOMS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async getAllRooms(
    locationId?: string,
    buildingId?: string,
    floorId?: string
  ): Promise<Room[]> {
    let url = `${API_ENDPOINTS.ROOMS}`;
    const params = new URLSearchParams();

    if (locationId) {
      params.append("locationId", locationId);
    }

    if (buildingId) {
      params.append("buildingId", buildingId);
    }

    if (floorId) {
      params.append("floorId", floorId);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return buildingClient.get(url, {
      headers: {
        accept: "text/plain",
      },
    });
  }
}

export const roomService = new RoomService();
