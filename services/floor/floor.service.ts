import { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "../api/api-config";
import { floorClient } from "../api/http-client";
import { PaginatedResponse } from "../dto";
import { Floor, FloorQuery } from "./floor.schema";

export interface CreateFloorData {
  name: string;
  buildingId: string;
}

export interface UpdateFloorData {
  name: string;
}

class FloorService {
  private readonly baseUrl = API_ENDPOINTS.FLOORS;

  async getFloors(
    query: FloorQuery
  ): Promise<AxiosResponse<PaginatedResponse<Floor>>> {
    return floorClient.get(this.baseUrl, { params: query });
  }

  async getFloorById(id: string): Promise<AxiosResponse<Floor>> {
    return floorClient.get(`${this.baseUrl}/${id}`);
  }

  async createFloor(data: CreateFloorData): Promise<AxiosResponse<Floor>> {
    return floorClient.post(this.baseUrl, data);
  }

  async updateFloor(
    id: string,
    data: UpdateFloorData
  ): Promise<AxiosResponse<Floor>> {
    return floorClient.put(`${this.baseUrl}/${id}`, data);
  }

  async activateFloor(id: string): Promise<AxiosResponse<Floor>> {
    return floorClient.patch(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateFloor(id: string): Promise<AxiosResponse<Floor>> {
    return floorClient.patch(`${this.baseUrl}/${id}/deactivate`);
  }
}

export const floorService = new FloorService();
