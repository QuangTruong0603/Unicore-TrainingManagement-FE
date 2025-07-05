import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Spinner,
} from "@heroui/react";
import { Users, User, BookOpen } from "lucide-react";

import { Enrollment } from "@/services/enrollment/enrollment.schema";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { useAddEnrollmentToExam } from "@/services/exam/exam.hooks";

interface AddEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
  examId?: string;
}

export function AddEnrollmentModal({
  isOpen,
  onClose,
  classId,
  className,
  examId,
}: AddEnrollmentModalProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEnrollmentToExamMutation = useAddEnrollmentToExam();

  useEffect(() => {
    if (isOpen && classId) {
      fetchEnrollments();
    }
  }, [isOpen, classId]);
  const fetchEnrollments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await enrollmentService.getEnrollmentsByClassId(classId);

      if (response.success && response.data) {
        setEnrollments(response.data);
      } else {
        setError("Failed to fetch enrollments");
      }
    } catch {
      setError("Error fetching enrollments");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(enrollments.map((enrollment) => enrollment.id));

      setSelectedEnrollments(allIds);
    } else {
      setSelectedEnrollments(new Set());
    }
  };

  const handleSelectEnrollment = (enrollmentId: string, checked: boolean) => {
    const newSelection = new Set(selectedEnrollments);

    if (checked) {
      newSelection.add(enrollmentId);
    } else {
      newSelection.delete(enrollmentId);
    }

    setSelectedEnrollments(newSelection);
  };
  const handleAdd = async () => {
    if (selectedEnrollments.size === 0 || !examId) return;

    try {
      const enrollmentIds = Array.from(selectedEnrollments);
      const addDto = {
        examId,
        enrollmentIds,
      };

      const result = await addEnrollmentToExamMutation.mutateAsync(addDto);

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log("Successfully added enrollments to exam:", {
          examId,
          enrollmentIds,
          result: result.data,
        });

        // Reset selections and close modal
        setSelectedEnrollments(new Set());
        onClose();
      } else {
        setError(result.errors?.[0] || "Failed to add enrollments to exam");
      }
    } catch {
      setError("Error adding enrollments to exam");
    }
  };

  const handleClose = () => {
    setSelectedEnrollments(new Set());
    setError(null);
    onClose();
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Enrolled";
      case 2:
        return "Dropped";
      case 3:
        return "Completed";
      default:
        return `Status ${status}`;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-red-100 text-red-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h2>Add Enrollment to Exam</h2>
          </div>
          {className && (
            <p className="text-sm text-gray-600">Class: {className}</p>
          )}
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span className="text-sm font-medium">
                    {enrollments.length} enrollments found
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    isIndeterminate={
                      selectedEnrollments.size > 0 &&
                      selectedEnrollments.size < enrollments.length
                    }
                    isSelected={
                      selectedEnrollments.size === enrollments.length &&
                      enrollments.length > 0
                    }
                    onValueChange={handleSelectAll}
                  >
                    Select All
                  </Checkbox>
                  <span className="text-sm text-gray-600">
                    {selectedEnrollments.size} selected
                  </span>
                </div>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto mb-2 opacity-50" size={48} />
                  <p>No enrollments found for this class</p>
                </div>
              ) : (
                <Table aria-label="Enrollments table">
                  <TableHeader>
                    <TableColumn>Student</TableColumn>
                    <TableColumn>Student Code</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Enrolled Date</TableColumn>
                    <TableColumn>Select</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <div>
                              <div className="font-medium">
                                {enrollment.student?.user?.fullName ||
                                  `${enrollment.student?.user?.firstName || ""} ${
                                    enrollment.student?.user?.lastName || ""
                                  }`.trim() ||
                                  "Unknown"}
                              </div>
                              {enrollment.student?.user?.email && (
                                <div className="text-xs text-gray-500">
                                  {enrollment.student.user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {enrollment.student?.studentCode || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              enrollment.status
                            )}`}
                          >
                            {getStatusText(enrollment.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(
                              enrollment.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            isSelected={selectedEnrollments.has(enrollment.id)}
                            onValueChange={(checked) =>
                              handleSelectEnrollment(enrollment.id, checked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={
              selectedEnrollments.size === 0 ||
              addEnrollmentToExamMutation.isPending
            }
            isLoading={addEnrollmentToExamMutation.isPending}
            onPress={handleAdd}
          >
            {addEnrollmentToExamMutation.isPending
              ? "Adding..."
              : `Add (${selectedEnrollments.size})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
