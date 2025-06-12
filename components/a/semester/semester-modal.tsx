import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

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
    control,
  } = useForm<CreateSemesterData | UpdateSemesterData>({
    defaultValues:
      mode === "create"
        ? {
            semesterNumber: 1,
            year: new Date().getFullYear(),
            startDate: new Date(),
            endDate: new Date(),
            numberOfWeeks: 15,
          }
        : {
            semesterNumber: semester?.semesterNumber || 1,
            year: semester?.year || new Date().getFullYear(),
            isActive: semester?.isActive || false,
            startDate: semester?.startDate || new Date(),
            endDate: semester?.endDate || new Date(),
            numberOfWeeks: semester?.numberOfWeeks || 15,
          },
  });

  const isActive = watch("isActive");
  const startDate = watch("startDate");
  const numberOfWeeks = watch("numberOfWeeks");

  // Helper function to get next Monday from a given date
  const getNextMonday = (date: Date): Date => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilMonday =
      dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const monday = new Date(date);

    monday.setDate(date.getDate() + daysUntilMonday);

    return monday;
  };

  // Helper function to calculate end Sunday based on start Monday and number of weeks
  const calculateEndSunday = (startMonday: Date, weeks: number): Date => {
    const endSunday = new Date(startMonday);
    // Add (weeks * 7 - 1) days to get the Sunday of the last week

    endSunday.setDate(startMonday.getDate() + (weeks * 7 - 1));

    return endSunday;
  };

  // Auto-calculate endDate when startDate or numberOfWeeks changes
  useEffect(() => {
    if (startDate && numberOfWeeks && numberOfWeeks > 0) {
      const startDateObj = new Date(startDate);
      const mondayStart = getNextMonday(startDateObj);
      const sundayEnd = calculateEndSunday(mondayStart, numberOfWeeks);

      // Don't auto-adjust the startDate display, just calculate endDate based on the Monday
      // Set endDate without validation since it's calculated
      setValue("endDate", sundayEnd, { shouldValidate: false });
    }
  }, [startDate, numberOfWeeks, setValue, getNextMonday, calculateEndSunday]);

  // Reset form when modal opens/closes or semester changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        reset({
          semesterNumber: 1,
          year: new Date().getFullYear(),
          startDate: new Date(),
          endDate: new Date(),
          numberOfWeeks: 15,
        });
      } else if (semester) {
        reset({
          semesterNumber: semester.semesterNumber,
          year: semester.year,
          isActive: semester.isActive,
          startDate: semester.startDate,
          endDate: semester.endDate,
          numberOfWeeks: semester.numberOfWeeks,
        });
      }
    }
  }, [isOpen, mode, semester, reset]);

  // Handle form submission
  const handleFormSubmit = async (
    data: CreateSemesterData | UpdateSemesterData
  ) => {
    try {
      // Ensure we send the Monday start date to the backend
      const adjustedData = {
        ...data,
        startDate: data.startDate
          ? getNextMonday(new Date(data.startDate))
          : data.startDate,
      };

      await onSubmit(adjustedData);
      onOpenChange(); // Close the modal on success
    } catch (error) {
      // Error handling is managed by the parent component
      throw error;
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

              <div>
                <label className="block mb-1" htmlFor="startDate">
                  Start Date* (semester will start on the Monday of this week)
                </label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      errorMessage={errors.startDate?.message}
                      isInvalid={!!errors.startDate}
                      label="Start Date"
                      value={
                        field.value
                          ? parseDate(
                              `${field.value.getFullYear()}-${String(
                                field.value.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                field.value.getDate()
                              ).padStart(2, "0")}`
                            )
                          : null
                      }
                      onChange={(date) => {
                        if (date) {
                          // Create date in local timezone to avoid timezone conversion issues
                          const jsDate = new Date(
                            date.year,
                            date.month - 1,
                            date.day,
                            12,
                            0,
                            0
                          );

                          field.onChange(jsDate);
                        } else {
                          field.onChange(null);
                        }
                      }}
                    />
                  )}
                  rules={{
                    required: "Start date is required",
                  }}
                />
              </div>

              <div>
                <label className="block mb-1" htmlFor="numberOfWeeks">
                  Number of Weeks*
                </label>
                <Input
                  errorMessage={errors.numberOfWeeks?.message}
                  id="numberOfWeeks"
                  isInvalid={!!errors.numberOfWeeks}
                  label="Number of Weeks"
                  min={1}
                  placeholder="Enter number of weeks"
                  type="number"
                  {...register("numberOfWeeks", {
                    required: "Number of weeks is required",
                    min: {
                      value: 1,
                      message: "Number of weeks must be at least 1",
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
