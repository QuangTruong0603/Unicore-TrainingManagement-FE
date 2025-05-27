import { useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS } from "../api/api-config";
import { shiftClient } from "../api/http-client";
import { useApiGet } from "../api/api-hooks";

import { shiftService } from "./shift.service";

/**
 * Hook to fetch all shifts
 */
export const useAllShifts = () => {
  return useQuery({
    queryKey: ["shifts"],
    queryFn: () => shiftService.getAllShifts(),
  });
};

/**
 * Alternative implementation using our custom hook
 */
export const useAllShiftsWithCustomHook = () => {
  return useApiGet(
    shiftClient,
    API_ENDPOINTS.SHIFTS,
    {},
    {
      // Optional callbacks can be added here when needed
    }
  );
};

/**
 * Hook to fetch a shift by ID
 * @param id The ID of the shift to fetch
 */
export const useShiftById = (id: string) => {
  return useQuery({
    queryKey: ["shift", id],
    queryFn: () => shiftService.getShiftById(id),
    enabled: !!id, // Only run the query if id is provided
  });
};
