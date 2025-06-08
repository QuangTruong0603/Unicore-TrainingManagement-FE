import {
  Action,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";

import { RootState } from "../index";

import { floorService } from "@/services/floor/floor.service";
import {
  CreateFloorDto,
  Floor,
  FloorQuery,
  UpdateFloorDto,
} from "@/services/floor/floor.schema";

// Define AppThunk type for async actions
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

interface FloorState {
  floors: Floor[];
  query: FloorQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedFloor: Floor | null;
  isSubmitting: boolean;
}

const initialState: FloorState = {
  floors: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "name",
    isDesc: false,
    filter: {
      locationId: "",
      name: "",
      buildingId: "",
    },
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedFloor: null,
  isSubmitting: false,
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
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    addFloor: (state, action: PayloadAction<Floor>) => {
      state.floors = [action.payload, ...state.floors];
      state.total += 1;
    },
    updateFloorInList: (state, action: PayloadAction<Floor>) => {
      const updatedFloor = action.payload;

      state.floors = state.floors.map((floor) =>
        floor.id === updatedFloor.id ? updatedFloor : floor
      );
    },
  },
});

export const {
  setFloors,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedFloor,
  setSubmitting,
  addFloor,
  updateFloorInList,
} = floorSlice.actions;

export default floorSlice.reducer;

// Thunk actions
export const fetchFloors = (): AppThunk => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { query } = getState().floor;
    const { selectedLocation } = getState().location;

    // Use selectedLocation if available
    if (selectedLocation && !query.filter?.locationId) {
      const updatedQuery = {
        ...query,
        filter: {
          ...query.filter,
          locationId: selectedLocation.id,
        },
      };

      dispatch(setQuery(updatedQuery));
      const response = await floorService.getFloors(updatedQuery);

      dispatch(setFloors(response.data.data || []));
      dispatch(setTotal(response.data.total || 0));
    } else {
      const response = await floorService.getFloors(query);

      dispatch(setFloors(response.data.data || []));
      dispatch(setTotal(response.data.total || 0));
    }
  } catch (error) {
    dispatch(
      setError(
        error instanceof Error ? error.message : "Failed to fetch floors"
      )
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const createFloor =
  (data: CreateFloorDto): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const newFloor = await floorService.createFloor(data);

      dispatch(addFloor(newFloor.data));

      return newFloor;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to create floor"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export const updateFloor =
  (id: string, data: UpdateFloorDto): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const updatedFloor = await floorService.updateFloor(id, data);

      dispatch(updateFloorInList(updatedFloor.data));

      return updatedFloor;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to update floor"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export const toggleFloorStatus =
  (floor: Floor): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const updatedFloor = await floorService.toggleStatus(floor.id);

      dispatch(updateFloorInList(updatedFloor.data));

      return updatedFloor;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Failed to toggle floor status"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
