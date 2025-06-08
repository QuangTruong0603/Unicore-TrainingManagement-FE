import React from "react";
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
  onSubmit: (data: Partial<Lecturer>) => Promise<void>;
}

const lecturerFormSchema = z.object({
  lecturerCode: z.string().min(1, "Lecturer code is required"),
  degree: z.string().min(1, "Degree is required"),
  salary: z.number().min(0, "Salary must be a positive number"),
  departmentId: z.string().min(1, "Department is required"),
  workingStatus: z.number().min(0).max(1),
  joinDate: z.string().min(1, "Join date is required"),
  mainMajor: z.string().min(1, "Main major is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personId: z.string().min(1, "Person ID is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email format"),
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
    formState: { errors, isSubmitting },
  } = useForm<LecturerFormValues>({
    resolver: zodResolver(lecturerFormSchema),
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
      email: lecturer?.applicationUser?.email || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
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
        email: lecturer?.applicationUser?.email || "",
      });
    }
  }, [isOpen, lecturer, reset]);

  const onFormSubmit = async (data: LecturerFormValues) => {
    try {
      const payload = {
        ...data,
        applicationUser: {
          firstName: data.firstName,
          lastName: data.lastName,
          personId: data.personId,
          dob: data.dob,
          phoneNumber: data.phoneNumber,
          email: data.email,
          status: 1,
        },
      };

      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalHeader>
            {isEdit ? "Edit Lecturer" : "Add New Lecturer"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName?.message}
                  {...register("firstName")}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  isInvalid={!!errors.lastName}
                  errorMessage={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  isInvalid={!!errors.phoneNumber}
                  errorMessage={errors.phoneNumber?.message}
                  {...register("phoneNumber")}
                />
              </div>

              <div>
                <label htmlFor="personId" className="block text-sm font-medium text-gray-700 mb-1">
                  Person ID
                </label>
                <Input
                  id="personId"
                  isInvalid={!!errors.personId}
                  errorMessage={errors.personId?.message}
                  {...register("personId")}
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  id="dob"
                  type="date"
                  isInvalid={!!errors.dob}
                  errorMessage={errors.dob?.message}
                  {...register("dob")}
                />
              </div>

              <div>
                <label htmlFor="lecturerCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Lecturer Code
                </label>
                <Input
                  id="lecturerCode"
                  isInvalid={!!errors.lecturerCode}
                  errorMessage={errors.lecturerCode?.message}
                  {...register("lecturerCode")}
                  isDisabled={isEdit}
                />
              </div>

              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                  Degree
                </label>
                <Input
                  id="degree"
                  isInvalid={!!errors.degree}
                  errorMessage={errors.degree?.message}
                  {...register("degree")}
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <Input
                  id="salary"
                  type="number"
                  isInvalid={!!errors.salary}
                  errorMessage={errors.salary?.message}
                  {...register("salary", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label htmlFor="mainMajor" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Major
                </label>
                <Input
                  id="mainMajor"
                  isInvalid={!!errors.mainMajor}
                  errorMessage={errors.mainMajor?.message}
                  {...register("mainMajor")}
                />
              </div>

              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <Input
                  id="joinDate"
                  type="date"
                  isInvalid={!!errors.joinDate}
                  errorMessage={errors.joinDate?.message}
                  {...register("joinDate")}
                />
              </div>

              <div>
                <label htmlFor="workingStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Working Status
                </label>
                <Controller
                  control={control}
                  name="workingStatus"
                  render={({ field }) => (
                    <Select
                      id="workingStatus"
                      selectedKeys={[field.value.toString()]}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    >
                      <SelectItem key="1" value="1">
                        Active
                      </SelectItem>
                      <SelectItem key="0" value="0">
                        Inactive
                      </SelectItem>
                    </Select>
                  )}
                />
                {errors.workingStatus && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.workingStatus.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
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
                      onSelectionChange={(key) => field.onChange(key?.toString() || "")}
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
                {errors.departmentId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isSubmitting}
              type="submit"
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 