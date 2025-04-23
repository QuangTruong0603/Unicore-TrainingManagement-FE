import { majorClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { MajorListResponse } from "./major.dto";

export const majorService = {
  getMajors: async (): Promise<MajorListResponse> => {
    return majorClient.get(API_ENDPOINTS.MAJORS, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
