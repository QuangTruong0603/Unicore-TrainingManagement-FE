import { PaginatedResponse } from "../dto";
import { Location } from "../location/location.schema";

export interface Building {
  id: string;
  name: string;
  isActive: boolean;
  location: Location;
  totalFloor: number;
  totalRoom: number;
}

export interface BuildingFilter {
  name?: string;
  locationId?: string;
  isActive?: boolean;
}

export interface BuildingQuery {
  pageNumber: number;
  itemsPerpage: number;
  orderBy?: string;
  isDesc?: boolean;
  filter?: BuildingFilter;
}

export interface BuildingListResponse extends PaginatedResponse<Building> {}
