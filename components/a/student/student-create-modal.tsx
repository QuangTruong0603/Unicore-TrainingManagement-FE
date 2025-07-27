import React from "react";
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
} from "@heroui/react";

import { CreateStudentDto } from "@/services/student/student.dto";
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";

interface StudentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentDto) => void;
  majors: Major[];
  batches: Batch[];
}

export const StudentCreateModal: React.FC<StudentCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  majors,
  batches,
}) => {
  const [formData, setFormData] = React.useState<CreateStudentDto>({
    firstName: "",
    lastName: "",
    dob: "",
    personId: "",
    phoneNumber: "",
    privateEmail: "",
    batchId: "",
    majorId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      firstName: "",
      lastName: "",
      dob: "",
      personId: "",
      phoneNumber: "",
      privateEmail: "",
      batchId: "",
      majorId: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create New Student</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
              />
              <Input
                required
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
              <Input
                required
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
              <Input
                required
                label="Person ID"
                name="personId"
                value={formData.personId}
                onChange={handleChange}
                placeholder="Enter person ID"
              />
              <Input
                required
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              <Input
                required
                label="Private Email"
                name="privateEmail"
                type="email"
                value={formData.privateEmail}
                onChange={handleChange}
                placeholder="Enter private email"
              />
              <Select
                required
                label="Major"
                name="majorId"
                value={formData.majorId}
                onChange={handleChange}
                placeholder="Select major"
              >
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                required
                label="Batch"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                placeholder="Select batch"
              >
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.title}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Create Student
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 