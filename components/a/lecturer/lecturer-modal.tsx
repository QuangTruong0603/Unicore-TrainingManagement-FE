/* eslint-disable react/jsx-sort-props */
import React, { useEffect, useState } from "react";
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

import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { Department } from "@/services/department/department.schema";

interface LecturerModalProps {
  isOpen: boolean;
  isEdit: boolean;
  lecturer?: Lecturer | any;
  departments: Department[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

// Form data interface
interface LecturerFormData {
  lecturerCode: string;
  degree: string;
  salary: string | number;
  departmentId: string;
  workingStatus: string | number;
  joinDate: string;
  mainMajor: string;
  firstName: string;
  lastName: string;
  personId: string;
  dob: string;
  phoneNumber: string;
  personEmail: string;
}

export function LecturerModal({
  isOpen,
  isEdit,
  lecturer,
  departments,
  onClose,
  onSubmit,
}: LecturerModalProps) {
  const [formData, setFormData] = useState<LecturerFormData>({
    lecturerCode: "",
    degree: "",
    salary: 0,
    departmentId: "",
    workingStatus: 1,
    joinDate: new Date().toISOString().split("T")[0],
    mainMajor: "",
    firstName: "",
    lastName: "",
    personId: "",
    dob: "",
    phoneNumber: "",
    personEmail: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LecturerFormData>>({});

  // Reset form when modal opens/closes or lecturer changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && lecturer) {
        // Edit mode - fill with lecturer data
        const defaultValues = {
          lecturerCode: lecturer.lecturerCode || "",
          degree: lecturer.degree || "",
          salary: lecturer.salary !== undefined ? lecturer.salary : 0,
          departmentId: lecturer.departmentId || "",
          workingStatus:
            lecturer.workingStatus !== undefined ? lecturer.workingStatus : 1,
          joinDate: lecturer.joinDate
            ? new Date(lecturer.joinDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          mainMajor: lecturer.mainMajor || "",
          firstName: lecturer.firstName || "",
          lastName: lecturer.lastName || "",
          personId: lecturer.personId || "",
          dob: lecturer.dob || "",
          phoneNumber: lecturer.phoneNumber || "",
          personEmail: lecturer.personEmail || "",
        };

        setFormData(defaultValues);
        setErrors({});
      } else {
        // Add mode - reset to empty values
        const emptyValues = {
          lecturerCode: "",
          degree: "",
          salary: 0,
          departmentId: "",
          workingStatus: 1,
          joinDate: new Date().toISOString().split("T")[0],
          mainMajor: "",
          firstName: "",
          lastName: "",
          personId: "",
          dob: "",
          phoneNumber: "",
          personEmail: "",
        };

        setFormData(emptyValues);
        setErrors({});
      }
    }
  }, [isOpen, isEdit, lecturer]);

  const handleChange = (
    field: keyof LecturerFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "salary" || field === "workingStatus" ? Number(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LecturerFormData> = {};

    // if (!formData.firstName.trim()) {
    //   newErrors.firstName = "First name is required";
    // }

    // if (!formData.lastName.trim()) {
    //   newErrors.lastName = "Last name is required";
    // }

    // if (!formData.personEmail.trim()) {
    //   newErrors.personEmail = "Email is required";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personEmail)) {
    //   newErrors.personEmail = "Invalid email format";
    // }

    // if (!formData.personId.trim()) {
    //   newErrors.personId = "Person ID is required";
    // }

    // if (!formData.departmentId) {
    //   newErrors.departmentId = "Department is required";
    // }

    // if (Number(formData.salary) < 0) {
    //   newErrors.salary = "Salary must be a positive number";
    // }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Form submitted with data:", formData);

      // Format data according to API requirements
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        personEmail: formData.personEmail,
        personId: formData.personId,
      };

      // Add optional fields if they exist
      if (formData.phoneNumber) payload.phoneNumber = formData.phoneNumber;
      if (formData.dob) payload.dob = formData.dob;
      if (formData.degree) payload.degree = formData.degree;
      if (formData.salary !== undefined && formData.salary !== "")
        payload.salary = Number(formData.salary);
      if (formData.departmentId) payload.departmentId = formData.departmentId;
      if (formData.mainMajor) payload.mainMajor = formData.mainMajor;

      // Add optional fields for edit mode
      if (isEdit) {
        if (formData.lecturerCode) payload.lecturerCode = formData.lecturerCode;
        if (
          formData.workingStatus !== undefined &&
          formData.workingStatus !== ""
        )
          payload.workingStatus = Number(formData.workingStatus);
        if (formData.joinDate) payload.joinDate = formData.joinDate;
      }

      console.log("Formatted payload:", payload);
      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={onClose}>
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
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
                  errorMessage={errors.firstName}
                  id="firstName"
                  isInvalid={!!errors.firstName}
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
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
                  errorMessage={errors.lastName}
                  id="lastName"
                  isInvalid={!!errors.lastName}
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>

              {!isEdit && (
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="personEmail"
                  >
                    Email *
                  </label>
                  <Input
                    errorMessage={errors.personEmail}
                    id="personEmail"
                    isInvalid={!!errors.personEmail}
                    type="email"
                    value={formData.personEmail}
                    onChange={(e) =>
                      handleChange("personEmail", e.target.value)
                    }
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="phoneNumber"
                >
                  Phone Number
                </label>
                <Input
                  errorMessage={errors.phoneNumber}
                  id="phoneNumber"
                  isInvalid={!!errors.phoneNumber}
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
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
                  errorMessage={errors.personId}
                  id="personId"
                  isInvalid={!!errors.personId}
                  value={formData.personId}
                  onChange={(e) => handleChange("personId", e.target.value)}
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
                  isInvalid={!!errors.dob}
                  errorMessage={errors.dob}
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="degree"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Degree
                </label>
                <Input
                  id="degree"
                  isInvalid={!!errors.degree}
                  errorMessage={errors.degree}
                  value={formData.degree}
                  onChange={(e) => handleChange("degree", e.target.value)}
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
                  isInvalid={!!errors.salary}
                  errorMessage={errors.salary}
                  value={formData.salary.toString()}
                  onChange={(e) => handleChange("salary", e.target.value)}
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
                  isInvalid={!!errors.mainMajor}
                  errorMessage={errors.mainMajor}
                  value={formData.mainMajor}
                  onChange={(e) => handleChange("mainMajor", e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="departmentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department *
                </label>
                <Autocomplete
                  id="departmentId"
                  allowsCustomValue={false}
                  defaultItems={departments}
                  selectedKey={formData.departmentId}
                  onSelectionChange={(key) =>
                    handleChange("departmentId", key?.toString() || "")
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
                {errors.departmentId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.departmentId}
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
                      errorMessage={errors.joinDate}
                      id="joinDate"
                      isInvalid={!!errors.joinDate}
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleChange("joinDate", e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="workingStatus"
                    >
                      Working Status
                    </label>
                    <Select
                      id="workingStatus"
                      selectedKeys={
                        formData.workingStatus !== undefined
                          ? [formData.workingStatus.toString()]
                          : ["1"]
                      }
                      onChange={(e) =>
                        handleChange("workingStatus", e.target.value)
                      }
                    >
                      <SelectItem key="1">Active</SelectItem>
                      <SelectItem key="0">Inactive</SelectItem>
                    </Select>
                    {errors.workingStatus && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.workingStatus}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCloseModal}>
              Cancel
            </Button>
            <Button color="primary" isLoading={isLoading} type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
