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
  Select,
  SelectItem,
} from "@heroui/react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRoom } from "@/store/slices/roomSlice";
import { RoomCreateDto } from "@/services/room/room.schema";
import { Floor } from "@/services/floor/floor.schema";

interface CreateRoomModalProps {
  isOpen: boolean;
  floors: Floor[];
  floorId?: string;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function CreateRoomModal({
  isOpen,
  onOpenChange,
  floors,
  floorId,
  onSuccess,
}: CreateRoomModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.room);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<RoomCreateDto>({
    defaultValues: {
      name: "",
      availableSeats: 0,
      floorId: floorId || "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        availableSeats: 0,
        floorId: floorId || "",
      });
    }
  }, [isOpen, reset, floorId]);

  const onSubmit = async (data: RoomCreateDto) => {
    try {
      await dispatch(createRoom(data));
      onOpenChange();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the createRoom thunk
      console.error("Failed to create room:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Room</ModalHeader>
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

              <Select
                errorMessage={errors.floorId?.message}
                isDisabled={!!floorId}
                isInvalid={!!errors.floorId}
                label="Floor"
                placeholder="Select a floor"
                value={watch("floorId")}
                onChange={(e) => setValue("floorId", e.target.value)}
              >
                {floors.map((floor) => (
                  <SelectItem key={floor.id}>
                    {floor.name} ({floor.building?.name || "Unknown Building"})
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              type="button"
              variant="flat"
              onClick={onOpenChange}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            >
              Create Room
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
