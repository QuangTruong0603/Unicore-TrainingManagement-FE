import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Semester, SemesterQuery } from "@/services/semester/semester.schema";

// Enhanced filter interface matching SemesterFilter from semester.schema.ts
interface SemesterFilters {
  semesterNumber?: number;
  year?: number;
  isActive?: boolean | null;
  startDate?: Date;
  endDate?: Date;
  numberOfWeeks?: number;
}

// Extend SemesterQuery to include filters
interface EnhancedSemesterQuery extends SemesterQuery {
  filters?: SemesterFilters;
}

interface SemesterState {
  semesters: Semester[];
  query: EnhancedSemesterQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedSemester: Semester | null;
}

const initialState: SemesterState = {
  semesters: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "",
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedSemester: null,
};

const semesterSlice = createSlice({
  name: "semester",
  initialState,
  reducers: {
    setSemesters: (state, action: PayloadAction<Semester[]>) => {
      state.semesters = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedSemesterQuery>) => {
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
    setSelectedSemester: (state, action: PayloadAction<Semester | null>) => {
      state.selectedSemester = action.payload;
    },
    resetState: (state) => {
      state.semesters = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
      state.selectedSemester = null;
    },
  },
});

export const {
  setSemesters,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedSemester,
  resetState,
} = semesterSlice.actions;
export default semesterSlice.reducer;
