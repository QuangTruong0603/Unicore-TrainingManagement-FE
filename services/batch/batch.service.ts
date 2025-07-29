import { batchClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../dto";

import { BatchListResponse, CreateBatchData } from "./batch.dto";
import { Batch } from "./batch.schema";

export const batchService = {
  getBatches: async (): Promise<BatchListResponse> => {
    return batchClient.get(API_ENDPOINTS.BATCHES, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  createBatch: async (data: CreateBatchData): Promise<BaseResponse<Batch>> => {
    return batchClient.post(API_ENDPOINTS.BATCHES, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
