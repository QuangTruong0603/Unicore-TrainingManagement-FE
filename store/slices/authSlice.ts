import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ChangePasswordResponseData } from "../../services/auth/auth.dto";

interface AuthState {
  changePassword: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    message: string | null;
  };
}

const initialState: AuthState = {
  changePassword: {
    isLoading: false,
    error: null,
    success: false,
    message: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changePasswordStart(state) {
      state.changePassword.isLoading = true;
      state.changePassword.error = null;
      state.changePassword.success = false;
      state.changePassword.message = null;
    },
    changePasswordSuccess(
      state,
      action: PayloadAction<ChangePasswordResponseData>
    ) {
      state.changePassword.isLoading = false;
      state.changePassword.success = true;
      state.changePassword.message = action.payload.message;
    },
    changePasswordFailure(state, action: PayloadAction<string>) {
      state.changePassword.isLoading = false;
      state.changePassword.error = action.payload;
      state.changePassword.success = false;
    },
    resetChangePasswordState(state) {
      state.changePassword = initialState.changePassword;
    },
  },
});

export const {
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  resetChangePasswordState,
} = authSlice.actions;

export default authSlice.reducer;
