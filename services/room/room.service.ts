import { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "../api/api-config";
import { roomClient } from "../api/http-client";
import { PaginatedResponse } from "../dto";
import { Room, RoomQuery } from "./room.schema";

export interface CreateRoomData {
  name: string;
  floorId: string;
  availableSeats: number;
}

export interface UpdateRoomData {
  name: string;
  availableSeats: number;
}

class RoomService {
  private readonly baseUrl = API_ENDPOINTS.ROOMS;

  async getRooms(
    query: RoomQuery
  ): Promise<AxiosResponse<PaginatedResponse<Room>>> {
    return roomClient.get(this.baseUrl, { params: query });
  }

  async getRoomById(id: string): Promise<AxiosResponse<Room>> {
    return roomClient.get(`${this.baseUrl}/${id}`);
  }

  async createRoom(data: CreateRoomData): Promise<AxiosResponse<Room>> {
    return roomClient.post(this.baseUrl, data);
  }

  async updateRoom(
    id: string,
    data: UpdateRoomData
  ): Promise<AxiosResponse<Room>> {
    return roomClient.put(`${this.baseUrl}/${id}`, data);
  }

  async activateRoom(id: string): Promise<AxiosResponse<Room>> {
    return roomClient.patch(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateRoom(id: string): Promise<AxiosResponse<Room>> {
    return roomClient.patch(`${this.baseUrl}/${id}/deactivate`);
  }
}

export const roomService = new RoomService();
