import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Major, MajorFilters, MajorQuery } from "@/services/major/major.schema";

interface EnhancedMajorQuery extends MajorQuery {
  filters?: MajorFilters;
}

interface MajorState {
  majors: Major[];
  query: EnhancedMajorQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MajorState = {
  majors: [],
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

const majorSlice = createSlice({
  name: "major",
  initialState,
  reducers: {
    setMajors: (state, action: PayloadAction<Major[]>) => {
      state.majors = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedMajorQuery>) => {
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
      state.majors = [];
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setMajors,
  setQuery,
  setTotal,
  setLoading,
  setError,
  resetState,
} = majorSlice.actions;
export default majorSlice.reducer;
