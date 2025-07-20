import { useQuery } from "@tanstack/react-query";

import { studentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { StudentQuery } from "./student.schema";
import { CreateStudentDto } from "./student.dto";

export const useStudents = (query: StudentQuery) => {
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

  return useQuery({
    queryKey: ["students", query],
    queryFn: () =>
      studentClient.get(`${API_ENDPOINTS.STUDENTS}/all`, { params }),
  });
};

export const useCreateStudent = () => {
  return useQuery({
    queryKey: ["createStudent"],
    queryFn: (data: CreateStudentDto) =>
      studentClient.post(`${API_ENDPOINTS.STUDENTS}/register`, data, {
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json",
        },
      }),
  });
};
