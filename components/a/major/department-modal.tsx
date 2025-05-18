import React from "react";
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

import { Department } from "@/services/department/department.schema";

interface DepartmentModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: Partial<Department>) => Promise<void>;
  department?: Department | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

export function DepartmentModal({
  isOpen,
  onOpenChange,
  onSubmit,
  department,
  isSubmitting,
  mode,
}: DepartmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Department>>({
    defaultValues:
      mode === "create"
        ? {
            name: "",
            isActive: true,
          }
        : {
            name: department?.name || "",
            isActive: department?.isActive ?? true,
          },
  });

  // Reset form when department or mode changes
  React.useEffect(() => {
    if (mode === "update" && department) {
      reset({
        name: department.name || "",
        isActive: department.isActive ?? true,
      });
    } else if (mode === "create") {
      reset({
        name: "",
        isActive: true,
      });
    }
  }, [department, mode, reset]);
  const handleFormSubmit = async (data: Partial<Department>) => {
    try {
      await onSubmit(data);
      if (mode === "create") {
        reset();
      }
      onOpenChange(); // Close the modal after successful submission
    } catch {
      // Keep modal open if there's an error
    }
  };

  const title = mode === "create" ? "Add New Department" : "Edit Department";
  const submitButtonText =
    mode === "create" ? "Create Department" : "Update Department";
  const loadingText = mode === "create" ? "Creating..." : "Updating...";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <form
                className="space-y-4"
                id="department-form"
                onSubmit={handleSubmit(handleFormSubmit)}
              >
                {" "}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    errorMessage={errors.name?.message}
                    placeholder="Enter department name"
                  />
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                form="department-form"
                type="submit"
              >
                {isSubmitting ? loadingText : submitButtonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
