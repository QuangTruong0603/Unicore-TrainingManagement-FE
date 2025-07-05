import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Exam } from "@/services/exam/exam.schema";
import { ExamListFilterParams } from "@/services/exam/exam.dto";

// Enhanced filter interface to support exam filtering
interface ExamFilters extends ExamListFilterParams {
  group?: number;
  type?: number;
  minDuration?: number;
  maxDuration?: number;
}

// Query interface for exam pagination and filtering
interface ExamQuery {
  pageNumber: number;
  itemsPerpage: number;
  orderBy?: string;
  isDesc: boolean;
  filters?: ExamFilters;
}

interface ExamState {
  exams: Exam[];
  query: ExamQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExamState = {
  exams: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    setExams: (state, action: PayloadAction<Exam[]>) => {
      state.exams = action.payload;
    },
    setQuery: (state, action: PayloadAction<ExamQuery>) => {
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
      state.exams = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setExams,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = examSlice.actions;

export default examSlice.reducer;
