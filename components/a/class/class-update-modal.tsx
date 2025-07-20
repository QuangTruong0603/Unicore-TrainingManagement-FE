import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

import { AcademicClass } from "@/services/class/class.schema";
import { Room } from "@/services/room/room.schema";
import { Shift } from "@/services/shift/shift.schema";
import { roomService } from "@/services/room/room.service";
import { shiftService } from "@/services/shift/shift.service";

interface ClassUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  academicClass: AcademicClass | null;
  onSubmit: (data: Partial<AcademicClass>) => Promise<void>;
  isSubmitting: boolean;
}

interface ClassUpdateFormData {
  name?: string;
  groupNumber?: number;
  capacity?: number;
  isRegistrable?: boolean;
  minEnrollmentRequired?: number;
}

export const ClassUpdateModal: React.FC<ClassUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  academicClass,
  onSubmit,
  isSubmitting,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassUpdateFormData>({
    defaultValues: {
      name: academicClass?.name || "",
      groupNumber: academicClass?.groupNumber || 1,
      capacity: academicClass?.capacity || 30,
      isRegistrable: academicClass?.isRegistrable || false,
      minEnrollmentRequired: academicClass?.minEnrollmentRequired || 1,
    },
  });

  // Fetch necessary data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setIsLoadingData(true);
        try {
          // Fetch rooms
          const roomResponse = await roomService.getAllRooms();

          setRooms(roomResponse);

          // Fetch shifts
          const shiftResponse = await shiftService.getAllShifts();

          setShifts(shiftResponse.data);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset form when academicClass changes
  useEffect(() => {
    if (academicClass) {
      reset({
        name: academicClass.name,
        groupNumber: academicClass.groupNumber,
        capacity: academicClass.capacity,
        isRegistrable: academicClass.isRegistrable,
        minEnrollmentRequired: academicClass.minEnrollmentRequired,
      });
    }
  }, [academicClass, reset]);

  const handleFormSubmit = async (data: ClassUpdateFormData) => {
    // Only include fields that have values (not undefined)
    const updateData: Partial<AcademicClass> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.groupNumber !== undefined)
      updateData.groupNumber = data.groupNumber;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.isRegistrable !== undefined)
      updateData.isRegistrable = data.isRegistrable;
    if (data.minEnrollmentRequired !== undefined)
      updateData.minEnrollmentRequired = data.minEnrollmentRequired;

    await onSubmit(updateData);
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Class: {academicClass?.name}
            </ModalHeader>

            <ModalBody>
              <form
                className="space-y-4"
                id="class-update-form"
                onSubmit={handleSubmit(handleFormSubmit)}
              >
                {/* Name */}
                <div className="form-group">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        className="w-full"
                        errorMessage={errors.name?.message}
                        id="name"
                        isInvalid={!!errors.name}
                        placeholder="Enter class name"
                        {...field}
                      />
                    )}
                  />
                </div>

                {/* Group Number */}
                <div className="form-group">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="groupNumber"
                  >
                    Group Number
                  </label>
                  <Controller
                    control={control}
                    name="groupNumber"
                    render={({ field }) => (
                      <Input
                        className="w-full"
                        errorMessage={errors.groupNumber?.message}
                        id="groupNumber"
                        isInvalid={!!errors.groupNumber}
                        placeholder="Enter group number"
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                </div>

                {/* Capacity */}
                <div className="form-group">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="capacity"
                  >
                    Capacity
                  </label>
                  <Controller
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <Input
                        className="w-full"
                        errorMessage={errors.capacity?.message}
                        id="capacity"
                        isInvalid={!!errors.capacity}
                        placeholder="Enter capacity"
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                </div>

                {/* Min Enrollment Required */}
                <div className="form-group">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="minEnrollmentRequired"
                  >
                    Minimum Enrollment Required
                  </label>
                  <Controller
                    control={control}
                    name="minEnrollmentRequired"
                    render={({ field }) => (
                      <Input
                        className="w-full"
                        errorMessage={errors.minEnrollmentRequired?.message}
                        id="minEnrollmentRequired"
                        isInvalid={!!errors.minEnrollmentRequired}
                        placeholder="Enter minimum enrollment"
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                </div>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting || isLoadingData}
                form="class-update-form"
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update Class"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
