import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import router from "next/router";

interface DecodedToken {
  aud: string;
  exp: number;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  iss: string;
  jti: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setIsLoading(false);

        return;
      }

      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token has expired
        logout();

        return;
      }

      const userData = localStorage.getItem("user");

      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // Check expiration
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        throw new Error("Token has expired");
      }

      // Store token
      localStorage.setItem("token", token);

      // Store user info
      const userData: User = {
        id: decoded.jti,
        email:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Redirect based on role
      if (userData.role === "TrainingManager") {
        router.push("/t");
      } else if (userData.role === "Admin") {
        router.push("/a");
      } else if (userData.role === "Student") {
        router.push("/s");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    checkAuth,
  };
};
