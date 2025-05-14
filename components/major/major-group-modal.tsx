import React, { useEffect, useState } from "react";
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

import { MajorGroup } from "@/services/major-group/major-group.schema";
import { useDepartments } from "@/services/department/department.hooks";

interface MajorGroupModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: Partial<MajorGroup>) => Promise<void>;
  majorGroup?: MajorGroup | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

export function MajorGroupModal({
  isOpen,
  onOpenChange,
  onSubmit,
  majorGroup,
  isSubmitting,
  mode,
}: MajorGroupModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<MajorGroup>>({
    defaultValues:
      mode === "create"
        ? {
            name: "",
            departmentId: "",
            isActive: true,
          }
        : {
            name: majorGroup?.name || "",
            departmentId: majorGroup?.departmentId || "",
            isActive: majorGroup?.isActive ?? true,
          },
  });

  // Get departments for dropdown
  const { departments, fetchDepartments } = useDepartments();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
    majorGroup?.departmentId || ""
  );

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Reset form when majorGroup or mode changes
  useEffect(() => {
    if (mode === "create") {
      reset({
        name: "",
        departmentId: "",
        isActive: true,
      });
    } else {
      reset({
        name: majorGroup?.name || "",
        departmentId: majorGroup?.departmentId || "",
        isActive: majorGroup?.isActive ?? true,
      });
    }
    setSelectedDepartmentId(majorGroup?.departmentId || "");
  }, [majorGroup, mode, reset]);

  const handleSelectionChange = (value: string) => {
    setSelectedDepartmentId(value);
    setValue("departmentId", value);
  };
  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
      .then(() => {
        onOpenChange(); // Close the modal after successful submission
      })
      .catch(() => {
        // Keep modal open if there's an error
      });
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={onFormSubmit}>
          <ModalHeader>
            {mode === "create" ? "Create Major Group" : "Update Major Group"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-small font-medium text-default-700"
                  htmlFor="name"
                >
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter major group name"
                  {...register("name", { required: "Name is required" })}
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-small font-medium text-default-700"
                  htmlFor="departmentId"
                >
                  Department
                </label>
                <Select
                  errorMessage={errors.departmentId?.message}
                  id="departmentId"
                  isInvalid={!!errors.departmentId}
                  placeholder="Select a department"
                  selectedKeys={
                    selectedDepartmentId ? [selectedDepartmentId] : []
                  }
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;

                    handleSelectionChange(key);
                  }}
                >
                  {departments.map((department) => (
                    <SelectItem key={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </Select>
                {errors.departmentId && (
                  <p className="text-danger text-xs mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
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
            <Button
              color="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            >
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
