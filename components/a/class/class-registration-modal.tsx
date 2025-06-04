import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { now, CalendarDateTime } from "@internationalized/date";

import { ClassRegistrationScheduleDto } from "@/services/class/class.dto";

interface ClassRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: ClassRegistrationScheduleDto) => void;
  isSubmitting: boolean;
  selectedClasses: string[];
}

export const ClassRegistrationModal: React.FC<ClassRegistrationModalProps> = ({
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
  selectedClasses,
}) => {
  // Define Vietnam timezone (UTC+7)
  const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    registrationOpenTime: CalendarDateTime;
    registrationCloseTime: CalendarDateTime;
  }>({
    defaultValues: {
      registrationOpenTime: now(VIETNAM_TIMEZONE).add({ hours: 1 }),
      registrationCloseTime: now(VIETNAM_TIMEZONE).add({ days: 7 }),
    },
  });

  const registrationOpenTime = watch("registrationOpenTime");

  const onFormSubmit = (data: {
    registrationOpenTime: CalendarDateTime;
    registrationCloseTime: CalendarDateTime;
  }) => {
    // Ensure dates are valid
    if (!data.registrationOpenTime || !data.registrationCloseTime) {
      return;
    }
    // Convert CalendarDateTime to Date objects for the API with explicit timezone handling
    // Create dates in Vietnam timezone
    const openTime = data.registrationOpenTime.toDate(VIETNAM_TIMEZONE);
    const closeTime = data.registrationCloseTime.toDate(VIETNAM_TIMEZONE);

    // Create explicit date strings that preserve the Vietnam time (UTC+7)
    const vtOpenTime = new Date(
      `${openTime.getFullYear()}-${String(openTime.getMonth() + 1).padStart(2, "0")}-${String(openTime.getDate()).padStart(2, "0")}T${String(openTime.getHours()).padStart(2, "0")}:${String(openTime.getMinutes()).padStart(2, "0")}:00+07:00`
    );
    const vtCloseTime = new Date(
      `${closeTime.getFullYear()}-${String(closeTime.getMonth() + 1).padStart(2, "0")}-${String(closeTime.getDate()).padStart(2, "0")}T${String(closeTime.getHours()).padStart(2, "0")}:${String(closeTime.getMinutes()).padStart(2, "0")}:00+07:00`
    );

    // Ensure close time is after open time
    if (vtCloseTime <= vtOpenTime) {
      return;
    }

    onSubmit({
      academicClassIds: selectedClasses,
      registrationOpenTime: vtOpenTime,
      registrationCloseTime: vtCloseTime,
    });
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="top-center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            Set Registration Schedule
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-500 mb-4">
              {selectedClasses.length} class(es) selected. Set registration open
              and close times for these classes.
            </p>

            <div className="space-y-4">
              {" "}
              <div>
                <Controller
                  control={control}
                  name="registrationOpenTime"
                  render={({ field }) => (
                    <DatePicker
                      hideTimeZone
                      showMonthAndYearPickers
                      className="w-full"
                      granularity="minute"
                      label="Registration Open Time (Vietnam Time)"
                      minValue={now(VIETNAM_TIMEZONE)}
                      value={field.value}
                      variant="bordered"
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: "Registration open time is required",
                    validate: (value) => {
                      if (!value || value.compare(now(VIETNAM_TIMEZONE)) < 0) {
                        return "Registration open time cannot be in the past";
                      }

                      return true;
                    },
                  }}
                />
                {errors.registrationOpenTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationOpenTime.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  control={control}
                  name="registrationCloseTime"
                  render={({ field }) => (
                    <DatePicker
                      hideTimeZone
                      showMonthAndYearPickers
                      className="w-full"
                      granularity="minute"
                      label="Registration Close Time (Vietnam Time)"
                      minValue={registrationOpenTime || now(VIETNAM_TIMEZONE)}
                      value={field.value}
                      variant="bordered"
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: "Registration close time is required",
                    validate: (value) => {
                      if (!value || !registrationOpenTime) {
                        return "Registration close time is required";
                      }
                      if (value.compare(registrationOpenTime) <= 0) {
                        return "Registration close time must be after open time";
                      }

                      return true;
                    },
                  }}
                />
                {errors.registrationCloseTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationCloseTime.message}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isSubmitting || selectedClasses.length === 0}
              isLoading={isSubmitting}
              type="submit"
            >
              Set Schedule
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
