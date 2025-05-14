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
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";
interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => void;
  student?: Student;
  isEdit?: boolean;
  majors: Major[];
  batches: Batch[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  isEdit = false,
  majors,
  batches,
}) => {
  const [formData, setFormData] = React.useState<Partial<Student>>({
    studentCode: "",
    accumulateCredits: 0,
    accumulateScore: 0,
    accumulateActivityScore: 0,
    majorId: "",
    batchId: "",
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
      setFormData({
        studentCode: student.studentCode,
        accumulateCredits: student.accumulateCredits ?? 0,
        accumulateScore: student.accumulateScore ?? 0,
        accumulateActivityScore: student.accumulateActivityScore ?? 0,
        majorId: student.majorId,
        batchId: student.batchId,
        applicationUser: {
          id: student.applicationUser?.id || "",
          email: student.applicationUser?.email || "",
          firstName: student.applicationUser?.firstName || "",
          lastName: student.applicationUser?.lastName || "",
          personId: student.applicationUser?.personId || "",
          dob: student.applicationUser?.dob || "",
          phoneNumber: student.applicationUser?.phoneNumber || "",
          status: student.applicationUser?.status ?? 1,
        },
      });
    } else {
      setFormData({
        studentCode: "",
        accumulateCredits: 0,
        accumulateScore: 0,
        accumulateActivityScore: 0,
        majorId: "",
        batchId: "",
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
        [name]: [
          "accumulateCredits",
          "accumulateScore",
          "accumulateActivityScore",
        ].includes(name)
          ? Number(value)
          : value,
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEdit ? "Edit Student" : "Add New Student"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                disabled={isEdit}
                label="Student Code"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
              />
              <Input
                required
                label="First Name"
                name="applicationUser.firstName"
                value={formData.applicationUser?.firstName}
                onChange={handleChange}
              />
              <Input
                required
                label="Last Name"
                name="applicationUser.lastName"
                value={formData.applicationUser?.lastName}
                onChange={handleChange}
              />
              <Input
                required
                label="Email"
                name="applicationUser.email"
                type="email"
                value={formData.applicationUser?.email}
                onChange={handleChange}
              />
              <Input
                required
                label="Phone Number"
                name="applicationUser.phoneNumber"
                value={formData.applicationUser?.phoneNumber}
                onChange={handleChange}
              />
              <Input
                required
                label="Date of Birth"
                name="applicationUser.dob"
                type="date"
                value={formData.applicationUser?.dob}
                onChange={handleChange}
              />
              <Input
                required
                label="Person ID"
                name="applicationUser.personId"
                value={formData.applicationUser?.personId}
                onChange={handleChange}
              />
              <Select
                required
                defaultSelectedKeys={formData.majorId}
                label="Major"
                name="majorId"
                value={formData.majorId}
                onChange={handleChange}
              >
                {majors.map((major) => (
                  <SelectItem key={major.id}>{major.name}</SelectItem>
                ))}
              </Select>
              <Select
                required
                defaultSelectedKeys={formData.batchId}
                label="Batch"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
              >
                {batches.map((batch) => (
                  <SelectItem key={batch.id}>{batch.title}</SelectItem>
                ))}
              </Select>
              <Input
                required
                label="Accumulate Credits"
                min={0}
                name="accumulateCredits"
                type="number"
                value={formData.accumulateCredits?.toString() || ""}
                onChange={handleChange}
              />
              <Input
                required
                label="Accumulate Score"
                min={0}
                name="accumulateScore"
                type="number"
                value={formData.accumulateScore?.toString() || ""}
                onChange={handleChange}
              />
              <Input
                required
                label="Accumulate Activity Score"
                min={0}
                name="accumulateActivityScore"
                type="number"
                value={formData.accumulateActivityScore?.toString() || ""}
                onChange={handleChange}
              />
              <Select
                required
                defaultSelectedKeys={formData.applicationUser?.status?.toString()}
                label="Status"
                name="applicationUser.status"
                value={formData.applicationUser?.status?.toString()}
                onChange={handleChange}
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
