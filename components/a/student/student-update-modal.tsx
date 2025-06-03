import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface StudentUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  studentId: string;
}

export const StudentUpdateModal: React.FC<StudentUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  studentId,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Student
            </ModalHeader>
            <ModalBody>
              <p>Student ID: {studentId}</p>
              {/* TODO: Implement student update form */}
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
