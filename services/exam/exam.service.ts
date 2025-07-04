import { enrollmentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { ExamQuery } from "./exam.schema";
import {
  ExamCreateDto,
  ExamUpdateDto,
  ExamResponse,
  ExamListResponse,
  ExamCreateResponse,
  ExamUpdateResponse,
  ExamDeleteResponse,
  BulkExamDeleteDto,
  BulkExamDeleteResponse,
  ExamStatisticsResponse,
  ExamConflictCheckDto,
  ExamConflictCheckResponse,
  AddEnrollmentToExamDto,
  AddEnrollmentToExamApiResponse,
} from "./exam.dto";

export const examService = {
  getExams: async (query: ExamQuery): Promise<ExamListResponse> => {
    // Start with the basic params
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    };

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] = query.orderBy;
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    if (query.filters?.academicClassId) {
      params["Filter.AcademicClassId"] = query.filters.academicClassId;
    }

    if (query.filters?.roomId) {
      params["Filter.RoomId"] = query.filters.roomId;
    }

    if (query.filters?.type) {
      params["Filter.Type"] = query.filters.type.toString();
    }

    if (query.filters?.minExamTime) {
      params["Filter.MinExamTime"] = query.filters.minExamTime.toISOString();
    }

    if (query.filters?.maxExamTime) {
      params["Filter.MaxExamTime"] = query.filters.maxExamTime.toISOString();
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return enrollmentClient.get(`${API_ENDPOINTS.EXAMS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getExamById: async (id: string): Promise<ExamResponse> => {
    return enrollmentClient.get(`${API_ENDPOINTS.EXAMS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createExam: async (data: ExamCreateDto): Promise<ExamCreateResponse> => {
    return enrollmentClient.post(`${API_ENDPOINTS.EXAMS}`, data, {
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });
  },

  updateExam: async (
    id: string,
    data: ExamUpdateDto
  ): Promise<ExamUpdateResponse> => {
    return enrollmentClient.put(`${API_ENDPOINTS.EXAMS}/${id}`, data, {
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });
  },

  deleteExam: async (id: string): Promise<ExamDeleteResponse> => {
    return enrollmentClient.delete(`${API_ENDPOINTS.EXAMS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  bulkDeleteExams: async (
    data: BulkExamDeleteDto
  ): Promise<BulkExamDeleteResponse> => {
    return enrollmentClient.delete(`${API_ENDPOINTS.EXAMS}/bulk`, {
      data,
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });
  },

  getExamStatistics: async (): Promise<ExamStatisticsResponse> => {
    return enrollmentClient.get(`${API_ENDPOINTS.EXAMS}/statistics`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  checkExamConflicts: async (
    data: ExamConflictCheckDto
  ): Promise<ExamConflictCheckResponse> => {
    return enrollmentClient.post(
      `${API_ENDPOINTS.EXAMS}/check-conflicts`,
      data,
      {
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json",
        },
      }
    );
  },

  getExamsByAcademicClass: async (
    academicClassId: string
  ): Promise<ExamListResponse> => {
    return enrollmentClient.get(
      `${API_ENDPOINTS.EXAMS}/academic-class/${academicClassId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  getExamsByRoom: async (roomId: string): Promise<ExamListResponse> => {
    return enrollmentClient.get(`${API_ENDPOINTS.EXAMS}/room/${roomId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  getUpcomingExams: async (days?: number): Promise<ExamListResponse> => {
    const params = days ? { days: days.toString() } : {};

    return enrollmentClient.get(`${API_ENDPOINTS.EXAMS}/upcoming`, {
      params,
      headers: {
        accept: "text/plain",
      },
    });
  },

  addEnrollmentToExam: async (
    addEnrollmentDto: AddEnrollmentToExamDto
  ): Promise<AddEnrollmentToExamApiResponse> => {
    return enrollmentClient.post(
      `${API_ENDPOINTS.EXAMS}/add-enrollment`,
      addEnrollmentDto,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
