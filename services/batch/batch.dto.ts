import { BaseResponse } from "../dto";
import { Batch } from "./batch.schema";

export interface CreateBatchData {
  title: string;
  startYear: number;
}

export interface UpdateBatchData {
  title?: string;
  startYear?: number;
}

export interface BatchListResponse extends BaseResponse<Batch[]> {}
