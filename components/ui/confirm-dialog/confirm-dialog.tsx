import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeConfirmDialog } from "@/store/slices/confirmDialogSlice";

const ConfirmDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  } = useAppSelector((state) => state.confirmDialog);

  const handleClose = () => {
    dispatch(closeConfirmDialog());
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleCancel}>
            {cancelText}
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;
