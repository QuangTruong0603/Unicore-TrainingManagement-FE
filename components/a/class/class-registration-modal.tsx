import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    registrationOpenTime: Date;
    registrationCloseTime: Date;
  }>({
    defaultValues: {
      registrationOpenTime: new Date(),
      registrationCloseTime: new Date(
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000
      ), // Default to 1 week later
    },
  });

  const onFormSubmit = (data: {
    registrationOpenTime: Date;
    registrationCloseTime: Date;
  }) => {
    onSubmit({
      academicClassIds: selectedClasses,
      registrationOpenTime: data.registrationOpenTime,
      registrationCloseTime: data.registrationCloseTime,
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
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="registrationOpenTime"
                >
                  Registration Open Time
                </label>
                <Controller
                  control={control}
                  name="registrationOpenTime"
                  render={({ field }) => (
                    <DatePicker
                      showTimeSelect
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      id="registrationOpenTime"
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                    />
                  )}
                  rules={{ required: "This field is required" }}
                />
                {errors.registrationOpenTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationOpenTime.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="registrationCloseTime"
                >
                  Registration Close Time
                </label>
                <Controller
                  control={control}
                  name="registrationCloseTime"
                  render={({ field }) => (
                    <DatePicker
                      showTimeSelect
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      id="registrationCloseTime"
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                    />
                  )}
                  rules={{ required: "This field is required" }}
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
