import { PaginatedResponse } from "../dto";

import { Department } from "./department.schema";

export interface DepartmentListResponse extends PaginatedResponse<Department> {}

export interface DepartmentListFilterParams {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export interface GetDepartmentsParams {
  pageNumber?: number;
  itemsPerPage?: number;
  orderBy?: string;
  isDesc?: boolean;
  searchQuery?: string;
  filters?: DepartmentListFilterParams;
}
