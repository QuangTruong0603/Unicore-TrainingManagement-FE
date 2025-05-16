import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Location,
  LocationFilter,
  LocationQuery,
} from "@/services/location/location.schema";
import { locationService } from "@/services/location/location.service";
import { CreateLocationData, UpdateLocationData } from "@/services/location/location.dto";

interface EnhancedLocationQuery extends LocationQuery {
  filters?: LocationFilter;
}

interface LocationState {
  locations: Location[];
  query: EnhancedLocationQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedLocation: Location | null;
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
  selectedLocation: null,
};

// Async thunks
export const fetchLocations = createAsyncThunk(
  "location/fetchLocations",
  async (query: EnhancedLocationQuery, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await locationService.getLocations(query);
      
      // Ensure locations is always an array even if data is undefined
      const locations = response.data?.data || [];
      const total = response.data?.total || 0;
      
      dispatch(setLocations(locations));
      dispatch(setTotal(total));
      
      return { locations, total };
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : "Failed to fetch locations"));
      return rejectWithValue(error);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createLocation = createAsyncThunk(
  'location/createLocation',
  async (data: CreateLocationData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await locationService.createLocation(data);
      // Refresh the locations list after creating a new one
      const state = getState() as { location: LocationState };
      dispatch(fetchLocations(state.location.query));
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create location");
    }
  }
);

export const updateLocation = createAsyncThunk(
  'location/updateLocation',
  async ({ id, data }: { id: string; data: UpdateLocationData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await locationService.updateLocation(id, data);
      // Refresh the locations list after updating
      const state = getState() as { location: LocationState };
      dispatch(fetchLocations(state.location.query));
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update location");
    }
  }
);

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
    setSelectedLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLocations
      .addCase(fetchLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload.locations || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "An error occurred";
      })
      
      // createLocation
      .addCase(createLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "An error occurred";
      })
      
      // updateLocation
      .addCase(updateLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "An error occurred";
      });
  },
});

export const { setLocations, setQuery, setTotal, setLoading, setError, setSelectedLocation } =
  locationSlice.actions;

export default locationSlice.reducer;
