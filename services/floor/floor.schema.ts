import { PaginatedResponse } from "../dto";
import { Building } from "../building/building.schema";

export interface Floor {
  id: string;
  name: string;
  isActive: boolean;
  building: Building;
  totalRoom: number;
}

export interface FloorFilter {
  name?: string;
  buildingId?: string;
  locationId?: string;
  isActive?: boolean;
}

export interface FloorQuery {
  pageNumber: number;
  itemsPerpage: number;
  orderBy?: string;
  isDesc?: boolean;
  filter?: FloorFilter;
}

export interface CreateFloorDto {
  name: string;
  buildingId: string;
}

export interface UpdateFloorDto {
  name: string;
}

export interface FloorListResponse extends PaginatedResponse<Floor> {}
