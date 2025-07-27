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
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

import { Exam } from "@/services/exam/exam.schema";
import { Room } from "@/services/room/room.schema";
import { roomService } from "@/services/room/room.service";

interface ExamUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  exam: Exam | null;
  onSubmit: (data: Partial<Exam>) => Promise<void>;
  isSubmitting: boolean;
}

interface ExamUpdateFormData {
  examTime?: string;
  type?: number;
  group?: number;
  duration?: number;
  roomId?: string;
}

const examTypes = [
  { key: 1, label: "Midterm" },
  { key: 2, label: "Final" },
  { key: 3, label: "Quiz" },
  { key: 4, label: "Lab" },
  { key: 5, label: "Practical" },
];

export const ExamUpdateModal: React.FC<ExamUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  exam,
  onSubmit,
  isSubmitting,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamUpdateFormData>({
    defaultValues: {
      examTime: exam?.examTime ? new Date(exam.examTime).toISOString().slice(0, 16) : "",
      type: exam?.type || 1,
      group: exam?.group || 1,
      duration: exam?.duration || 120,
      roomId: exam?.roomId || "",
    },
  });

  // Fetch necessary data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setIsLoadingData(true);
        try {
          // Fetch rooms
          const roomResponse = await roomService.getRooms({
            pageNumber: 1,
            itemsPerpage: 100,
            orderBy: "name",
            isDesc: false,
          });
          setRooms(roomResponse.data.data);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset form when exam changes
  useEffect(() => {
    if (exam) {
      reset({
        examTime: exam.examTime ? new Date(exam.examTime).toISOString().slice(0, 16) : "",
        type: exam.type,
        group: exam.group,
        duration: exam.duration,
        roomId: exam.roomId,
      });
    }
  }, [exam, reset]);



  const handleFormSubmit = async (data: ExamUpdateFormData) => {
    // Only include fields that have values (not undefined)
    const updateData: Partial<Exam> = {};
    
    if (data.examTime !== undefined) updateData.examTime = new Date(data.examTime);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.group !== undefined) updateData.group = data.group;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.roomId !== undefined) updateData.roomId = data.roomId;

    await onSubmit(updateData);
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Exam: {exam?.academicClass?.name} - {examTypes.find(t => t.key === exam?.type)?.label}
            </ModalHeader>

            <ModalBody>
              <form id="exam-update-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* Exam Time */}
                <div className="form-group">
                  <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Date & Time
                  </label>
                  <Controller
                    control={control}
                    name="examTime"
                    render={({ field }) => (
                      <Input
                        id="examTime"
                        className="w-full"
                        errorMessage={errors.examTime?.message}
                        isInvalid={!!errors.examTime}
                        placeholder="Select exam date and time"
                        type="datetime-local"
                        {...field}
                      />
                    )}
                  />
                </div>

                {/* Type */}
                <div className="form-group">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type
                  </label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        id="type"
                        className="w-full"
                        errorMessage={errors.type?.message}
                        isInvalid={!!errors.type}
                        placeholder="Select exam type"
                        selectedKeys={field.value ? [field.value.toString()] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          field.onChange(parseInt(selectedKey));
                        }}
                      >
                        {examTypes.map((type) => (
                          <SelectItem key={type.key.toString()} textValue={type.label}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                {/* Group */}
                <div className="form-group">
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  <Controller
                    control={control}
                    name="group"
                    render={({ field }) => (
                      <Input
                        id="group"
                        className="w-full"
                        errorMessage={errors.group?.message}
                        isInvalid={!!errors.group}
                        placeholder="Enter group number"
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    )}
                  />
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => (
                      <Input
                        id="duration"
                        className="w-full"
                        errorMessage={errors.duration?.message}
                        isInvalid={!!errors.duration}
                        placeholder="Enter duration in minutes"
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 120)}
                      />
                    )}
                  />
                </div>



                {/* Room */}
                <div className="form-group">
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <Controller
                    control={control}
                    name="roomId"
                    render={({ field }) => (
                      <Select
                        id="roomId"
                        className="w-full"
                        errorMessage={errors.roomId?.message}
                        isInvalid={!!errors.roomId}
                        placeholder="Select a room"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          field.onChange(selectedKey);
                        }}
                      >
                        {rooms.map((room) => (
                          <SelectItem key={room.id} textValue={`${room.name} (${room.availableSeats} seats)`}>
                            {room.name} ({room.availableSeats} seats)
                          </SelectItem>
                        ))}
                      </Select>
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
                form="exam-update-form"
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update Exam"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}; 