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
import { createBuilding } from "@/store/slices/buildingSlice";
import { CreateBuildingData } from "@/services/building/building.service";

interface CreateBuildingModalProps {
  isOpen: boolean;
  locationId: string;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export function CreateBuildingModal({
  isOpen,
  onOpenChange,
  locationId,
  onSuccess,
}: CreateBuildingModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.building);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
      });
    }
  }, [isOpen, reset]);

  // Form submission handler
  const submitHandler = async (data: { name: string }) => {
    try {
      const buildingData: CreateBuildingData = {
        name: data.name,
        locationId,
      };

      await dispatch(createBuilding(buildingData));
      onOpenChange();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create building:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(submitHandler)}>
          <ModalHeader>Add Building</ModalHeader>
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
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
