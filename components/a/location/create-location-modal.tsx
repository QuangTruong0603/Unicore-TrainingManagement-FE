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

import { CreateLocationData } from "@/services/location/location.dto";

interface CreateLocationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: CreateLocationData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateLocationModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateLocationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLocationData>({
    defaultValues: {
      name: "",
      country: "",
      city: "",
      district: "",
      ward: "",
      addressDetail: "",
      imageURL: "",
    },
  });

  const handleFormSubmit = async (data: CreateLocationData) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(); // Close the modal after successful submission
    } catch {
      // Keep modal open if there's an error
    }
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add New Location
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

                  <div className="space-y-2">
                    <label
                      className="text-small font-medium text-default-700"
                      htmlFor="imageURL"
                    >
                      Image URL (optional)
                    </label>
                    <Input
                      id="imageURL"
                      placeholder="Enter image URL"
                      type="text"
                      {...register("imageURL")}
                      errorMessage={errors.imageURL?.message}
                      isInvalid={!!errors.imageURL}
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
                  {isSubmitting ? "Creating..." : "Create Location"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
