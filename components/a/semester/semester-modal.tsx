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
  Switch,
} from "@heroui/react";

import { Semester } from "@/services/semester/semester.schema";
import {
  CreateSemesterData,
  UpdateSemesterData,
} from "@/services/semester/semester.dto";

interface SemesterModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: any) => Promise<void>;
  semester?: Semester | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

export function SemesterModal({
  isOpen,
  onOpenChange,
  onSubmit,
  semester,
  isSubmitting,
  mode,
}: SemesterModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSemesterData | UpdateSemesterData>({
    defaultValues:
      mode === "create"
        ? {
            semesterNumber: 1,
            year: new Date().getFullYear(),
          }
        : {
            semesterNumber: semester?.semesterNumber || 1,
            year: semester?.year || new Date().getFullYear(),
            isActive: semester?.isActive || false,
          },
  });

  const isActive = watch("isActive");

  // Reset form when modal opens/closes or semester changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        reset({
          semesterNumber: 1,
          year: new Date().getFullYear(),
        });
      } else if (semester) {
        reset({
          semesterNumber: semester.semesterNumber,
          year: semester.year,
          isActive: semester.isActive,
        });
      }
    }
  }, [isOpen, mode, semester, reset]);

  // Handle form submission
  const handleFormSubmit = async (
    data: CreateSemesterData | UpdateSemesterData
  ) => {
    try {
      await onSubmit(data);
      onOpenChange(); // Close the modal on success
    } catch (error) {
      console.error("Error submitting semester:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            {mode === "create" ? "Create Semester" : "Update Semester"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block mb-1" htmlFor="semesterNumber">
                  Semester Number*
                </label>
                <Input
                  errorMessage={errors.semesterNumber?.message}
                  id="semesterNumber"
                  isInvalid={!!errors.semesterNumber}
                  label="Semester Number"
                  max={3}
                  min={1}
                  placeholder="Enter semester number (1-3)"
                  type="number"
                  {...register("semesterNumber", {
                    required: "Semester number is required",
                    min: {
                      value: 1,
                      message: "Semester number must be at least 1",
                    },
                    max: {
                      value: 3,
                      message: "Semester number must not exceed 3",
                    },
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div>
                <label className="block mb-1" htmlFor="year">
                  Year*
                </label>
                <Input
                  errorMessage={errors.year?.message}
                  id="year"
                  isInvalid={!!errors.year}
                  label="Year"
                  max={2030}
                  min={2020}
                  placeholder="Enter year"
                  type="number"
                  {...register("year", {
                    required: "Year is required",
                    min: {
                      value: 2020,
                      message: "Year must be at least 2020",
                    },
                    max: {
                      value: 2030,
                      message: "Year must not exceed 2030",
                    },
                    valueAsNumber: true,
                  })}
                />
              </div>

              {mode === "update" && (
                <div className="flex items-center justify-between">
                  <label htmlFor="isActive">Active Status</label>
                  <Switch
                    id="isActive"
                    isSelected={isActive}
                    onValueChange={(value) => setValue("isActive", value)}
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange()}
            >
              Cancel
            </Button>
            <Button color="primary" isLoading={isSubmitting} type="submit">
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
