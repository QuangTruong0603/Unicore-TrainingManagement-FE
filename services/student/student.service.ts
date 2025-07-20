/* eslint-disable no-console */
import { createAsyncThunk } from "@reduxjs/toolkit";

import { studentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../api/api-response";

import { StudentQuery } from "./student.schema";
import { StudentListResponse } from "./student.dto";
import { CreateStudentDto, CreateStudentResponse } from "./student.dto";

import {
  StudentProfile,
  Address,
  Guardian,
} from "@/components/s/sutdent-info/types";
import {
  setStudentProfile,
  setProfileLoading,
  setProfileError,
  clearProfileChanges,
} from "@/store/slices/studentSlice";

export interface UpdateStudentProfileData {
  phoneNumber?: string;
  imageUrl?: string;
  address?: Address;
  guardians?: Guardian[];
}

// Thunk for fetching student profile
export const fetchStudentProfile = createAsyncThunk(
  "student/fetchProfile",
  async (studentId: string, { dispatch }) => {
    try {
      dispatch(setProfileLoading(true));
      dispatch(setProfileError(null));

      const response = await studentService.getStudentProfile(studentId);

      if (response.success) {
        dispatch(setStudentProfile(response.data));

        return response.data;
      } else {
        dispatch(setProfileError("Failed to load profile data"));

        return null;
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      dispatch(
        setProfileError("An error occurred while fetching profile data")
      );

      return null;
    } finally {
      dispatch(setProfileLoading(false));
    }
  }
);

// Thunk for updating student profile
export const updateStudentProfile = createAsyncThunk(
  "student/updateProfile",
  async (
    { studentId, data }: { studentId: string; data: UpdateStudentProfileData },
    { dispatch }
  ) => {
    try {
      dispatch(setProfileLoading(true));

      const response = await studentService.updateStudentProfile(
        studentId,
        data
      );

      if (response.success) {
        // After successful update, fetch the complete profile again to ensure we have all data
        const fullProfileResponse =
          await studentService.getStudentProfile(studentId);

        if (fullProfileResponse.success) {
          dispatch(setStudentProfile(fullProfileResponse.data));
          dispatch(clearProfileChanges());

          return fullProfileResponse.data;
        } else {
          dispatch(
            setProfileError("Updated profile but failed to refresh data")
          );

          return response.data; // Return what we have even if refresh failed
        }
      } else {
        dispatch(setProfileError("Failed to update profile"));

        return null;
      }
    } catch (error) {
      console.error("Error updating student profile:", error);
      dispatch(setProfileError("An error occurred while updating profile"));

      return null;
    } finally {
      dispatch(setProfileLoading(false));
    }
  }
);

// Thunk for updating student profile image
export const updateStudentProfileImage = createAsyncThunk(
  "student/updateProfileImage",
  async (
    { studentId, imageFile }: { studentId: string; imageFile: File },
    { dispatch }
  ) => {
    try {
      dispatch(setProfileLoading(true));
      dispatch(setProfileError(null));

      const formData = new FormData();

      formData.append("ImageFile", imageFile);
      formData.append("StudentId", studentId);

      // The API now expects a PUT to the main student endpoint with query parameters
      // and the image as a multipart/form-data
      const response = await studentClient.put(
        `${API_ENDPOINTS.STUDENTS}/update-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "text/plain",
          },
        }
      );

      if (response.success) {
        // Refresh profile data after successful update
        const fullProfileResponse =
          await studentService.getStudentProfile(studentId);

        if (fullProfileResponse.success) {
          dispatch(setStudentProfile(fullProfileResponse.data));

          return fullProfileResponse.data;
        } else {
          dispatch(
            setProfileError("Updated image but failed to refresh profile data")
          );

          return response.data;
        }
      } else {
        dispatch(setProfileError("Failed to update profile image"));

        return null;
      }
    } catch (error) {
      console.error("Error updating student profile image:", error);
      dispatch(
        setProfileError("An error occurred while updating profile image")
      );

      return null;
    } finally {
      dispatch(setProfileLoading(false));
    }
  }
);

export const studentService = {
  getStudents: async (query: StudentQuery): Promise<StudentListResponse> => {
    const params: Record<string, string> = {
      PageNumber: query.pageNumber.toString(),
      ItemsPerpage: query.itemsPerpage.toString(),
    };

    if (query.searchQuery) {
      params.SearchQuery = query.searchQuery;
    }

    if (query.majorId) {
      params.MajorId = query.majorId;
    }

    if (query.batchId) {
      params.BatchId = query.batchId;
    }

    if (query.by) {
      params.By = query.by;
    }

    if (query.isDesc !== undefined) {
      params.IsDesc = query.isDesc.toString();
    }

    return studentClient.get(`${API_ENDPOINTS.STUDENTS}/all`, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },
  getStudentById: async (studentId: string): Promise<any> => {
    return studentClient.get(`${API_ENDPOINTS.STUDENTS}/${studentId}`);
  },
  getStudentProfile: async (
    studentId: string
  ): Promise<{ success: boolean; data: StudentProfile }> => {
    return studentClient.get(`${API_ENDPOINTS.STUDENTS}/${studentId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  updateStudent: async (
    studentCode: string,
    data: Partial<any>
  ): Promise<any> => {
    return studentClient.put(`${API_ENDPOINTS.STUDENTS}/${studentCode}`, data);
  },
  createStudent: async (data: Partial<any>): Promise<any> => {
    return studentClient.post(`${API_ENDPOINTS.STUDENTS}`, data);
  },
  createStudentWithDto: async (
    data: CreateStudentDto
  ): Promise<BaseResponse<CreateStudentResponse>> => {
    return studentClient.post(`${API_ENDPOINTS.STUDENTS}/register`, data, {
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });
  },
  deleteStudent: async (studentId: string): Promise<any> => {
    return studentClient.delete(`${API_ENDPOINTS.STUDENTS}/${studentId}`);
  },
  importStudents: async (
    file: File,
    batchId: string,
    majorId: string
  ): Promise<BaseResponse<any>> => {
    const formData = new FormData();

    formData.append("ExcelFile", file);

    return studentClient.post(
      `${API_ENDPOINTS.STUDENTS}/register/excel?BatchId=${batchId}&MajorId=${majorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      }
    );
  },
  updateStudentProfile: async (
    studentId: string,
    data: UpdateStudentProfileData
  ): Promise<{ success: boolean; data: StudentProfile }> => {
    return studentClient.put(`${API_ENDPOINTS.STUDENTS}/${studentId}`, data, {
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });
  },
  getStudentByEmail: async (email: string): Promise<any> => {
    return studentClient.get(
      `${API_ENDPOINTS.STUDENTS}/get-student-by-email?email=${email}`
    );
  },
};
