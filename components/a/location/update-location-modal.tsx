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
  Textarea,
} from "@heroui/react";

import { Location } from "@/services/location/location.schema";
import { UpdateLocationData } from "@/services/location/location.dto";

interface UpdateLocationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: UpdateLocationData) => Promise<void>;
  location: Location;
  isSubmitting: boolean;
}

export function UpdateLocationModal({
  isOpen,
  onOpenChange,
  onSubmit,
  location,
  isSubmitting,
}: UpdateLocationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateLocationData>({
    defaultValues: {
      name: location?.name || "",
      country: location?.country || "",
      city: location?.city || "",
      district: location?.district || "",
      ward: location?.ward || "",
      addressDetail: location?.addressDetail || "",
      imageURL: location?.imageURL || "",
    },
  });

  // Reset form when location changes
  React.useEffect(() => {
    if (location) {
      reset({
        name: location.name || "",
        country: location.country || "",
        city: location.city || "",
        district: location.district || "",
        ward: location.ward || "",
        addressDetail: location.addressDetail || "",
        imageURL: location.imageURL || "",
      });
    }
  }, [location, reset]);

  // Handle changes in modal open state
  React.useEffect(() => {
    // When modal closes, reset form to avoid stale data
    if (!isOpen) {
      // Add a small delay to make the reset happen after the modal animation completes
      const timer = setTimeout(() => {
        reset();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);
  const handleFormSubmit = async (data: UpdateLocationData) => {
    try {
      await onSubmit(data);
      onOpenChange(); // Close the modal after successful submission
    } catch {
      // Keep modal open if there's an error
    }
  };

  // Custom wrapper to handle the modal close event
  const handleModalClose = () => {
    onOpenChange();
    // Form will be reset by the useEffect hook monitoring isOpen
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={handleModalClose}>
      <ModalContent>
        {(_onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Location
            </ModalHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter location name"
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      errorMessage={errors.name?.message}
                      isInvalid={!!errors.name}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="country"
                    >
                      Country
                    </label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      type="text"
                      {...register("country", {
                        required: "Country is required",
                      })}
                      errorMessage={errors.country?.message}
                      isInvalid={!!errors.country}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="city"
                    >
                      City
                    </label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      type="text"
                      {...register("city", { required: "City is required" })}
                      errorMessage={errors.city?.message}
                      isInvalid={!!errors.city}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="district"
                    >
                      District
                    </label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      type="text"
                      {...register("district", {
                        required: "District is required",
                      })}
                      errorMessage={errors.district?.message}
                      isInvalid={!!errors.district}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="ward"
                    >
                      Ward
                    </label>
                    <Input
                      id="ward"
                      placeholder="Enter ward"
                      type="text"
                      {...register("ward", { required: "Ward is required" })}
                      errorMessage={errors.ward?.message}
                      isInvalid={!!errors.ward}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="addressDetail"
                    >
                      Address Details
                    </label>
                    <Textarea
                      id="addressDetail"
                      placeholder="Enter detailed address"
                      {...register("addressDetail", {
                        required: "Address detail is required",
                      })}
                      errorMessage={errors.addressDetail?.message}
                      isInvalid={!!errors.addressDetail}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  disabled={isSubmitting}
                  variant="flat"
                  onPress={handleModalClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Updating..." : "Update Location"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
