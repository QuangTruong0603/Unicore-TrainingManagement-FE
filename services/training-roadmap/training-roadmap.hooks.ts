import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { courseClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";
import { useApiGet, useApiPost } from "../api/api-hooks";

import { TrainingRoadmapQuery } from "./training-roadmap.schema";
import {
  CreateTrainingRoadmapData,
  UpdateTrainingRoadmapData,
} from "./training-roadmap.dto";
import { trainingRoadmapService } from "./training-roadmap.service";

// React Query implementation
export const useTrainingRoadmaps = (query: TrainingRoadmapQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useQuery({
    queryKey: ["trainingRoadmaps", query],
    queryFn: () =>
      courseClient.get(`${API_ENDPOINTS.TRAINING_ROADMAPS}/page`, { params }),
  });
};

// Get a single training roadmap by ID
export const useTrainingRoadmap = (id: string) => {
  return useQuery({
    queryKey: ["trainingRoadmap", id],
    queryFn: () => courseClient.get(`${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}`),
    enabled: !!id,
  });
};

// Using our custom hooks directly (alternative approach)
export const useTrainingRoadmapsWithCustomHook = (
  query: TrainingRoadmapQuery
) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useApiGet(
    courseClient,
    `${API_ENDPOINTS.TRAINING_ROADMAPS}/page`,
    { params },
    {
      // Optional callbacks
    }
  );
};

// Mutation for creating a training roadmap
export const useCreateTrainingRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingRoadmapData) =>
      trainingRoadmapService.createTrainingRoadmap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingRoadmaps"] });
    },
  });
};

// Alternative using our custom hook
export const useCreateTrainingRoadmapWithCustomHook = () => {
  return useApiPost<CreateTrainingRoadmapData>(
    courseClient,
    API_ENDPOINTS.TRAINING_ROADMAPS
  );
};

// Mutation for updating a training roadmap
export const useUpdateTrainingRoadmap = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTrainingRoadmapData;
    }) => courseClient.put(`${API_ENDPOINTS.TRAINING_ROADMAPS}/${id}`, data),
  });
};

// Fetch course groups by major ID
export const useCourseGroupsByMajorId = (majorId: string) => {
  return useQuery({
    queryKey: ["courseGroups", majorId],
    queryFn: () => trainingRoadmapService.getCourseGroupsByMajorId(majorId),
    enabled: !!majorId,
  });
};

// Fetch open-for-all course groups
export const useOpenForAllCourseGroups = () => {
  return useQuery({
    queryKey: ["openForAllCourseGroups"],
    queryFn: () => trainingRoadmapService.getOpenForAllCourseGroups(),
  });
};

// Mutation for adding components to a training roadmap
export const useAddComponentsToTrainingRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      trainingRoadmapService.addComponentsToTrainingRoadmap(data),
    onSuccess: (_, variables) => {
      // Invalidate the cache for the training roadmap list
      queryClient.invalidateQueries({ queryKey: ["trainingRoadmaps"] });
      // Also invalidate specific roadmap cache
      if (variables.trainingRoadmapId) {
        queryClient.invalidateQueries({
          queryKey: ["trainingRoadmap", variables.trainingRoadmapId],
        });
      }
    },
  });
};

// Mutation for deleting a training roadmap
export const useDeleteTrainingRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      trainingRoadmapService.deleteTrainingRoadmap(id),
    onSuccess: () => {
      // Invalidate the cache for the training roadmap list to refresh the data
      queryClient.invalidateQueries({ queryKey: ["trainingRoadmaps"] });
    },
  });
};
