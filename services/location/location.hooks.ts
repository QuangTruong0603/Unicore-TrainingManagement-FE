import { useMutation, useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS } from "../api/api-config";
import { useApiGet, useApiPost } from "../api/api-hooks";
import { locationClient } from "../api/http-client";

import { LocationQuery } from "./location.schema";
import { CreateLocationData } from "./location.dto";

// React Query implementation
export const useLocations = (query: LocationQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.Name": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useQuery({
    queryKey: ["locations", query],
    queryFn: () =>
      locationClient.get(`${API_ENDPOINTS.LOCATIONS}/page`, { params }),
  });
};

// Using our custom hooks directly (alternative approach)
export const useLocationsWithCustomHook = (query: LocationQuery) => {
  const params = {
    "Pagination.PageNumber": query.pageNumber.toString(),
    "Pagination.ItemsPerpage": query.itemsPerpage.toString(),
    ...(query.searchQuery && { "Filter.SearchQuery": query.searchQuery }),
    ...(query.isDesc && { "Order.IsDesc": query.isDesc.toString() }),
  };

  return useApiGet(
    locationClient,
    `${API_ENDPOINTS.LOCATIONS}/page`,
    { params },
    {
      // Optional callbacks
      onSuccess: (data) => console.log("Locations fetched successfully", data),
      onError: (error) => console.error("Failed to fetch locations", error),
    }
  );
};

// Mutation for creating a location
export const useCreateLocation = () => {
  return useMutation({
    mutationFn: (locationData: CreateLocationData) =>
      locationClient.post(API_ENDPOINTS.LOCATIONS, locationData),
  });
};

// Alternative using our custom hook
export const useCreateLocationWithCustomHook = () => {
  return useApiPost<CreateLocationData>(locationClient, API_ENDPOINTS.LOCATIONS);
};
