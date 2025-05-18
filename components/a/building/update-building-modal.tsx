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
import { updateBuilding } from "@/store/slices/buildingSlice";
import { Building } from "@/services/building/building.schema";
import { UpdateBuildingData } from "@/services/building/building.service";

interface UpdateBuildingModalProps {
  isOpen: boolean;
  building: Building | null;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function UpdateBuildingModal({
  isOpen,
  onOpenChange,
  building,
  onSuccess,
}: UpdateBuildingModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.building);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: building?.name || "",
    },
  });

  // Reset form when modal opens or building changes
  useEffect(() => {
    if (isOpen && building) {
      reset({
        name: building.name || "",
      });
    }
  }, [isOpen, building, reset]);

  // Form submission handler
  const submitHandler = async (data: { name: string }) => {
    try {
      if (!building) return;

      const buildingData: UpdateBuildingData = {
        name: data.name,
      };

      await dispatch(updateBuilding(building.id, buildingData));
      onOpenChange();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update building:", error);
    }
  };

  if (!building) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(submitHandler)}>
          <ModalHeader>Edit Building</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <Input
                  fullWidth
                  required
                  label="Building Name"
                  variant="bordered"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              disabled={isSubmitting}
              variant="flat"
              onPress={onOpenChange}
            >
              Cancel
            </Button>
            <Button color="primary" isLoading={isSubmitting} type="submit">
              Update
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
