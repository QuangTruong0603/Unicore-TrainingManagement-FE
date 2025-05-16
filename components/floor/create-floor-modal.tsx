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
import { createFloor } from "@/store/slices/floorSlice";
import { CreateFloorDto } from "@/services/floor/floor.schema";
import { Building } from "@/services/building/building.schema";

interface CreateFloorModalProps {
  isOpen: boolean;
  buildings: Building[];
  buildingId?: string;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function CreateFloorModal({
  isOpen,
  onOpenChange,
  buildings,
  buildingId,
  onSuccess,
}: CreateFloorModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.floor);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CreateFloorDto>({
    defaultValues: {
      name: "",
      buildingId: buildingId || "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        buildingId: buildingId || "",
      });
    }
  }, [isOpen, reset, buildingId]);

  const onSubmit = async (data: CreateFloorDto) => {
    try {
      await dispatch(createFloor(data));
      onOpenChange();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the createFloor thunk
      console.error("Failed to create floor:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Floor</ModalHeader>
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

              <Select
                errorMessage={errors.buildingId?.message}
                isDisabled={!!buildingId}
                isInvalid={!!errors.buildingId}
                label="Building"
                placeholder="Select a building"
                value={watch("buildingId")}
                onChange={(e) => setValue("buildingId", e.target.value)}
              >
                {buildings.map((building) => (
                  <SelectItem key={building.id}>{building.name}</SelectItem>
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
              Create Floor
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
