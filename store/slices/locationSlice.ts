import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Location,
  LocationFilter,
  LocationQuery,
} from "@/services/location/location.schema";

interface EnhancedLocationQuery extends LocationQuery {
  filters?: LocationFilter;
}

interface LocationState {
  locations: Location[];
  query: EnhancedLocationQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 12,
    searchQuery: "",
    orderBy: "name",
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocations: (state, action: PayloadAction<Location[]>) => {
      state.locations = action.payload;
    },
    setQuery: (state, action: PayloadAction<EnhancedLocationQuery>) => {
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
  },
});

export const { setLocations, setQuery, setTotal, setLoading, setError } =
  locationSlice.actions;

export default locationSlice.reducer;
