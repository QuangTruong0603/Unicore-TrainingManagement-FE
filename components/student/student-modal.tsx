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
import { Student } from "@/services/student/student.schema";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => void;
  student?: Student;
  isEdit?: boolean;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  isEdit = false,
}) => {
  const [formData, setFormData] = React.useState<Partial<Student>>({
    studentCode: "",
    majorId: "",
    batchId: "",
    applicationUserId: "",
    applicationUser: {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      personId: "",
      dob: "",
      phoneNumber: "",
      status: 1,
    },
  });

  React.useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        studentCode: "",
        majorId: "",
        batchId: "",
        applicationUserId: "",
        applicationUser: {
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          personId: "",
          dob: "",
          phoneNumber: "",
          status: 1,
        },
      });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("applicationUser.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        applicationUser: {
          ...prev.applicationUser!,
          [field]: field === "status" ? parseInt(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEdit ? "Edit Student" : "Add New Student"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Student Code"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                required
              />
              <Input
                label="First Name"
                name="applicationUser.firstName"
                value={formData.applicationUser?.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="applicationUser.lastName"
                value={formData.applicationUser?.lastName}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="applicationUser.email"
                type="email"
                value={formData.applicationUser?.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="applicationUser.phoneNumber"
                value={formData.applicationUser?.phoneNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="Date of Birth"
                name="applicationUser.dob"
                type="date"
                value={formData.applicationUser?.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="Major ID"
                name="majorId"
                value={formData.majorId}
                onChange={handleChange}
                required
              />
              <Input
                label="Batch ID"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                required
              />
              <Select
                label="Status"
                name="applicationUser.status"
                value={formData.applicationUser?.status?.toString()}
                onChange={handleChange}
                required
              >
                <SelectItem key="1">Active</SelectItem>
                <SelectItem key="0">Inactive</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 