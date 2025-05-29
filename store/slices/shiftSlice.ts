import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Shift } from "@/services/shift/shift.schema";

interface ShiftState {
  shifts: Shift[];
  currentShift: Shift | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShiftState = {
  shifts: [],
  currentShift: null,
  isLoading: false,
  error: null,
};

const shiftSlice = createSlice({
  name: "shift",
  initialState,
  reducers: {
    setShifts: (state, action: PayloadAction<Shift[]>) => {
      state.shifts = action.payload;
    },
    setCurrentShift: (state, action: PayloadAction<Shift | null>) => {
      state.currentShift = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      state.shifts = [];
      state.currentShift = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setShifts, setCurrentShift, setLoading, setError, resetState } =
  shiftSlice.actions;

export default shiftSlice.reducer;
