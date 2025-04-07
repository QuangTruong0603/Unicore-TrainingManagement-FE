import { LoginFormData } from "./auth.schema";

export const authService = {
  login: async (data: LoginFormData) => {
    const response = await fetch("https://localhost:5001/api/u/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  }
}; 