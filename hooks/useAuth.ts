import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  nameid: string;
  unique_name: string;
  email: string;
  role: string;
  exp: number;
}

interface User {
  id: string;
  name: string;
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
        id: decoded.nameid,
        name: decoded.unique_name,
        email: decoded.email,
        role: decoded.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
