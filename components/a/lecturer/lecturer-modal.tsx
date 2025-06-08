/* eslint-disable react/jsx-sort-props */
import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
} from "@heroui/react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { Department } from "@/services/department/department.schema";

interface LecturerModalProps {
  isOpen: boolean;
  isEdit: boolean;
  lecturer?: Lecturer;
  departments: Department[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

// Updated schema to match API requirements
const lecturerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personEmail: z.string().email("Invalid email format"),
  personId: z.string().min(1, "Person ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  degree: z.string().min(1, "Degree is required"),
  salary: z.number().min(0, "Salary must be a positive number"),
  departmentId: z.string().min(1, "Department is required"),
  mainMajor: z.string().min(1, "Main major is required"),
  lecturerCode: z.string().optional(),
  workingStatus: z.number().min(0).max(1),
  joinDate: z.string().min(1, "Join date is required"),
});

type LecturerFormValues = z.infer<typeof lecturerFormSchema>;

export function LecturerModal({
  isOpen,
  isEdit,
  lecturer,
  departments,
  onClose,
  onSubmit,
}: LecturerModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, touchedFields },
    trigger,
  } = useForm<LecturerFormValues>({
    resolver: zodResolver(lecturerFormSchema),
    mode: "onChange",
    defaultValues: {
      lecturerCode: lecturer?.lecturerCode || "",
      degree: lecturer?.degree || "",
      salary: lecturer?.salary || 0,
      departmentId: lecturer?.departmentId || "",
      workingStatus: lecturer?.workingStatus || 1,
      joinDate: lecturer?.joinDate
        ? new Date(lecturer.joinDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      mainMajor: lecturer?.mainMajor || "",
      firstName: lecturer?.applicationUser?.firstName || "",
      lastName: lecturer?.applicationUser?.lastName || "",
      personId: lecturer?.applicationUser?.personId || "",
      dob: lecturer?.applicationUser?.dob || "",
      phoneNumber: lecturer?.applicationUser?.phoneNumber || "",
      personEmail: lecturer?.applicationUser?.email || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const defaultValues = {
        lecturerCode: lecturer?.lecturerCode || "",
        degree: lecturer?.degree || "",
        salary: lecturer?.salary || 0,
        departmentId: lecturer?.departmentId || "",
        workingStatus: lecturer?.workingStatus || 1,
        joinDate: lecturer?.joinDate
          ? new Date(lecturer.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        mainMajor: lecturer?.mainMajor || "",
        firstName: lecturer?.applicationUser?.firstName || "",
        lastName: lecturer?.applicationUser?.lastName || "",
        personId: lecturer?.applicationUser?.personId || "",
        dob: lecturer?.applicationUser?.dob || "",
        phoneNumber: lecturer?.applicationUser?.phoneNumber || "",
        personEmail: lecturer?.applicationUser?.email || "",
      };

      reset(defaultValues);

      // Validate form after reset to clear any errors
      setTimeout(() => {
        trigger();
      }, 100);
    }
  }, [isOpen, lecturer, reset, trigger]);

  const onFormSubmit = async (data: LecturerFormValues) => {
    try {
      // Format data according to API requirements
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        personEmail: data.personEmail,
        personId: data.personId,
        phoneNumber: data.phoneNumber,
        dob: data.dob,
        degree: data.degree,
        salary: data.salary,
        departmentId: data.departmentId,
        mainMajor: data.mainMajor,
      };

      // Add optional fields for edit mode
      if (isEdit) {
        Object.assign(payload, {
          lecturerCode: data.lecturerCode,
          workingStatus: data.workingStatus,
          joinDate: data.joinDate,
        });
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Helper function to determine if a field should show error
  const shouldShowError = (fieldName: keyof LecturerFormValues) => {
    return !!errors[fieldName] && touchedFields[fieldName];
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalHeader>
            {isEdit ? "Edit Lecturer" : "Add New Lecturer"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="firstName"
                >
                  First Name *
                </label>
                <Input
                  errorMessage={errors.firstName?.message}
                  id="firstName"
                  isInvalid={shouldShowError("firstName")}
                  {...register("firstName")}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="lastName"
                >
                  Last Name *
                </label>
                <Input
                  errorMessage={errors.lastName?.message}
                  id="lastName"
                  isInvalid={shouldShowError("lastName")}
                  {...register("lastName")}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="personEmail"
                >
                  Email *
                </label>
                <Input
                  errorMessage={errors.personEmail?.message}
                  id="personEmail"
                  isInvalid={shouldShowError("personEmail")}
                  type="email"
                  {...register("personEmail")}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="phoneNumber"
                >
                  Phone Number *
                </label>
                <Input
                  errorMessage={errors.phoneNumber?.message}
                  id="phoneNumber"
                  isInvalid={shouldShowError("phoneNumber")}
                  {...register("phoneNumber")}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="personId"
                >
                  Person ID *
                </label>
                <Input
                  errorMessage={errors.personId?.message}
                  id="personId"
                  isInvalid={shouldShowError("personId")}
                  {...register("personId")}
                />
              </div>

              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth
                </label>
                <Input
                  id="dob"
                  type="date"
                  isInvalid={shouldShowError("dob")}
                  errorMessage={errors.dob?.message}
                  {...register("dob")}
                />
              </div>

              {isEdit && (
                <div>
                  <label
                    htmlFor="lecturerCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lecturer Code
                  </label>
                  <Input
                    id="lecturerCode"
                    isInvalid={shouldShowError("lecturerCode")}
                    errorMessage={errors.lecturerCode?.message}
                    {...register("lecturerCode")}
                    isDisabled={isEdit}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="degree"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Degree
                </label>
                <Input
                  id="degree"
                  isInvalid={shouldShowError("degree")}
                  errorMessage={errors.degree?.message}
                  {...register("degree")}
                />
              </div>

              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Salary
                </label>
                <Input
                  id="salary"
                  type="number"
                  isInvalid={shouldShowError("salary")}
                  errorMessage={errors.salary?.message}
                  {...register("salary", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label
                  htmlFor="mainMajor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Main Major
                </label>
                <Input
                  id="mainMajor"
                  isInvalid={shouldShowError("mainMajor")}
                  errorMessage={errors.mainMajor?.message}
                  {...register("mainMajor")}
                />
              </div>

              <div>
                <label
                  htmlFor="departmentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department *
                </label>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Autocomplete
                      id="departmentId"
                      allowsCustomValue={false}
                      defaultItems={departments}
                      selectedKey={field.value}
                      onSelectionChange={(key) =>
                        field.onChange(key?.toString() || "")
                      }
                    >
                      {(department) => (
                        <AutocompleteItem
                          key={department.id}
                          textValue={department.name || ""}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {department.name || "No name"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {department.code}
                            </span>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                />
                {errors.departmentId && touchedFields.departmentId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              {isEdit && (
                <>
                  <div>
                    <label
                      htmlFor="joinDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Join Date
                    </label>
                    <Input
                      errorMessage={errors.joinDate?.message}
                      id="joinDate"
                      isInvalid={shouldShowError("joinDate")}
                      type="date"
                      {...register("joinDate")}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="workingStatus"
                    >
                      Working Status
                    </label>
                    <Controller
                      control={control}
                      name="workingStatus"
                      render={({ field }) => (
                        <Select
                          id="workingStatus"
                          selectedKeys={[field.value.toString()]}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        >
                          <SelectItem key="1">Active</SelectItem>
                          <SelectItem key="0">Inactive</SelectItem>
                        </Select>
                      )}
                    />
                    {errors.workingStatus && touchedFields.workingStatus && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.workingStatus.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" isLoading={isSubmitting} type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
