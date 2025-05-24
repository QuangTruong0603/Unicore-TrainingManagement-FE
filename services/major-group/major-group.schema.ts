import { Department } from "../department/department.schema";

export interface MajorGroup {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  department?: Department;
  isActive: boolean;
}

export interface MajorGroupFilters {
  code?: string;
  name?: string;
  isActive?: boolean;
  departmentId?: string;
}

export interface MajorGroupQuery {
  pageNumber: number;
  itemsPerpage: number;
  searchQuery?: string;
  orderBy?: string;
  isDesc?: boolean;
  filters?: MajorGroupFilters;
}

export interface MajorGroupResponse {
  data: MajorGroup[];
  // total: number;
}
