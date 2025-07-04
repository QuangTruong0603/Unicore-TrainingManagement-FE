import { configureStore } from "@reduxjs/toolkit";

import studentReducer from "./slices/studentSlice";
import locationReducer from "./slices/locationSlice";
import coursesByMajorReducer from "./slices/coursesByMajorSlice";
import courseReducer from "./slices/courseSlice";
import semesterReducer from "./slices/semesterSlice";
import classReducer from "./slices/classSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import lecturerReducer from "./slices/lecturerSlice";
import examReducer from "./slices/examSlice";

export const store = configureStore({
  reducer: {
    student: studentReducer,
    location: locationReducer,
    coursesByMajor: coursesByMajorReducer,
    course: courseReducer,
    semester: semesterReducer,
    class: classReducer,
    enrollment: enrollmentReducer,
    lecturer: lecturerReducer,
    exam: examReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
