import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteItem,
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

import { ExamCreateDto, ExamUpdateDto } from "@/services/exam/exam.dto";
import { Exam } from "@/services/exam/exam.schema";
import { classService } from "@/services/class/class.service";
import { roomService } from "@/services/room/room.service";
import { semesterService } from "@/services/semester/semester.service";
import { AcademicClass } from "@/services/class/class.schema";
import { Room } from "@/services/room/room.schema";
import { Semester } from "@/services/semester/semester.schema";

interface ExamModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: any) => Promise<void>;
  exam?: Exam | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

const examTypes = [
  { key: "1", label: "Midterm" },
  { key: "2", label: "Final" },
  { key: "3", label: "Quiz" },
  { key: "4", label: "Lab" },
  { key: "5", label: "Practical" },
];

export function ExamModal({
  isOpen,
  onOpenChange,
  onSubmit,
  exam,
  isSubmitting,
  mode,
}: ExamModalProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExamCreateDto | ExamUpdateDto>({
    defaultValues:
      mode === "create"
        ? {
            group: 1,
            type: 1,
            examTime: new Date(),
            duration: 120,
            academicClassId: "",
            roomId: "",
            semesterId: "",
          }
        : {
            group: exam?.group || 1,
            type: exam?.type || 1,
            examTime: exam?.examTime ? new Date(exam.examTime) : new Date(),
            duration: exam?.duration || 120,
            academicClassId: exam?.academicClassId || "",
            roomId: exam?.roomId || "",
            semesterId: "",
          },
  });

  // Reset form when exam changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        reset({
          group: 1,
          type: 1,
          examTime: new Date(),
          duration: 120,
          academicClassId: "",
          roomId: "",
          semesterId: "",
        });
      } else if (exam) {
        reset({
          group: exam.group,
          type: exam.type,
          examTime: new Date(exam.examTime),
          duration: exam.duration,
          academicClassId: exam.academicClassId,
          roomId: exam.roomId,
          semesterId: "",
        });
      }
    }
  }, [isOpen, exam, mode, reset]); // Fetch data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        try {
          // Load semesters first
          setIsLoadingSemesters(true);
          const semesterResponse = await semesterService.getSemesters({
            pageNumber: 1,
            itemsPerpage: 100,
            isDesc: false,
            filters: { isActive: true },
          });

          setSemesters(semesterResponse.data.data);

          // Load rooms
          setIsLoadingRooms(true);
          const roomResponse = await roomService.getRooms({
            pageNumber: 1,
            itemsPerpage: 100,
            isDesc: false,
            orderBy: "name",
          });

          setRooms(roomResponse.data.data);
        } catch {
          // Error fetching data
        } finally {
          setIsLoadingSemesters(false);
          setIsLoadingRooms(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch classes when semester is selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedSemesterId) {
        try {
          setIsLoadingClasses(true);
          const classResponse = await classService.getClasses({
            pageNumber: 1,
            itemsPerpage: 100,
            isDesc: false,
            orderBy: "name",
            filters: { semesterId: selectedSemesterId },
          });

          setAcademicClasses(classResponse.data.data);
        } catch {
          // Error fetching classes
        } finally {
          setIsLoadingClasses(false);
        }
      } else {
        setAcademicClasses([]);
      }
    };

    fetchClasses();
  }, [selectedSemesterId]);

  const onFormSubmit = async (data: ExamCreateDto | ExamUpdateDto) => {
    try {
      await onSubmit(data);
      onOpenChange();
    } catch {
      // Error handling is done in parent component
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {mode === "create" ? "Create New Exam" : "Update Exam"}
            </ModalHeader>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              {" "}
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Semester Selection */}
                  <Controller
                    control={control}
                    name="semesterId"
                    render={({ field }) => (
                      <Select
                        errorMessage="Please select a semester"
                        isInvalid={
                          !selectedSemesterId && academicClasses.length === 0
                        }
                        isLoading={isLoadingSemesters}
                        label="Semester"
                        placeholder="Select semester"
                        selectedKeys={
                          selectedSemesterId ? [selectedSemesterId] : []
                        }
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;

                          setSelectedSemesterId(selectedKey);
                          field.onChange(selectedKey);
                        }}
                      >
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id}>
                            {`Semester ${semester.semesterNumber} - ${semester.year}`}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  {/* Exam Type and Group */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <Select
                            errorMessage={errors.type?.message}
                            isInvalid={!!errors.type}
                            label="Exam Type"
                            placeholder="Select exam type"
                            selectedKeys={[String(field.value)]}
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string;

                              field.onChange(parseInt(selectedKey));
                            }}
                          >
                            {examTypes.map((type) => (
                              <SelectItem key={type.key}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                        rules={{ required: "Exam type is required" }}
                      />
                    </div>{" "}
                    <div className="flex-1">
                      <Input
                        label="Group"
                        placeholder="Enter group number"
                        type="number"
                        {...register("group", {
                          required: "Group is required",
                          min: {
                            value: 1,
                            message: "Group must be at least 1",
                          },
                          valueAsNumber: true,
                        })}
                        errorMessage={errors.group?.message}
                        isInvalid={!!errors.group}
                      />
                    </div>
                  </div>

                  {/* Exam Time */}
                  <Controller
                    control={control}
                    name="examTime"
                    render={({ field }) => (
                      <Input
                        errorMessage={errors.examTime?.message}
                        isInvalid={!!errors.examTime}
                        label="Exam Date & Time"
                        type="datetime-local"
                        value={
                          field.value instanceof Date
                            ? formatDateTimeLocal(field.value)
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = new Date(e.target.value);

                          field.onChange(dateValue);
                        }}
                      />
                    )}
                    rules={{ required: "Exam time is required" }}
                  />

                  {/* Duration */}
                  <Input
                    label="Duration (minutes)"
                    placeholder="Enter duration in minutes"
                    type="number"
                    {...register("duration", {
                      required: "Duration is required",
                      min: {
                        value: 1,
                        message: "Duration must be at least 1 minute",
                      },
                      valueAsNumber: true,
                    })}
                    errorMessage={errors.duration?.message}
                    isInvalid={!!errors.duration}
                  />

                  {/* Academic Class */}
                  <Controller
                    control={control}
                    name="academicClassId"
                    render={({ field }) => (
                      <Autocomplete
                        errorMessage={errors.academicClassId?.message}
                        isInvalid={!!errors.academicClassId}
                        isLoading={isLoadingClasses}
                        label="Academic Class"
                        placeholder="Search and select academic class"
                        selectedKey={field.value}
                        onSelectionChange={(key) => field.onChange(key)}
                      >
                        {academicClasses.map((cls) => (
                          <AutocompleteItem key={cls.id}>
                            {`${cls.name} (Group ${cls.groupNumber})`}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    )}
                    rules={{ required: "Academic class is required" }}
                  />

                  {/* Room */}
                  <Controller
                    control={control}
                    name="roomId"
                    render={({ field }) => (
                      <Autocomplete
                        errorMessage={errors.roomId?.message}
                        isInvalid={!!errors.roomId}
                        isLoading={isLoadingRooms}
                        label="Room"
                        placeholder="Search and select room"
                        selectedKey={field.value}
                        onSelectionChange={(key) => field.onChange(key)}
                      >
                        {rooms.map((room) => (
                          <AutocompleteItem key={room.id}>
                            {`${room.name} (${room.availableSeats} seats)`}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    )}
                    rules={{ required: "Room is required" }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>{" "}
                <Button
                  color="primary"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {mode === "create" ? "Create Exam" : "Update Exam"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
