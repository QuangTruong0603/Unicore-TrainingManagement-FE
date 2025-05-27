import { useMutation, useQuery } from "@tanstack/react-query";

import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { useApiGet, useApiPost } from "../api/api-hooks";

import { SemesterQuery } from "./semester.schema";
import { CreateSemesterData, UpdateSemesterData } from "./semester.dto";
import { semesterService } from "./semester.service";

/**
 * React Query implementation for fetching semesters with pagination and filtering
 */
export const useSemesters = (query: SemesterQuery) => {
  return useQuery({
    queryKey: ["semesters", query],
    queryFn: () => semesterService.getSemesters(query),
  });
};

/**
 * React Query implementation for fetching a single semester by ID
 */
export const useSemester = (id: string) => {
  return useQuery({
    queryKey: ["semester", id],
    queryFn: () => semesterService.getSemester(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};

/**
 * Custom hook implementation using our API hook utilities
 */
export const useSemestersWithCustomHook = (query: SemesterQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.orderBy && {
      "Order.By":
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1),
    }),
    ...(query.isDesc !== undefined && {
      "Order.IsDesc": query.isDesc.toString(),
    }),
    ...(query.filters?.semesterNumber !== undefined && {
      "Filter.SemesterNumber": query.filters.semesterNumber.toString(),
    }),
    ...(query.filters?.year !== undefined && {
      "Filter.Year": query.filters.year.toString(),
    }),
    ...(query.filters?.isActive !== undefined && {
      "Filter.IsActive": query.filters.isActive!.toString(),
    }),
    ...(query.filters?.startDate !== undefined && {
      "Filter.StartDate": query.filters.startDate.toISOString(),
    }),
    ...(query.filters?.endDate !== undefined && {
      "Filter.EndDate": query.filters.endDate.toISOString(),
    }),
    ...(query.filters?.numberOfWeeks !== undefined && {
      "Filter.NumberOfWeeks": query.filters.numberOfWeeks.toString(),
    }),
  };

  return useApiGet(
    courseClient,
    `${API_ENDPOINTS.SEMESTERS}/page`,
    { params },
    {
      onSuccess: (data) => console.log("Semesters fetched successfully", data),
      onError: (error) => console.error("Failed to fetch semesters", error),
    }
  );
};

/**
 * Mutation for creating a semester
 */
export const useCreateSemester = () => {
  return useMutation({
    mutationFn: (semesterData: CreateSemesterData) =>
      semesterService.createSemester(semesterData),
  });
};

/**
 * Alternative using our custom hook
 */
export const useCreateSemesterWithCustomHook = () => {
  return useApiPost<CreateSemesterData>(courseClient, API_ENDPOINTS.SEMESTERS, {
    headers: {
      accept: "text/plain",
    },
  });
};

/**
 * Mutation for updating a semester
 */
export const useUpdateSemester = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSemesterData }) =>
      semesterService.updateSemester(id, data),
  });
};

/**
 * Mutation for activating a semester
 */
export const useActivateSemester = () => {
  return useMutation({
    mutationFn: (id: string) => semesterService.activateSemester(id),
  });
};

/**
 * Mutation for deactivating a semester
 */
export const useDeactivateSemester = () => {
  return useMutation({
    mutationFn: (id: string) => semesterService.deactivateSemester(id),
  });
};
