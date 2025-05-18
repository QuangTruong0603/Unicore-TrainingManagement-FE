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
import { updateFloor } from "@/store/slices/floorSlice";
import { Floor, UpdateFloorDto } from "@/services/floor/floor.schema";

interface UpdateFloorModalProps {
  isOpen: boolean;
  floor: Floor | null;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function UpdateFloorModal({
  isOpen,
  floor,
  onOpenChange,
  onSuccess,
}: UpdateFloorModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.floor);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFloorDto>({
    defaultValues: {
      name: floor?.name || "",
    },
  });

  // Update form when floor changes
  useEffect(() => {
    if (floor) {
      reset({
        name: floor.name,
      });
    }
  }, [floor, reset]);

  const onSubmit = async (data: UpdateFloorDto) => {
    if (!floor) return;

    try {
      await dispatch(updateFloor(floor.id, data));
      onOpenChange();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the updateFloor thunk
      console.error("Failed to update floor:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Update Floor</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Floor Name"
                placeholder="Enter floor name"
                {...register("name", {
                  required: "Floor name is required",
                  maxLength: {
                    value: 100,
                    message: "Floor name cannot exceed 100 characters",
                  },
                })}
                errorMessage={errors.name?.message}
                isInvalid={!!errors.name}
              />

              {floor && (
                <div className="text-sm text-gray-600">
                  <p>Building: {floor.building?.name || "N/A"}</p>
                  <p>Total Rooms: {floor.totalRoom}</p>
                  <p>Status: {floor.isActive ? "Active" : "Inactive"}</p>
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
              Update Floor
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
