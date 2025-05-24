import { configureStore } from "@reduxjs/toolkit";

import studentReducer from "./slices/studentSlice";
import locationReducer from "./slices/locationSlice";
import coursesByMajorReducer from "./slices/coursesByMajorSlice";
import semesterReducer from "./slices/semesterSlice";

export const store = configureStore({
  reducer: {
    student: studentReducer,
    location: locationReducer,
    coursesByMajor: coursesByMajorReducer,
    semester: semesterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
