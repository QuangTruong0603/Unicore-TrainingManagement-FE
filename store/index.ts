import { configureStore } from "@reduxjs/toolkit";

import courseReducer from "./slices/courseSlice";
import studentReducer from "./slices/studentSlice";
import trainingRoadmapReducer from "./slices/trainingRoadmapSlice";
import confirmDialogReducer from "./slices/confirmDialogSlice";
import majorReducer from "./slices/majorSlice";
import majorGroupReducer from "./slices/majorGroupSlice";
import departmentReducer from "./slices/departmentSlice";
import buildingReducer from "./slices/buildingSlice";
import floorReducer from "./slices/floorSlice";
import roomReducer from "./slices/roomSlice";
import locationReducer from "./slices/locationSlice";
import authReducer from "./slices/authSlice";
import semesterReducer from "./slices/semesterSlice";
import materialReducer from "./slices/materialSlice";
import classReducer from "./slices/classSlice";
import shiftReducer from "./slices/shiftSlice";
import lecturerReducer from "./slices/lecturerSlice";

export const store = configureStore({
  reducer: {
    course: courseReducer,
    trainingRoadmap: trainingRoadmapReducer,
    confirmDialog: confirmDialogReducer,
    major: majorReducer,
    majorGroup: majorGroupReducer,
    department: departmentReducer,
    student: studentReducer,
    building: buildingReducer,
    floor: floorReducer,
    room: roomReducer,
    location: locationReducer,
    auth: authReducer,
    semester: semesterReducer,
    material: materialReducer,
    class: classReducer,
    shift: shiftReducer,
    lecturer: lecturerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
