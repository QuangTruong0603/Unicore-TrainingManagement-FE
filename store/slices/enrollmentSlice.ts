import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  Enrollment,
  EnrollmentQuery,
  EnrollmentFilter,
} from "../../services/enrollment/enrollment.schema";

// Enhanced filter interface matching EnrollmentFilter
interface EnhancedEnrollmentQuery extends EnrollmentQuery {
  filters?: EnrollmentFilter;
}

interface EnrollmentState {
  enrollments: Enrollment[];
  query: EnhancedEnrollmentQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedEnrollment: Enrollment | null;
  selectedClassIds: string[]; // For tracking selected classes to enroll
  isEnrolling: boolean; // For tracking enrollment process
}

const initialState: EnrollmentState = {
  enrollments: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedEnrollment: null,
  selectedClassIds: [],
  isEnrolling: false,
};

// No async thunks - we'll use React Query hooks instead

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      state.enrollments = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedEnrollmentQuery>) => {
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
    setSelectedEnrollment: (
      state,
      action: PayloadAction<Enrollment | null>
    ) => {
      state.selectedEnrollment = action.payload;
    },
    // Actions for managing selected classes for enrollment
    addSelectedClass: (state, action: PayloadAction<string>) => {
      if (!state.selectedClassIds.includes(action.payload)) {
        state.selectedClassIds.push(action.payload);
      }
    },
    removeSelectedClass: (state, action: PayloadAction<string>) => {
      state.selectedClassIds = state.selectedClassIds.filter(
        (id) => id !== action.payload
      );
    },
    setSelectedClasses: (state, action: PayloadAction<string[]>) => {
      state.selectedClassIds = action.payload;
    },
    clearSelectedClasses: (state) => {
      state.selectedClassIds = [];
    },
    setEnrolling: (state, action: PayloadAction<boolean>) => {
      state.isEnrolling = action.payload;
    },
    // Reset entire state
    resetEnrollmentState: () => initialState,
  },
});

export const {
  setEnrollments,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedEnrollment,
  addSelectedClass,
  removeSelectedClass,
  setSelectedClasses,
  clearSelectedClasses,
  setEnrolling,
  resetEnrollmentState,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
