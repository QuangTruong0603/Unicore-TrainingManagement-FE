import { useMutation, useQuery } from "@tanstack/react-query";

import { EnrollmentQuery } from "./enrollment.schema";
import { MultipleEnrollmentCreateData } from "./enrollment.dto";
import { enrollmentService } from "./enrollment.service";

// React Query implementation for getting enrollments
export const useEnrollments = (query: EnrollmentQuery) => {
  return useQuery({
    queryKey: ["enrollments", query],
    queryFn: () => enrollmentService.getEnrollments(query),
  });
};

// Hook for getting enrollment by ID
export const useEnrollmentById = (id: string) => {
  return useQuery({
    queryKey: ["enrollment", id],
    queryFn: () => enrollmentService.getEnrollmentById(id),
    enabled: !!id,
  });
};

// Mutation for creating multiple enrollments
export const useCreateMultipleEnrollments = () => {
  return useMutation({
    mutationFn: (enrollmentData: MultipleEnrollmentCreateData) =>
      enrollmentService.createMultipleEnrollments(enrollmentData),
  });
};
