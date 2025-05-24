import { authClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { ChangePasswordFormData, LoginFormData } from "./auth.schema";
import { ChangePasswordResponse, LoginResponse } from "./auth.dto";

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    return authClient.post(`${API_ENDPOINTS.AUTH}/login`, data);
  },

  changePassword: async (
    data: ChangePasswordFormData
  ): Promise<ChangePasswordResponse> => {
    return authClient.post(`${API_ENDPOINTS.AUTH}/change-password`, data);
  },
};
