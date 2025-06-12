import { useQuery } from "@tanstack/react-query";

import { lecturerClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

import { LecturerQuery } from "./lecturer.schema";

export const useLecturers = (query: LecturerQuery) => {
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

  return useQuery({
    queryKey: ["lecturers", query],
    queryFn: () =>
      lecturerClient.get(`${API_ENDPOINTS.LECTURERS}/all`, { params }),
  });
}; 