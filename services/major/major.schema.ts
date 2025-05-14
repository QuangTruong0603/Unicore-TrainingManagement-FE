import { PaginatedResponse } from "../dto";
import { MajorGroup } from "../major-group/major-group.schema";

export interface Major {
  id: string;
  name: string;
  code: string;
  costPerCredit: number;
  isActive?: boolean;
  majorGroupId?: string;
  majorGroup?: MajorGroup;
}

export interface MajorFilters {
  name?: string;
  code?: string;
  isActive?: boolean;
  majorGroupId?: string;
}

export interface MajorQuery {
  pageNumber: number;
  itemsPerpage: number;
  searchQuery?: string;
  orderBy?: string;
  isDesc?: boolean;
  filters?: MajorFilters;
}

export interface MajorResponse {
  data: Major[];
  total: number;
}

export interface MajorListResponse extends PaginatedResponse<Major> {}
