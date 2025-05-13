import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  Department,
  DepartmentFilters,
  DepartmentQuery,
} from "@/services/department/department.schema";

interface EnhancedDepartmentQuery extends DepartmentQuery {
  filters?: DepartmentFilters;
}

interface DepartmentState {
  departments: Department[];
  query: EnhancedDepartmentQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    searchQuery: "",
    orderBy: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedDepartmentQuery>) => {
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
      state.departments = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setDepartments,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = departmentSlice.actions;
export default departmentSlice.reducer;
