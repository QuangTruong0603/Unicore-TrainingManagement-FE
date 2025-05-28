import { PaginatedResponse } from "../dto";

export interface Material {
  id: string;
  name: string;
  fileUrl: string;
  materialTypeId: string;
}

export interface MaterialFilter {
  name?: string;
  materialTypeId?: string;
  hasFile?: boolean;
  courseId?: string;
}

export interface MaterialQuery {
  pageNumber?: number;
  itemsPerpage?: number;
  orderBy?: string;
  isDesc?: boolean;
  filter?: MaterialFilter;
  materialTypeId?: string;
  courseId?: string;
  hasFile?: boolean;
}

export interface MaterialCreateDto {
  name: string;
  materialTypeId: string;
  courseId: string;
}

export interface MaterialUpdateDto {
  name: string;
  materialTypeId?: string;
}

export interface MaterialListResponse extends PaginatedResponse<Material> {}
