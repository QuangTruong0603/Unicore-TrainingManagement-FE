import { enrollmentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../api";

import { Enrollment, EnrollmentQuery } from "./enrollment.schema";
import {
  EnrollmentListResponse,
  EnrollmentResponse,
  MultipleEnrollmentCreateData,
  MultipleEnrollmentCheckRequest,
  EnrollmentCheckResponse,
  MultipleEnrollmentCheckResponse,
} from "./enrollment.dto";

export const enrollmentService = {
  getEnrollments: async (
    query: EnrollmentQuery
  ): Promise<EnrollmentListResponse> => {
    // Start with the basic params
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber.toString(),
      "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    };

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] =
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1);
    }

    if (query.isDesc !== undefined) {
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    // Add filters if provided
    if (query.filters?.status !== undefined) {
      params["Filter.Status"] = query.filters.status.toString();
    }

    if (query.filters?.academicClassId) {
      params["Filter.AcademicClassId"] = query.filters.academicClassId;
    }

    if (query.filters?.semesterId) {
      params["Filter.SemesterId"] = query.filters.semesterId;
    }

    if (query.filters?.courseId) {
      params["Filter.CourseId"] = query.filters.courseId;
    }

    if (query.filters?.studentCode) {
      params["Filter.StudentCode"] = query.filters.studentCode;
    }

    if (query.filters?.fromDate) {
      params["Filter.FromDate"] = query.filters.fromDate.toISOString();
    }

    if (query.filters?.toDate) {
      params["Filter.ToDate"] = query.filters.toDate.toISOString();
    }

    // Create URLSearchParams object to handle multiple values for the same parameter
    const searchParams = new URLSearchParams();

    // Add all basic params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return enrollmentClient.get(`${API_ENDPOINTS.ENROLLMENTS}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  getEnrollmentById: async (id: string): Promise<EnrollmentResponse> => {
    return enrollmentClient.get(`${API_ENDPOINTS.ENROLLMENTS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  createMultipleEnrollments: async (
    data: MultipleEnrollmentCreateData
  ): Promise<EnrollmentListResponse> => {
    return enrollmentClient.post(
      `${API_ENDPOINTS.ENROLLMENTS}/multiple`,
      data,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  checkEnrollmentExists: async (
    studentId: string,
    academicClassId: string
  ): Promise<EnrollmentCheckResponse> => {
    return enrollmentClient.get(`${API_ENDPOINTS.ENROLLMENTS}/check-exists`, {
      params: {
        studentId,
        academicClassId,
      },
      headers: {
        accept: "text/plain",
      },
    });
  },

  checkMultipleEnrollments: async (
    studentId: string,
    academicClassIds: string[]
  ): Promise<MultipleEnrollmentCheckResponse> => {
    const requestData: MultipleEnrollmentCheckRequest = {
      studentId,
      academicClassIds,
    };

    return enrollmentClient.post(
      `${API_ENDPOINTS.ENROLLMENTS}/check-multiple-exists`,
      requestData,
      {
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json",
        },
      }
    );
  },

  getStudentEnrollments: async (
    studentId: string,
    semesterId?: string
  ): Promise<BaseResponse<Enrollment[]>> => {
    const params: Record<string, string> = {};

    if (semesterId) {
      params.semesterId = semesterId;
    }

    return enrollmentClient.get(
      `${API_ENDPOINTS.ENROLLMENTS}/student/${studentId}`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  deleteEnrollment: async (
    enrollmentId: string
  ): Promise<BaseResponse<boolean>> => {
    return enrollmentClient.delete(
      `${API_ENDPOINTS.ENROLLMENTS}/${enrollmentId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
