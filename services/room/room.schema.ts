import { Floor } from "../floor/floor.schema";

export interface Room {
  id: string;
  name: string;
  isActive: boolean;
  availableSeats: number;
  floor: Floor;
}

export interface RoomQuery {
  pageNumber?: number;
  itemsPerpage?: number;
  searchQuery?: string;
  orderBy?: string;
  isDesc?: boolean;
  floorId?: string;
  buildingId?: string;
  locationId?: string;
  isActive?: boolean;
}

export interface RoomCreateDto {
  name: string;
  code: string;
  capacity: number;
  floorId: string;
  type: string;
  description?: string;
}

export interface RoomUpdateDto {
  name: string;
  code: string;
  capacity: number;
  type: string;
  description?: string;
}
