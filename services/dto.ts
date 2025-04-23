/**
 * Generic API response interfaces
 */

export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  errors?: string[];
}

export interface PaginatedData<T = any> {
  data: T[];
  total: number;
  pageSize: number;
  pageIndex: number;
}

export interface PaginatedResponse<T = any>
  extends BaseResponse<PaginatedData<T>> {}
