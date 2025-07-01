import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import router from "next/router";

import { studentService } from "@/services/student/student.service";
import { lecturerService } from "@/services/lecturer/lecturer.service";

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

interface StudentInfo {
  id: string;
  studentCode: string;
  majorId: string;
  batchId: string;
  applicationUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    personId: string;
    dob: string;
    phoneNumber: string;
    status: number;
    imageUrl: string;
  };
}

interface LecturerInfo {
  id: string;
  lecturerCode: string;
  departmentId: string;
  degree: string;
  salary: number;
  workingStatus: number;
  joinDate: string;
  mainMajor: string;
  applicationUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dob: string;
    phoneNumber: string;
    status: number;
    imageUrl: string;
  };
}


// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }

  return null;
};

// Helper function to safely set localStorage
const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

// Helper function to safely remove from localStorage
const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lecturerInfo, setLecturerInfo] = useState<LecturerInfo | null>(null);
  const [isStudentInfoLoading, setIsStudentInfoLoading] = useState(false);
  const [isLecturerInfoLoading, setIsLecturerInfoLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = getLocalStorage("token");

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

      const userData = getLocalStorage("user");

      if (userData) {
        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);

        // Check for student info in localStorage
        if (parsedUser.role === "Student") {
          const studentData = getLocalStorage("studentInfo");

          if (studentData) {
            try {
              setStudentInfo(JSON.parse(studentData));
            } catch (e) {
              console.error("Error parsing student info:", e);
              // If there's an error parsing, try to fetch fresh data
              fetchStudentInfo(parsedUser.email);
            }
          } else {
            // Only fetch if we don't have data
            fetchStudentInfo(parsedUser.email);
          }
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Separate function to fetch student info to avoid duplicate logic
  const fetchStudentInfo = async (email: string) => {
    if (isStudentInfoLoading) return; // Prevent multiple simultaneous calls

    setIsStudentInfoLoading(true);
    try {
      const response = await studentService.getStudentByEmail(email);

      if (response.success && response.data) {
        setLocalStorage("studentInfo", JSON.stringify(response.data));
        setStudentInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
    } finally {
      setIsStudentInfoLoading(false);
    }
  };

  const fetchLecturerInfo = async (email: string) => {
    if (isLecturerInfoLoading) return; // Prevent multiple simultaneous calls

    setIsLecturerInfoLoading(true);

    try {
      const response = await lecturerService.getLecturerByEmail(email);

      if (response.success && response.data) {
        setLocalStorage("lecturerInfo", JSON.stringify(response.data));
        setLecturerInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching lecturer info:", error);
    } finally {
      setIsLecturerInfoLoading(false);
    }
  };

  const login = async (token: string) => {
    try {
      const decoded = jwtDecode<any>(token);

      // Check expiration
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        throw new Error("Token has expired");
      }

      // Store token
      setLocalStorage("token", token);

      // Store user info
      const userData: User = {
        id: decoded.jti,
        email:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      };

      setLocalStorage("user", JSON.stringify(userData));
      setUser(userData);

      // If user is a student, fetch their information
      if (userData.role === "Student") {
        await fetchStudentInfo(userData.email);
      }

      if (userData.role === "Lecturer") {
        await fetchLecturerInfo(userData.email);
      }

      // Redirect based on role
      if (userData.role === "Student") {
        router.push("/s");
      } else if (userData.role === "Lecturer") {
        router.push("/l");
      } else if (userData.role === "TrainingManager") {
        router.push("/t");
      } else if (userData.role === "Admin") {
        router.push("/a/analytics");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    removeLocalStorage("token");
    removeLocalStorage("user");
    removeLocalStorage("studentInfo");
    removeLocalStorage("lecturerInfo");
    router.push("/login");
    setUser(null);
    setStudentInfo(null);
    setLecturerInfo(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    studentInfo,
    lecturerInfo,
    login,
    logout,
    isAuthenticated,
    isLoading,
    checkAuth,
  };
};
