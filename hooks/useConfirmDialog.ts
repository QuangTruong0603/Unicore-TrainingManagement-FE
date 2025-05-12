import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { openConfirmDialog } from "@/store/slices/confirmDialogSlice";

interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => void;
}

const useConfirmDialog = () => {
  const dispatch = useAppDispatch();

  const confirmDialog = useCallback(
    (onConfirm: () => void, options?: ConfirmDialogOptions) => {
      dispatch(
        openConfirmDialog({
          onConfirm,
          ...options,
        })
      );
    },
    [dispatch]
  );

  return { confirmDialog };
};

export default useConfirmDialog;
