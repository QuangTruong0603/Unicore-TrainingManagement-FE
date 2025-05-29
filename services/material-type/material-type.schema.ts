import { PaginatedResponse } from "../dto";

export interface MaterialType {
  id: string;
  name: string;
  isActive: boolean;
}

export interface MaterialTypeFilter {
  name?: string;
}

export interface MaterialTypeQuery {
  pageNumber?: number;
  itemsPerpage?: number;
  orderBy?: string;
  isDesc?: boolean;
  filter?: MaterialTypeFilter;
}

export interface MaterialTypeCreateDto {
  name: string;
}

export interface MaterialTypeUpdateDto {
  name: string;
}

export interface MaterialTypeListResponse
  extends PaginatedResponse<MaterialType> {}
