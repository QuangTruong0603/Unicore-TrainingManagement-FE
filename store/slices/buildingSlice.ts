import {
  Action,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";

import { RootState } from "../index";

import { Building, BuildingQuery } from "@/services/building/building.schema";
import {
  CreateBuildingData,
  UpdateBuildingData,
  buildingService,
} from "@/services/building/building.service";

// Define AppThunk type for async actions
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

interface BuildingState {
  buildings: Building[];
  query: BuildingQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedBuilding: Building | null;
  isSubmitting: boolean;
}

const initialState: BuildingState = {
  buildings: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "",
    isDesc: false,
    filter: {
      locationId: "",
      name: "",
    },
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedBuilding: null,
  isSubmitting: false,
};

const buildingSlice = createSlice({
  name: "building",
  initialState,
  reducers: {
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload;
    },
    setQuery: (state, action: PayloadAction<BuildingQuery>) => {
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
    setSelectedBuilding: (state, action: PayloadAction<Building | null>) => {
      state.selectedBuilding = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    addBuilding: (state, action: PayloadAction<Building>) => {
      state.buildings = [action.payload, ...state.buildings];
      state.total += 1;
    },
    updateBuildingInList: (state, action: PayloadAction<Building>) => {
      const updatedBuilding = action.payload;

      state.buildings = state.buildings.map((building) =>
        building.id === updatedBuilding.id ? updatedBuilding : building
      );
    },
  },
});

export const {
  setBuildings,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedBuilding,
  setSubmitting,
  addBuilding,
  updateBuildingInList,
} = buildingSlice.actions;

// Thunk actions
export const fetchBuildings = (): AppThunk => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { query } = getState().building;
    const response = await buildingService.getBuildings(query); // The response structure follows PaginatedResponse<T> from services/dto.ts

    dispatch(setBuildings(response.data.data || []));
    dispatch(setTotal(response.data.total || 0));
  } catch (error) {
    dispatch(
      setError(
        error instanceof Error ? error.message : "Failed to fetch buildings"
      )
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const createBuilding =
  (data: CreateBuildingData): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const newBuilding = await buildingService.createBuilding(data);

      dispatch(addBuilding(newBuilding));

      return newBuilding;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to create building"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export const updateBuilding =
  (id: string, data: UpdateBuildingData): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const updatedBuilding = await buildingService.updateBuilding(id, data);

      dispatch(updateBuildingInList(updatedBuilding));

      return updatedBuilding;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to update building"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export const toggleBuildingStatus =
  (building: Building): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const updatedBuilding = await buildingService.toggleStatus(building.id);

      dispatch(updateBuildingInList(updatedBuilding));

      return updatedBuilding;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Failed to toggle building status"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export default buildingSlice.reducer;
