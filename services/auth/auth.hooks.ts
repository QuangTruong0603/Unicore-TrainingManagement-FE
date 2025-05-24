import { useMutation } from "@tanstack/react-query";

import { authService } from "./auth.service";
import { ChangePasswordFormData, LoginFormData } from "./auth.schema";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      authService.changePassword(data),
  });
};
