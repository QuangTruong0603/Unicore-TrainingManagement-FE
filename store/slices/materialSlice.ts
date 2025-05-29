import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Material, MaterialQuery } from "@/services/material/material.schema";
import { materialService } from "@/services/material/material.service";

interface MaterialState {
  materials: Material[];
  query: MaterialQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MaterialState = {
  materials: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "name",
    isDesc: false,
    materialTypeId: undefined,
    courseId: undefined,
  },
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchMaterials = createAsyncThunk(
  "materials/fetchMaterials",
  async ({ courseId, query }: { courseId: string; query: MaterialQuery }, { rejectWithValue }) => {
    try {
      const response = await materialService.getMaterials(courseId, query);
      return {
        materials: response.data?.data || [],
        total: response.data?.total || 0,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch materials");
    }
  }
);

export const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.query.pageNumber = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.query.itemsPerpage = action.payload;
      state.query.pageNumber = 1; // Reset to first page when changing items per page
    },
    setMaterialTypeFilter: (state, action) => {
      state.query.materialTypeId = action.payload;
      state.query.pageNumber = 1; // Reset to first page when changing filter
    },
    setSearchTerm: (state, action) => {
      if (!state.query.filter) {
        state.query.filter = {};
      }
      state.query.filter.name = action.payload;
      state.query.pageNumber = 1; // Reset to first page when searching
    },
    setCourseId: (state, action) => {
      state.query.courseId = action.payload;
    },
    setSorting: (state, action) => {
      state.query.orderBy = action.payload.orderBy;
      state.query.isDesc = action.payload.isDesc;
    },
    resetFilters: (state) => {
      state.query = {
        ...state.query,
        materialTypeId: undefined,
        filter: {
          ...state.query.filter,
          name: undefined,
          materialTypeId: undefined,
        },
        pageNumber: 1,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.materials;
        state.total = action.payload.total;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setItemsPerPage,
  setMaterialTypeFilter,
  setSearchTerm,
  setCourseId,
  setSorting,
  resetFilters,
} = materialSlice.actions;

export default materialSlice.reducer;


