import { configureStore } from "@reduxjs/toolkit";

import courseReducer from "./slices/courseSlice";
import trainingRoadmapReducer from "./slices/trainingRoadmapSlice";
import confirmDialogReducer from "./slices/confirmDialogSlice";

export const store = configureStore({
  reducer: {
    course: courseReducer,
    trainingRoadmap: trainingRoadmapReducer,
    confirmDialog: confirmDialogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
