/* eslint-disable no-console */
import { createAsyncThunk } from "@reduxjs/toolkit";

import { lecturerClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../api/api-response";

import { LecturerQuery } from "./lecturer.schema";
import { LecturerListResponse } from "./lecturer.dto";

export const lecturerService = {
  getLecturers: async (query: LecturerQuery): Promise<LecturerListResponse> => {
    const params: Record<string, string> = {
      PageNumber: query.pageNumber.toString(),
      ItemsPerpage: query.itemsPerpage.toString(),
    };

    if (query.searchQuery) {
      params.SearchQuery = query.searchQuery;
    }

    if (query.departmentId) {
      params.DepartmentId = query.departmentId;
    }

    if (query.by) {
      params.By = query.by;
    }

    if (query.isDesc !== undefined) {
      params.IsDesc = query.isDesc.toString();
    }

    return lecturerClient.get(`${API_ENDPOINTS.LECTURERS}/all`, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },
  getLecturerById: async (lecturerId: string): Promise<any> => {
    return lecturerClient.get(`${API_ENDPOINTS.LECTURERS}/${lecturerId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  updateLecturer: async (
    lecturerCode: string,
    data: Partial<any>
  ): Promise<any> => {
    return lecturerClient.put(`${API_ENDPOINTS.LECTURERS}/${lecturerCode}`, data);
  },
  createLecturer: async (data: Partial<any>): Promise<any> => {
    return lecturerClient.post(`${API_ENDPOINTS.LECTURERS}`, data);
  },
  deleteLecturer: async (lecturerId: string): Promise<any> => {
    return lecturerClient.delete(`${API_ENDPOINTS.LECTURERS}/${lecturerId}`);
  },
  importLecturers: async (
    file: File,
    departmentId: string
  ): Promise<BaseResponse<any>> => {
    const formData = new FormData();

    formData.append("ExcelFile", file);

    return lecturerClient.post(
      `${API_ENDPOINTS.LECTURERS}/register/excel?DepartmentId=${departmentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      }
    );
  },
  getLecturerByEmail: async (email: string): Promise<any> => {
    return lecturerClient.get(
      `${API_ENDPOINTS.LECTURERS}/get-lecturer-by-email?email=${email}`
    );
  },
}; 