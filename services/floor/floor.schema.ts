import { Building } from "../building/building.schema";

export interface Floor {
  id: string;
  name: string;
  isActive: boolean;
  building: Building;
  totalRoom: number;
}

export interface FloorQuery {
  pageNumber?: number;
  itemsPerpage?: number;
  searchQuery?: string;
  orderBy?: string;
  isDesc?: boolean;
  buildingId?: string;
  locationId?: string;
  isActive?: boolean;
}
