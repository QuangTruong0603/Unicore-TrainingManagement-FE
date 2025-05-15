import { configureStore } from "@reduxjs/toolkit";

import studentReducer from "./slices/studentSlice";
import locationReducer from "./slices/locationSlice";

export const store = configureStore({
  reducer: {
    student: studentReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
