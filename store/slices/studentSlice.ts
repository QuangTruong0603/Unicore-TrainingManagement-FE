import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Student, StudentQuery } from "@/services/student/student.schema";

export interface PaginatedResponse {
  success: boolean;
  data: {
    data: Student[];
    total: number;
  };
  errors: string[];
}

interface StudentState {
  students: PaginatedResponse | null;
  query: StudentQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: null,
  query: {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    itemsPerpage: 10,
    searchQuery: "",
    by: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<PaginatedResponse>) => {
      state.students = action.payload;
      state.total = action.payload.data.total;
    },
    setQuery: (state, action: PayloadAction<StudentQuery>) => {
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
      state.students = null;
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setStudents,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = studentSlice.actions;

export default studentSlice.reducer; 