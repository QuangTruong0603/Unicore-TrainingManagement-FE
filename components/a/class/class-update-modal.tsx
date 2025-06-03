import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ClassUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  classId: string;
}

export const ClassUpdateModal: React.FC<ClassUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  classId,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Class
            </ModalHeader>
            <ModalBody>
              <p>Class ID: {classId}</p>
              {/* TODO: Implement class update form */}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={onClose}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
