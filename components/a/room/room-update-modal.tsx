import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Room } from "@/services/room/room.schema";

interface RoomUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  room: Room | null;
}

export const RoomUpdateModal: React.FC<RoomUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  room,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Room
            </ModalHeader>
            <ModalBody>
              <p>Room ID: {room?.id}</p>
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
