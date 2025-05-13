import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  MajorGroup,
  MajorGroupFilters,
  MajorGroupQuery,
} from "@/services/major-group/major-group.schema";

interface EnhancedMajorGroupQuery extends MajorGroupQuery {
  filters?: MajorGroupFilters;
}

interface MajorGroupState {
  majorGroups: MajorGroup[];
  query: EnhancedMajorGroupQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MajorGroupState = {
  majorGroups: [],
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

const majorGroupSlice = createSlice({
  name: "majorGroup",
  initialState,
  reducers: {
    setMajorGroups: (state, action: PayloadAction<MajorGroup[]>) => {
      state.majorGroups = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedMajorGroupQuery>) => {
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
      state.majorGroups = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setMajorGroups,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = majorGroupSlice.actions;
export default majorGroupSlice.reducer;
