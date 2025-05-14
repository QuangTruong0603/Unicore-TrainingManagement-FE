import { useMutation, useQueryClient } from "@tanstack/react-query";

import { studentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { Student } from "./student.schema";

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Student>) =>
      studentClient.post(API_ENDPOINTS.STUDENTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentCode, data }: { studentCode: string; data: Partial<Student> }) =>
      studentClient.put(`${API_ENDPOINTS.STUDENTS}/${studentCode}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentCode: string) =>
      studentClient.delete(`${API_ENDPOINTS.STUDENTS}/${studentCode}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}; 