export interface Department {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface DepartmentFilters {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export interface DepartmentQuery {
  pageNumber: number;
  itemsPerpage: number;
  searchQuery?: string;
  orderBy?: string;
  isDesc?: boolean;
  filters?: DepartmentFilters;
}

export interface DepartmentResponse {
  data: Department[];
  total: number;
}
