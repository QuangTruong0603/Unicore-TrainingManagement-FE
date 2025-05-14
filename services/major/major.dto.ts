import { BaseResponse } from "../dto";

import { Major } from "./major.schema";

export interface MajorListResponse extends BaseResponse<Major[]> {}

export interface MajorListFilterParams {
  name?: string;
  code?: string;
  isActive?: boolean;
  majorGroupId?: string;
}

export interface GetMajorsParams {
  pageNumber?: number;
  itemsPerPage?: number;
  orderBy?: string;
  isDesc?: boolean;
  searchQuery?: string;
  filters?: MajorListFilterParams;
}
