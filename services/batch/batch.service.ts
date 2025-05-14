import { batchClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { BatchListResponse } from "./batch.dto";

export const batchService = {
  getBatches: async (): Promise<BatchListResponse> => {
    return batchClient.get(API_ENDPOINTS.BATCHES, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
