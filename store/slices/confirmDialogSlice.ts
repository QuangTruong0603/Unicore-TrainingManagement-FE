import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const initialState: ConfirmDialogState = {
  isOpen: false,
  title: "Confirm Action",
  message: "Are you sure you want to continue?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  onConfirm: () => {},
  onCancel: undefined,
};

const confirmDialogSlice = createSlice({
  name: "confirmDialog",
  initialState,
  reducers: {
    openConfirmDialog: (
      state,
      action: PayloadAction<Partial<ConfirmDialogState>>
    ) => {
      return {
        ...state,
        isOpen: true,
        ...action.payload,
      };
    },
    closeConfirmDialog: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openConfirmDialog, closeConfirmDialog } =
  confirmDialogSlice.actions;
export default confirmDialogSlice.reducer;
