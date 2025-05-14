import { configureStore } from "@reduxjs/toolkit";

import courseReducer from "./slices/courseSlice";
import studentReducer from "./slices/studentSlice";
import trainingRoadmapReducer from "./slices/trainingRoadmapSlice";
import confirmDialogReducer from "./slices/confirmDialogSlice";
import majorReducer from "./slices/majorSlice";
import majorGroupReducer from "./slices/majorGroupSlice";
import departmentReducer from "./slices/departmentSlice";

export const store = configureStore({
  reducer: {
    course: courseReducer,
    trainingRoadmap: trainingRoadmapReducer,
    confirmDialog: confirmDialogReducer,
    major: majorReducer,
    majorGroup: majorGroupReducer,
    department: departmentReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
