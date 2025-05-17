import { BaseResponse, PaginatedResponse } from "../dto";

import { Location } from "./location.schema";

/**
 * DTO interfaces for Location API operations
 */
export interface CreateLocationData {
  name: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
  imageURL: string;
}

export interface UpdateLocationData {
  name: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
  imageURL?: string;
}

export interface LocationResponse extends BaseResponse<Location> {}

export interface LocationListResponse extends PaginatedResponse<Location> {}
