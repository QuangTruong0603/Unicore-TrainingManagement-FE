import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  Room,
  RoomQuery,
  RoomCreateDto,
  RoomUpdateDto,
} from "@/services/room/room.schema";
import { roomService } from "@/services/room/room.service";

interface RoomState {
  rooms: Room[];
  query: RoomQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedRoom: Room | null;
  isSubmitting: boolean;
}

const initialState: RoomState = {
  rooms: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "name",
    isDesc: false,
    filter: {
      locationId: "",
      name: "",
      floorId: "",
      buildingId: "",
    },
  },
  total: 0,
  isLoading: false,
  error: null,
  selectedRoom: null,
  isSubmitting: false,
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
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.rooms = [action.payload, ...state.rooms];
      state.total += 1;
    },
    updateRoomInList: (state, action: PayloadAction<Room>) => {
      const updatedRoom = action.payload;

      state.rooms = state.rooms.map((room) =>
        room.id === updatedRoom.id ? updatedRoom : room
      );
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.query.pageNumber = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.query.itemsPerpage = action.payload;
    },
  },
});

export const {
  setRooms,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setSelectedRoom,
  setSubmitting,
  addRoom,
  updateRoomInList,
  setCurrentPage,
  setItemsPerPage,
} = roomSlice.actions;

export default roomSlice.reducer;

// Thunk actions
export const fetchRooms = (query: RoomQuery) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await roomService.getRooms(query);

    dispatch(setRooms(response.data.data || []));
    dispatch(setTotal(response.data.total || 0));

    return response.data;
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : "Failed to fetch rooms")
    );
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createRoom = (data: RoomCreateDto) => async (dispatch: any) => {
  try {
    dispatch(setSubmitting(true));
    dispatch(setError(null));

    const newRoom = await roomService.createRoom(data);

    dispatch(addRoom(newRoom));

    return newRoom;
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : "Failed to create room")
    );
    throw error;
  } finally {
    dispatch(setSubmitting(false));
  }
};

export const updateRoom =
  (id: string, data: RoomUpdateDto) => async (dispatch: any) => {
    try {
      dispatch(setSubmitting(true));
      dispatch(setError(null));

      const updatedRoom = await roomService.updateRoom(id, data);

      dispatch(updateRoomInList(updatedRoom));

      return updatedRoom;
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to update room"
        )
      );
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

export const toggleRoomStatus = (room: Room) => async (dispatch: any) => {
  try {
    dispatch(setSubmitting(true));
    dispatch(setError(null));

    const updatedRoom = await roomService.toggleStatus(room.id);

    dispatch(updateRoomInList(updatedRoom));

    return updatedRoom;
  } catch (error) {
    dispatch(
      setError(
        error instanceof Error ? error.message : "Failed to toggle room status"
      )
    );
    throw error;
  } finally {
    dispatch(setSubmitting(false));
  }
};
