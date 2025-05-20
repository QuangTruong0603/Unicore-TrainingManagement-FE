import { useMutation, useQuery } from "@tanstack/react-query";

import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { useApiGet, useApiPost } from "../api/api-hooks";

import { CourseQuery } from "./course.schema";
import { CreateCourseData, UpdateCourseData } from "./course.dto";

// React Query implementation
export const useCourses = (query: CourseQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useQuery({
    queryKey: ["courses", query],
    queryFn: () =>
      courseClient.get(`${API_ENDPOINTS.COURSES}/page`, { params }),
  });
};

// Using our custom hooks directly (alternative approach)
export const useCoursesWithCustomHook = (query: CourseQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useApiGet(
    courseClient,
    `${API_ENDPOINTS.COURSES}/page`,
    { params },
    {
      // Optional callbacks
      onSuccess: (data) => console.log("Courses fetched successfully", data),
      onError: (error) => console.error("Failed to fetch courses", error),
    }
  );
};

// Mutation for creating a course
export const useCreateCourse = () => {
  return useMutation({
    mutationFn: (courseData: CreateCourseData) =>
      courseClient.post(API_ENDPOINTS.COURSES, courseData),
  });
};

// Alternative using our custom hook
export const useCreateCourseWithCustomHook = () => {
  return useApiPost<CreateCourseData>(courseClient, API_ENDPOINTS.COURSES);
};

// Mutation for updating a course
export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      courseClient.put(`${API_ENDPOINTS.COURSES}/${id}`, data),
  });
};

