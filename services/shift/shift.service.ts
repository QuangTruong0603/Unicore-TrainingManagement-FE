import { API_ENDPOINTS } from "../api/api-config";
import { shiftClient } from "../api/http-client";

import { Shift } from "./shift.schema";
import { ShiftResponse } from "./shift.dto";

export const shiftService = {
  /**
   * Get all shifts without pagination
   * @returns Promise with the list of all shifts
   */
  getAllShifts: async (): Promise<{ data: Shift[] }> => {
    return shiftClient.get(API_ENDPOINTS.SHIFTS, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  /**
   * Get a shift by its ID
   * @param id The ID of the shift to retrieve
   * @returns Promise with the shift data
   */
  getShiftById: async (id: string): Promise<ShiftResponse> => {
    return shiftClient.get(`${API_ENDPOINTS.SHIFTS}/${id}`, {
      headers: {
        accept: "text/plain",
      },
    });
  },
};
