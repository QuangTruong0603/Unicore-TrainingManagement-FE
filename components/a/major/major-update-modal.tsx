import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Major } from "@/services/major/major.schema";

interface MajorUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  major: Major | null;
}

export const MajorUpdateModal: React.FC<MajorUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  major,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Major
            </ModalHeader>
            <ModalBody>
              <p>Major ID: {major?.id}</p>
              <p>This modal will be implemented later.</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
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
