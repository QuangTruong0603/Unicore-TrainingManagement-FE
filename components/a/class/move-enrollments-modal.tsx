import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Checkbox,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import { Move, User, Calendar } from "lucide-react";

import { Enrollment } from "@/services/enrollment/enrollment.schema";
import { AcademicClass } from "@/services/class/class.schema";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { classService } from "@/services/class/class.service";
import { EnrollmentConflictCheckDto } from "@/services/enrollment/enrollment.dto";

interface MoveEnrollmentsModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  sourceClass: AcademicClass | null;
  enrollments: Enrollment[];
  isLoadingEnrollments?: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: { toClassId: string; enrollmentIds: string[] }) => void;
}

export const MoveEnrollmentsModal: React.FC<MoveEnrollmentsModalProps> = ({
  isOpen,
  isSubmitting = false,
  sourceClass,
  enrollments,
  isLoadingEnrollments = false,
  onOpenChange,
  onSubmit,
}) => {
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    []
  );
  const [selectedTargetClassId, setSelectedTargetClassId] =
    useState<string>("");
  const [enrollmentsWithConflicts, setEnrollmentsWithConflicts] = useState<
    EnrollmentConflictCheckDto[]
  >([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [targetClasses, setTargetClasses] = useState<AcademicClass[]>([]);
  const [isLoadingTargetClasses, setIsLoadingTargetClasses] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedEnrollmentIds([]);
      setSelectedTargetClassId("");
      setEnrollmentsWithConflicts([]);
    }
  }, [isOpen]);

  // Check for conflicts when target class or enrollments change
  useEffect(() => {
    const checkConflicts = async () => {
      if (!selectedTargetClassId || enrollments.length === 0) {
        setEnrollmentsWithConflicts([]);

        return;
      }

      try {
        setIsCheckingConflicts(true);
        const response = await enrollmentService.checkClassConflict({
          classToCheckId: selectedTargetClassId,
          enrollmentIds: enrollments.map((e) => e.id),
        });

        setEnrollmentsWithConflicts(response.data?.enrollments || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error checking conflicts:", error);
        setEnrollmentsWithConflicts([]);
      } finally {
        setIsCheckingConflicts(false);
      }
    };

    checkConflicts();
  }, [selectedTargetClassId, enrollments]);
  const handleSubmit = () => {
    if (
      !sourceClass ||
      !selectedTargetClassId ||
      selectedEnrollmentIds.length === 0
    ) {
      return;
    }

    onSubmit({
      toClassId: selectedTargetClassId,
      enrollmentIds: selectedEnrollmentIds,
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      // Only select non-conflicted enrollments
      const availableEnrollments =
        enrollmentsWithConflicts.length > 0
          ? enrollmentsWithConflicts
              .filter((e) => !e.isConflict)
              .map((e) => e.id)
          : enrollments.map((enrollment) => enrollment.id);

      setSelectedEnrollmentIds(availableEnrollments);
    } else {
      setSelectedEnrollmentIds([]);
    }
  };

  const handleSelectEnrollment = (
    enrollmentId: string,
    isSelected: boolean
  ) => {
    // Check if this enrollment has a conflict
    const conflictData = enrollmentsWithConflicts.find(
      (e) => e.id === enrollmentId
    );

    if (conflictData?.isConflict) {
      return; // Don't allow selection of conflicted enrollments
    }

    if (isSelected) {
      setSelectedEnrollmentIds([...selectedEnrollmentIds, enrollmentId]);
    } else {
      setSelectedEnrollmentIds(
        selectedEnrollmentIds.filter((id) => id !== enrollmentId)
      );
    }
  };

  const availableEnrollments =
    enrollmentsWithConflicts.length > 0
      ? enrollmentsWithConflicts.filter((e) => !e.isConflict)
      : enrollments;
  const isAllSelected =
    availableEnrollments.length > 0 &&
    selectedEnrollmentIds.length === availableEnrollments.length;
  const isIndeterminate =
    selectedEnrollmentIds.length > 0 &&
    selectedEnrollmentIds.length < availableEnrollments.length;

  // Fetch target classes from same semester and course
  useEffect(() => {
    const fetchTargetClasses = async () => {
      if (!sourceClass?.semesterId || !sourceClass?.courseId || !isOpen) {
        setTargetClasses([]);

        return;
      }

      try {
        setIsLoadingTargetClasses(true);
        const response = await classService.getClassesBySemesterAndCourse(
          sourceClass.semesterId,
          sourceClass.courseId
        );

        // Filter out the source class itself
        const filteredClasses = (response.data || []).filter(
          (cls) => cls.id !== sourceClass.id
        );

        setTargetClasses(filteredClasses);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching target classes:", error);
        setTargetClasses([]);
      } finally {
        setIsLoadingTargetClasses(false);
      }
    };

    fetchTargetClasses();
  }, [sourceClass, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Move className="w-5 h-5" />
                <span>Move Enrollments</span>
              </div>
              {sourceClass && (
                <p className="text-sm text-gray-600 font-normal">
                  From: {sourceClass.course.code} - {sourceClass.course.name}{" "}
                  (Group {sourceClass.groupNumber})
                </p>
              )}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Target Class Selection */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Select Target Class
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Only showing classes from {sourceClass?.course.code} -{" "}
                    {sourceClass?.course.name} in Semester{" "}
                    {sourceClass?.semester?.semesterNumber}/
                    {sourceClass?.semester?.year}
                  </div>
                  {isLoadingTargetClasses ? (
                    <div className="p-3 border border-gray-200 rounded-md text-center text-gray-500">
                      <Spinner className="mr-2" size="sm" />
                      Loading available classes...
                    </div>
                  ) : targetClasses.length === 0 ? (
                    <div className="p-3 border border-gray-200 rounded-md text-center text-gray-500">
                      No other classes available for the same course and
                      semester
                    </div>
                  ) : (
                    <Select
                      placeholder="Choose a class to move enrollments to"
                      selectedKeys={
                        selectedTargetClassId ? [selectedTargetClassId] : []
                      }
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        setSelectedTargetClassId(selectedKey || "");
                      }}
                    >
                      {targetClasses.map((cls) => {
                        const displayText = `${cls.course.code} - ${cls.course.name} (Group ${cls.groupNumber})`;

                        return (
                          <SelectItem key={cls.id} textValue={displayText}>
                            <div className="flex flex-col">
                              <span>
                                {cls.course.code} - {cls.course.name} (Group{" "}
                                {cls.groupNumber})
                              </span>
                              <div className="flex gap-2 items-center text-xs">
                                {cls.enrollmentCount >= cls.capacity && (
                                  <span className="text-red-500">(Full)</span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </Select>
                  )}
                </div>

                {/* Enrollments List */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Select Enrollments to Move ({selectedEnrollmentIds.length}{" "}
                    selected)
                  </div>

                  {/* Conflict Summary */}
                  {selectedTargetClassId &&
                    enrollmentsWithConflicts.length > 0 && (
                      <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Conflict Check Results:
                          </span>
                          <span className="text-green-600">
                            {
                              enrollmentsWithConflicts.filter(
                                (e) => !e.isConflict
                              ).length
                            }{" "}
                            Available
                          </span>
                          {enrollmentsWithConflicts.filter((e) => e.isConflict)
                            .length > 0 && (
                            <span className="text-red-600">
                              {
                                enrollmentsWithConflicts.filter(
                                  (e) => e.isConflict
                                ).length
                              }{" "}
                              Conflicts
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {isLoadingEnrollments ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No enrollments found in this class
                    </div>
                  ) : (
                    <Table aria-label="Enrollments table">
                      <TableHeader>
                        <TableColumn>
                          <Checkbox
                            isIndeterminate={isIndeterminate}
                            isSelected={isAllSelected}
                            onValueChange={handleSelectAll}
                          />
                        </TableColumn>
                        <TableColumn>Student</TableColumn>
                        <TableColumn>Student Code</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Conflict Status</TableColumn>
                        <TableColumn>Enrolled Date</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => {
                          const conflictData = enrollmentsWithConflicts.find(
                            (e) => e.id === enrollment.id
                          );
                          const hasConflict = conflictData?.isConflict || false;
                          const isDisabled = hasConflict;

                          return (
                            <TableRow
                              key={enrollment.id}
                              className={hasConflict ? "opacity-50" : ""}
                            >
                              <TableCell>
                                <Checkbox
                                  isDisabled={isDisabled}
                                  isSelected={selectedEnrollmentIds.includes(
                                    enrollment.id
                                  )}
                                  onValueChange={(isSelected) =>
                                    handleSelectEnrollment(
                                      enrollment.id,
                                      isSelected
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {enrollment.student?.user?.fullName ||
                                      "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {enrollment.student?.studentCode || "N/A"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    enrollment.status === 1
                                      ? " bg-gray-100 text-gray-800"
                                      : enrollment.status === 2
                                        ? " bg-yellow-100 text-yellow-800"
                                        : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {enrollment.status === 1
                                    ? "Pending"
                                    : enrollment.status === 2
                                      ? "Approved"
                                      : `Status ${enrollment.status}`}
                                </span>
                              </TableCell>
                              <TableCell>
                                {isCheckingConflicts ? (
                                  <Spinner size="sm" />
                                ) : hasConflict ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    ⚠️ Schedule Conflict
                                  </span>
                                ) : selectedTargetClassId ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    ✓ No Conflict
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-xs">
                                    Select target class
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm">
                                    {new Date(
                                      enrollment.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={
                  !selectedTargetClassId ||
                  selectedEnrollmentIds.length === 0 ||
                  targetClasses.length === 0 ||
                  isSubmitting
                }
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                Move {selectedEnrollmentIds.length} Enrollment
                {selectedEnrollmentIds.length !== 1 ? "s" : ""}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
