import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Lecturer, LecturerQuery } from "@/services/lecturer/lecturer.schema";
import { PaginatedResponse } from "@/services/dto";

interface LecturerState {
  lecturers: PaginatedResponse<Lecturer> | null;
  lecturersByMajors: Lecturer[] | null;
  query: LecturerQuery;
  total: number;
  isLoading: boolean;
  isLoadingByMajors: boolean;
  error: string | null;
  errorByMajors: string | null;
}

const initialState: LecturerState = {
  lecturers: null,
  lecturersByMajors: null,
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
  isLoadingByMajors: false,
  error: null,
  errorByMajors: null,
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
    setLecturersByMajors: (state, action: PayloadAction<Lecturer[]>) => {
      state.lecturersByMajors = action.payload;
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
    setLoadingByMajors: (state, action: PayloadAction<boolean>) => {
      state.isLoadingByMajors = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setErrorByMajors: (state, action: PayloadAction<string | null>) => {
      state.errorByMajors = action.payload;
    },
    resetState: (state) => {
      state.lecturers = null;
      state.lecturersByMajors = null;
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.isLoadingByMajors = false;
      state.error = null;
      state.errorByMajors = null;
    },
  },
});

export const {
  setLecturers,
  setLecturersByMajors,
  setQuery,
  setTotal,
  setLoading,
  setLoadingByMajors,
  setError,
  setErrorByMajors,
  resetState,
} = lecturerSlice.actions;

export default lecturerSlice.reducer;
