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

import { Major } from "@/services/major/major.schema";
import { useMajorGroups } from "@/services/major-group/major-group.hooks";

interface MajorModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: Partial<Major>) => Promise<void>;
  major?: Major | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

export function MajorModal({
  isOpen,
  onOpenChange,
  onSubmit,
  major,
  isSubmitting,
  mode,
}: MajorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<Major>>({
    defaultValues:
      mode === "create"
        ? {
            name: "",
            costPerCredit: 0,
            majorGroupId: "",
            isActive: true,
          }
        : {
            name: major?.name || "",
            costPerCredit: major?.costPerCredit || 0,
            majorGroupId: major?.majorGroupId || "",
            isActive: major?.isActive ?? true,
          },
  });

  // Get major groups for dropdown
  const { majorGroups, fetchMajorGroups } = useMajorGroups();
  const [selectedMajorGroupId, setSelectedMajorGroupId] = useState<string>(
    major?.majorGroupId || ""
  );

  // Fetch major groups on mount
  useEffect(() => {
    fetchMajorGroups();
  }, [fetchMajorGroups]);

  // Reset form when major or mode changes
  useEffect(() => {
    if (mode === "create") {
      reset({
        name: "",
        costPerCredit: 0,
        majorGroupId: "",
        isActive: true,
      });
    } else {
      reset({
        name: major?.name || "",
        costPerCredit: major?.costPerCredit || 0,
        majorGroupId: major?.majorGroupId || "",
        isActive: major?.isActive ?? true,
      });
    }
    setSelectedMajorGroupId(major?.majorGroupId || "");
  }, [major, mode, reset]);

  const handleSelectionChange = (value: string) => {
    setSelectedMajorGroupId(value);
    setValue("majorGroupId", value);
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
            {mode === "create" ? "Create Major" : "Update Major"}
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
                  placeholder="Enter major name"
                  {...register("name", { required: "Name is required" })}
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-small font-medium text-default-700"
                  htmlFor="costPerCredit"
                >
                  Cost Per Credit
                </label>
                <Input
                  id="costPerCredit"
                  placeholder="Enter cost per credit"
                  type="number"
                  {...register("costPerCredit", {
                    required: "Cost per credit is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Cost per credit must be positive",
                    },
                  })}
                  errorMessage={errors.costPerCredit?.message}
                  isInvalid={!!errors.costPerCredit}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-small font-medium text-default-700"
                  htmlFor="majorGroupId"
                >
                  Major Group
                </label>
                <Select
                  errorMessage={errors.majorGroupId?.message}
                  id="majorGroupId"
                  isInvalid={!!errors.majorGroupId}
                  placeholder="Select a major group"
                  selectedKeys={
                    selectedMajorGroupId ? [selectedMajorGroupId] : []
                  }
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;

                    handleSelectionChange(key);
                  }}
                >
                  {majorGroups.map((group) => (
                    <SelectItem key={group.id}>{group.name}</SelectItem>
                  ))}
                </Select>
                {errors.majorGroupId && (
                  <p className="text-danger text-xs mt-1">
                    {errors.majorGroupId.message}
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
