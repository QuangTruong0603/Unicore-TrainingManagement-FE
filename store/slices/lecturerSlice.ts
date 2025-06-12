import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Lecturer, LecturerQuery } from "@/services/lecturer/lecturer.schema";
import { PaginatedResponse } from "@/services/dto";

interface LecturerState {
  lecturers: PaginatedResponse<Lecturer> | null;
  query: LecturerQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: LecturerState = {
  lecturers: null,
  query: {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    itemsPerpage: 10,
    searchQuery: "",
    departmentId: undefined,
    by: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const lecturerSlice = createSlice({
  name: "lecturer",
  initialState,
  reducers: {
    setLecturers: (
      state,
      action: PayloadAction<PaginatedResponse<Lecturer>>
    ) => {
      state.lecturers = action.payload;
      state.total = action.payload.data.total;
    },
    setQuery: (state, action: PayloadAction<LecturerQuery>) => {
      state.query = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      state.lecturers = null;
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLecturers,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = lecturerSlice.actions;

export default lecturerSlice.reducer;
