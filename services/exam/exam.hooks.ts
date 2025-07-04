import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ExamQuery } from "./exam.schema";
import {
  ExamCreateDto,
  ExamUpdateDto,
  BulkExamDeleteDto,
  ExamConflictCheckDto,
  AddEnrollmentToExamDto,
} from "./exam.dto";
import { examService } from "./exam.service";

// React Query implementation for getting exams
export const useExams = (query: ExamQuery) => {
  return useQuery({
    queryKey: ["exams", query],
    queryFn: () => examService.getExams(query),
  });
};

// Hook for getting exam by ID
export const useExamById = (id: string) => {
  return useQuery({
    queryKey: ["exam", id],
    queryFn: () => examService.getExamById(id),
    enabled: !!id,
  });
};

// Mutation for creating exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examData: ExamCreateDto) => examService.createExam(examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-statistics"] });
    },
  });
};

// Mutation for updating exam
export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamUpdateDto }) =>
      examService.updateExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["exam-statistics"] });
    },
  });
};

// Mutation for deleting exam
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => examService.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-statistics"] });
    },
  });
};

// Mutation for bulk deleting exams
export const useBulkDeleteExams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkExamDeleteDto) => examService.bulkDeleteExams(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-statistics"] });
    },
  });
};

// Hook for getting exam statistics
export const useExamStatistics = () => {
  return useQuery({
    queryKey: ["exam-statistics"],
    queryFn: () => examService.getExamStatistics(),
  });
};

// Mutation for checking exam conflicts
export const useCheckExamConflicts = () => {
  return useMutation({
    mutationFn: (data: ExamConflictCheckDto) =>
      examService.checkExamConflicts(data),
  });
};

// Hook for getting exams by academic class
export const useExamsByAcademicClass = (academicClassId: string) => {
  return useQuery({
    queryKey: ["exams", "academic-class", academicClassId],
    queryFn: () => examService.getExamsByAcademicClass(academicClassId),
    enabled: !!academicClassId,
  });
};

// Hook for getting exams by room
export const useExamsByRoom = (roomId: string) => {
  return useQuery({
    queryKey: ["exams", "room", roomId],
    queryFn: () => examService.getExamsByRoom(roomId),
    enabled: !!roomId,
  });
};

// Hook for getting upcoming exams
export const useUpcomingExams = (days?: number) => {
  return useQuery({
    queryKey: ["exams", "upcoming", days],
    queryFn: () => examService.getUpcomingExams(days),
  });
};

// Hook for getting student's upcoming exams
export const useStudentUpcomingExams = (studentId: string, days?: number) => {
  return useQuery({
    queryKey: ["exams", "student", studentId, "upcoming", days],
    queryFn: async () => {
      // This would need to be implemented in the service
      // For now, return upcoming exams and filter on client-side if needed
      return examService.getUpcomingExams(days);
    },
    enabled: !!studentId,
  });
};

// Mutation for adding enrollment to exam
export const useAddEnrollmentToExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addEnrollmentDto: AddEnrollmentToExamDto) =>
      examService.addEnrollmentToExam(addEnrollmentDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-statistics"] });
    },
  });
};
