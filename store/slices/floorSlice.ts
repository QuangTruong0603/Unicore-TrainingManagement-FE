import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Floor, FloorQuery } from "@/services/floor/floor.schema";

interface FloorState {
  floors: Floor[];
  query: FloorQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedFloor: Floor | null;
}

const initialState: FloorState = {
  floors: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    searchQuery: "",
    orderBy: "name",
    isDesc: false,
    buildingId: "",
    locationId: "",
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedFloor: null,
};

const floorSlice = createSlice({
  name: "floor",
  initialState,
  reducers: {
    setFloors: (state, action: PayloadAction<Floor[]>) => {
      state.floors = action.payload;
    },
    setQuery: (state, action: PayloadAction<FloorQuery>) => {
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
    setSelectedFloor: (state, action: PayloadAction<Floor | null>) => {
      state.selectedFloor = action.payload;
    },
  },
});

export const { 
  setFloors, 
  setQuery, 
  setTotal, 
  setLoading, 
  setError,
  setSelectedFloor
} = floorSlice.actions;

export default floorSlice.reducer;
