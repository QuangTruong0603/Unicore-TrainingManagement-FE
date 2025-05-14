import { useQuery } from "@tanstack/react-query";

import { batchClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

export const useBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: () => batchClient.get(API_ENDPOINTS.BATCHES),
  });
};
