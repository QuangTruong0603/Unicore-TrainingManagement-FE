import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { BaseResponse } from "../api";

import { AcademicClassQuery, AcademicClass } from "./class.schema";
import {
  AcademicClassResponse,
  AcademicClassListResponse,
  AcademicClassCreateDto,
  ClassRegistrationScheduleDto,
} from "./class.dto";

export const classService = {
  getClasses: async (
    query: AcademicClassQuery
  ): Promise<AcademicClassListResponse> => {
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
    if (query.filters?.name) {
      params["Filter.Name"] = query.filters.name;
    }

    if (query.filters?.minCapacity !== undefined) {
      params["Filter.MinCapacity"] = query.filters.minCapacity.toString();
    }

    if (query.filters?.maxCapacity !== undefined) {
      params["Filter.MaxCapacity"] = query.filters.maxCapacity.toString();
    }

    if (query.filters?.isRegistrable !== undefined) {
      params["Filter.IsRegistrable"] = query.filters.isRegistrable.toString();
    }

    if (query.filters?.courseId) {
      params["Filter.CourseId"] = query.filters.courseId;
    }

    if (query.filters?.semesterId) {
      params["Filter.SemesterId"] = query.filters.semesterId;
    }

    if (query.filters?.roomId) {
      params["Filter.RoomId"] = query.filters.roomId;
    }

    if (query.filters?.shiftId) {
      params["Filter.ShiftId"] = query.filters.shiftId;
    }

    if (query.filters?.enrollmentStatus !== undefined) {
      params["Filter.EnrollmentStatus"] =
        query.filters.enrollmentStatus.toString();
    }

    if (query.filters?.lecturerId) {
      params["Filter.LecturerId"] = query.filters.lecturerId;
    }

    // Create URLSearchParams object to handle multiple values for the same parameter
    const searchParams = new URLSearchParams();

    // Add all basic params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    // Add scheduleInDayIds as multiple parameters with the same name if provided
    if (query.filters?.scheduleInDayIds?.length) {
      query.filters.scheduleInDayIds.forEach((id) => {
        searchParams.append("Filter.ScheduleInDayIds", id);
      });
    }

    return courseClient.get(`${API_ENDPOINTS.CLASSES}/page`, {
      params: searchParams,
      paramsSerializer: (params) => params.toString(),
      headers: {
        accept: "text/plain",
      },
    });
  },

  createClass: async (
    data: AcademicClassCreateDto
  ): Promise<AcademicClassResponse> => {
    return courseClient.post(API_ENDPOINTS.CLASSES, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  updateClass: async (
    id: string,
    data: AcademicClassCreateDto
  ): Promise<AcademicClassResponse> => {
    return courseClient.put(`${API_ENDPOINTS.CLASSES}/${id}`, data, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  getClassById: async (id: string): Promise<AcademicClassResponse> => {
    return courseClient.get(`${API_ENDPOINTS.CLASSES}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  deleteClass: async (id: string): Promise<BaseResponse<boolean>> => {
    return courseClient.delete(`${API_ENDPOINTS.CLASSES}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  enableRegistration: async (id: string): Promise<AcademicClassResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.CLASSES}/${id}/enable-registration`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  disableRegistration: async (id: string): Promise<AcademicClassResponse> => {
    return courseClient.post(
      `${API_ENDPOINTS.CLASSES}/${id}/disable-registration`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  getClassesBySemesterId: async (
    semesterId: string
  ): Promise<{ data: AcademicClassResponse[] }> => {
    return courseClient.get(`${API_ENDPOINTS.CLASSES}/semester/${semesterId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },

  getClassesByCourseId: async (
    courseId: string
  ): Promise<{ data: AcademicClassResponse[] }> => {
    return courseClient.get(`${API_ENDPOINTS.CLASSES}/course/${courseId}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  getClassesBySemesterAndCourse: async (
    semesterId: string,
    courseId: string
  ): Promise<BaseResponse<AcademicClass[]>> => {
    return courseClient.get(
      `${API_ENDPOINTS.CLASSES}/semester/${semesterId}/course/${courseId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  getClassesByMajorAndBatch: async (
    majorId: string,
    batchId: string
  ): Promise<{ data: AcademicClassResponse[] }> => {
    return courseClient.get(
      `${API_ENDPOINTS.CLASSES}/major/${majorId}/batch/${batchId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },

  createClassRegistrationSchedule: async (
    scheduleData: ClassRegistrationScheduleDto
  ): Promise<void> => {
    const response = await courseClient.post(
      `${API_ENDPOINTS.CLASSES}/registration/schedule-with-times`,
      scheduleData
    );

    return response.data;
  },
};
