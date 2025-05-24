import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { Course } from "../../services/course/course.schema";
import { courseService } from "../../services/course/course.service";

interface CoursesByMajorState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CoursesByMajorState = {
  courses: [],
  isLoading: false,
  error: null,
};

// Async thunk for fetching courses by major ID
export const fetchCoursesByMajorId = createAsyncThunk(
  "coursesByMajor/fetchByMajorId",
  async (majorId: string, { rejectWithValue }) => {
    try {
      const response = await courseService.getCoursesByMajorId(majorId);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses by major"
      );
    }
  }
);

const coursesByMajorSlice = createSlice({
  name: "coursesByMajor",
  initialState,
  reducers: {
    resetCoursesByMajor(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursesByMajorId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCoursesByMajorId.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.isLoading = false;
          state.courses = action.payload;
        }
      )
      .addCase(fetchCoursesByMajorId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCoursesByMajor } = coursesByMajorSlice.actions;
export default coursesByMajorSlice.reducer;
