import { PaginatedResponse } from "../dto";
import { Floor } from "../floor/floor.schema";

export interface Room {
  id: string;
  name: string;
  isActive: boolean;
  availableSeats: number;
  floor: Floor;
}

export interface RoomFilter {
  name?: string;
  buildingId?: string;
  locationId?: string;
  floorId?: string;
  availableSeats?: number;
}

export interface RoomQuery {
  pageNumber?: number;
  itemsPerpage?: number;
  orderBy?: string;
  isDesc?: boolean;
  filter?: RoomFilter;
  floorId?: string;
  buildingId?: string;
  locationId?: string;
}

export interface RoomCreateDto {
  name: string;
  availableSeats: number;
  floorId: string;
}

export interface RoomUpdateDto {
  name: string;
  availableSeats: number;
}

export interface RoomListResponse extends PaginatedResponse<Room> {}
