import { useMutation } from "@tanstack/react-query";

import { authService } from "./auth.service";
import { LoginFormData } from "./auth.schema";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
  });
};
