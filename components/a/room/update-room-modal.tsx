import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateRoom } from "@/store/slices/roomSlice";
import { Room, RoomUpdateDto } from "@/services/room/room.schema";

interface UpdateRoomModalProps {
  isOpen: boolean;
  room: Room | null;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function UpdateRoomModal({
  isOpen,
  room,
  onOpenChange,
  onSuccess,
}: UpdateRoomModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.room);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomUpdateDto>({
    defaultValues: {
      name: room?.name || "",
      availableSeats: room?.availableSeats || 0,
    },
  });

  // Update form when room changes
  useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        availableSeats: room.availableSeats,
      });
    }
  }, [room, reset]);

  const onSubmit = async (data: RoomUpdateDto) => {
    if (!room) return;

    try {
      await dispatch(updateRoom(room.id, data));
      onOpenChange();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the updateRoom thunk
      console.error("Failed to update room:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Update Room</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Room Name"
                placeholder="Enter room name"
                {...register("name", {
                  required: "Room name is required",
                  maxLength: {
                    value: 100,
                    message: "Room name cannot exceed 100 characters",
                  },
                })}
                errorMessage={errors.name?.message}
                isInvalid={!!errors.name}
              />

              <Input
                label="Available Seats"
                min={0}
                placeholder="Enter available seats"
                type="number"
                {...register("availableSeats", {
                  required: "Available seats is required",
                  min: {
                    value: 0,
                    message: "Available seats must be at least 0",
                  },
                  valueAsNumber: true,
                })}
                errorMessage={errors.availableSeats?.message}
                isInvalid={!!errors.availableSeats}
              />

              {room && (
                <div className="text-sm text-gray-600">
                  <p>Floor: {room.floor?.name || "N/A"}</p>
                  <p>Building: {room.floor?.building?.name || "N/A"}</p>
                  <p>Status: {room.isActive ? "Active" : "Inactive"}</p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              type="button"
              variant="flat"
              onPress={onOpenChange}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            >
              Update Room
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
