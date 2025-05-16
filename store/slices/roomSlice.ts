import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Room, RoomQuery } from "@/services/room/room.schema";
import { roomService } from "@/services/room/room.service";

interface RoomState {
  rooms: Room[];
  query: RoomQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedRoom: Room | null;
}

const initialState: RoomState = {
  rooms: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    searchQuery: "",
    orderBy: "name",
    isDesc: false,
    floorId: "",
    locationId: "",
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedRoom: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    setQuery: (state, action: PayloadAction<RoomQuery>) => {
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
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.rooms = [...state.rooms, action.payload];
      state.total += 1;
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      const index = state.rooms.findIndex(room => room.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.query.pageNumber = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.query.itemsPerpage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRooms
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.rooms = action.payload.data.data || [];
          state.total = action.payload.data.total || 0;
        } else {
          state.rooms = [];
          state.total = 0;
        }
        state.isLoading = false;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? String(action.payload) : "Failed to fetch rooms";
      });
  },
});

export const fetchRooms = createAsyncThunk(
  'room/fetchRooms',
  async (query: RoomQuery, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await roomService.getRooms(query);
      
      dispatch(setRooms(response.data?.data.data || []));
      dispatch(setTotal(response.data?.data.total || 0));

      return response.data;
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : "Failed to fetch rooms"));
      return rejectWithValue(error);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const { 
  setRooms, 
  setQuery, 
  setTotal, 
  setLoading, 
  setError,
  setSelectedRoom,
  addRoom,
  updateRoom,
  setCurrentPage,
  setItemsPerPage
} = roomSlice.actions;

export default roomSlice.reducer;
