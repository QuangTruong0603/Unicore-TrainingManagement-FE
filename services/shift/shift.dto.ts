import { BaseResponse, PaginatedResponse } from "../dto";

import { Shift } from "./shift.schema";

/**
 * DTO interfaces for Shift API operations
 */
export interface CreateShiftData {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateShiftData {
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface ShiftResponse extends BaseResponse<Shift> {}

export interface ShiftListResponse extends PaginatedResponse<Shift> {}
