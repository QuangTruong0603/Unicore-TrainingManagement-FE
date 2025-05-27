import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  AcademicClass,
  AcademicClassQuery,
  AcademicClassFilter,
} from "../../services/class/class.schema";

// Enhanced filter interface matching AcademicClassFilter
interface EnhancedAcademicClassQuery extends AcademicClassQuery {
  filters?: AcademicClassFilter;
}

interface ClassState {
  classes: AcademicClass[];
  query: EnhancedAcademicClassQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedClass: AcademicClass | null;
}

const initialState: ClassState = {
  classes: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedClass: null,
};

// No async thunks - we'll use React Query hooks instead

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    setClasses: (state, action: PayloadAction<AcademicClass[]>) => {
      state.classes = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedAcademicClassQuery>) => {
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
    setSelectedClass: (state, action: PayloadAction<AcademicClass | null>) => {
      state.selectedClass = action.payload;
    },
    resetState: (state) => {
      state.classes = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
      state.selectedClass = null;
    },
  },
});

export const {
  setClasses,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedClass,
  resetState,
} = classSlice.actions;

export default classSlice.reducer;
