import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Course, CourseQuery } from "@/services/course/course.schema";

// Enhanced filter interface to support our advanced filtering
interface CourseFilters {
  priceRange?: [number, number];
  creditRange?: [number, number];
  majorIds?: string[];
  isOpening?: boolean | null;
  isHavePracticeClass?: boolean | null;
  isUseForCalculateScore?: boolean | null;
  minCreditCanApply?: number;
}

// Extend CourseQuery to include filters
interface EnhancedCourseQuery extends CourseQuery {
  filters?: CourseFilters;
}

interface CourseState {
  courses: Course[];
  query: EnhancedCourseQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    searchQuery: "",
    orderBy: "name",
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedCourseQuery>) => {
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
      state.courses = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCourses,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = courseSlice.actions;
export default courseSlice.reducer;
