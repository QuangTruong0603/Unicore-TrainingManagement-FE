import { authClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { LoginFormData } from "./auth.schema";
import { LoginResponse } from "./auth.dto";

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    return authClient.post(`${API_ENDPOINTS.AUTH}/login`, data);
  },
};
