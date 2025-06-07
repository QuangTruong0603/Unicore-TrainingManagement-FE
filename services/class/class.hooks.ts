import { useMutation, useQuery } from "@tanstack/react-query";

import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { useApiGet, useApiPost } from "../api/api-hooks";

import { AcademicClassQuery } from "./class.schema";
import {
  AcademicClassCreateDto,
  ClassRegistrationScheduleDto,
} from "./class.dto";
import { classService } from "./class.service";

// React Query implementation for getting classes with pagination and filters
export const useClasses = (query: AcademicClassQuery) => {
  return useQuery({
    queryKey: ["classes", query],
    queryFn: () => classService.getClasses(query),
  });
};

// Hook for getting classes by major and batch
export const useClassesByMajorAndBatch = (
  majorId: string,
  batchId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ["classes", "major", majorId, "batch", batchId],
    queryFn: () => classService.getClassesByMajorAndBatch(majorId, batchId),
    enabled: enabled && !!majorId && !!batchId,
  });
};

// Alternative using custom hook
export const useClassesWithCustomHook = (query: AcademicClassQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useApiGet(
    courseClient,
    `${API_ENDPOINTS.CLASSES}/page`,
    { params },
    {
      // Optional callbacks
      onSuccess: (_data) => {
        // Success handling
      },
      onError: (_error) => {
        // Error handling
      },
    }
  );
};

// Mutation for creating a class
export const useCreateClass = () => {
  return useMutation({
    mutationFn: (classData: AcademicClassCreateDto) =>
      classService.createClass(classData),
  });
};

// Alternative using custom hook
export const useCreateClassWithCustomHook = () => {
  return useApiPost<AcademicClassCreateDto>(
    courseClient,
    API_ENDPOINTS.CLASSES
  );
};

// Mutation for updating a class
export const useUpdateClass = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcademicClassCreateDto }) =>
      classService.updateClass(id, data),
  });
};

// Mutation for deleting a class
export const useDeleteClass = () => {
  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
  });
};

// Mutation for enabling class registration
export const useEnableClassRegistration = () => {
  return useMutation({
    mutationFn: (id: string) => classService.enableRegistration(id),
  });
};

// Mutation for disabling class registration
export const useDisableClassRegistration = () => {
  return useMutation({
    mutationFn: (id: string) => classService.disableRegistration(id),
  });
};

// Hook for getting a class by ID
export const useClassById = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id),
    enabled: !!id, // Only run query if id is provided
  });
};

// Hook for getting classes by semester ID
export const useClassesBySemesterId = (semesterId: string) => {
  return useQuery({
    queryKey: ["classesBySemester", semesterId],
    queryFn: () => classService.getClassesBySemesterId(semesterId),
    enabled: !!semesterId, // Only run query if semesterId is provided
  });
};

// Hook for getting classes by course ID
export const useClassesByCourseId = (courseId: string) => {
  return useQuery({
    queryKey: ["classesByCourse", courseId],
    queryFn: () => classService.getClassesByCourseId(courseId),
    enabled: !!courseId, // Only run query if courseId is provided
  });
};

// Mutation for setting class registration schedule
export const useCreateClassRegistrationSchedule = () => {
  return useMutation({
    mutationFn: (scheduleData: ClassRegistrationScheduleDto) =>
      classService.createClassRegistrationSchedule(scheduleData),
  });
};

// Alternative using custom hook
export const useCreateClassRegistrationScheduleWithCustomHook = () => {
  return useApiPost<void, ClassRegistrationScheduleDto>(
    courseClient,
    `${API_ENDPOINTS.CLASSES}/registration/schedule-with-times`,
    {},
    {
      onSuccess: (_data) => {
        // Success handling
      },
      onError: (_error) => {
        // Error handling
      },
    }
  );
};
