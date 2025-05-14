import { z } from "zod";

import { PaginatedResponse } from "../dto";

import { MajorGroup } from "./major-group.schema";

/**
 * Zod schema for validating major group creation and updates
 */
export const majorGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  departmentId: z.string().min(1, "Department is required"),
  isActive: z.boolean().default(true),
});

export type CreateMajorGroupData = z.infer<typeof majorGroupSchema>;
export type UpdateMajorGroupData = Partial<CreateMajorGroupData>;

export interface MajorGroupListResponse extends PaginatedResponse<MajorGroup> {}

export interface MajorGroupListFilterParams {
  code?: string;
  name?: string;
  isActive?: boolean;
  departmentId?: string;
}

export interface GetMajorGroupsParams {
  pageNumber?: number;
  itemsPerPage?: number;
  orderBy?: string;
  isDesc?: boolean;
  searchQuery?: string;
  filters?: MajorGroupListFilterParams;
}
