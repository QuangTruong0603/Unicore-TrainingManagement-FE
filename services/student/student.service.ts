import { studentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { StudentQuery } from "./student.schema";
import { StudentListResponse } from "./student.dto";

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
  updateStudent: async (studentCode: string, data: Partial<any>): Promise<any> => {
    return studentClient.put(`${API_ENDPOINTS.STUDENTS}/${studentCode}`, data);
  },
  createStudent: async (data: Partial<any>): Promise<any> => {
    return studentClient.post(`${API_ENDPOINTS.STUDENTS}`, data);
  },
  deleteStudent: async (studentId: string): Promise<any> => {
    return studentClient.delete(`${API_ENDPOINTS.STUDENTS}/${studentId}`);
  },
  importStudents: async (file: File, batchId: string, majorId: string): Promise<void> => {
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
}; 