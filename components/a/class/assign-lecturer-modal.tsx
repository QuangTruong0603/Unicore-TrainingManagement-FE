import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import { useLecturersByMajors } from "@/services/lecturer/lecturer.hooks";
import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { useAssignLecturerToClasses } from "@/services/class/class.hooks";

interface AssignLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess?: (message: string) => void;
  majorIds: string[];
  selectedClassNames?: string[];
  selectedClassIds: string[];
}

export const AssignLecturerModal: React.FC<AssignLecturerModalProps> = ({
  isOpen,
  onClose,
  onAssignSuccess,
  majorIds,
  selectedClassNames,
  selectedClassIds,
}) => {
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: lecturersResponse,
    isLoading,
    error,
  } = useLecturersByMajors(majorIds, isOpen && majorIds.length > 0);

  const assignLecturerMutation = useAssignLecturerToClasses();

  const lecturers: Lecturer[] = lecturersResponse?.data || [];

  // Filter lecturers based on search term
  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      `${lecturer.applicationUser.firstName} ${lecturer.applicationUser.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lecturer.lecturerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedLecturerId("");
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleAssignLecturer = async (lecturerId: string) => {
    try {
      await assignLecturerMutation.mutateAsync({
        lecturerId,
        academicClassIds: selectedClassIds,
      });
      
      if (onAssignSuccess) {
        onAssignSuccess(
          `Successfully assigned lecturer to ${selectedClassIds.length} class(es).`
        );
      }

      setSelectedLecturerId(lecturerId);
    } catch {
      // Handle error silently or show user notification
    }
  };

  const handleClose = () => {
    setSelectedLecturerId("");
    setSearchTerm("");
    onClose();
  };

  const getDisplayName = (lecturer: Lecturer) => {
    return `${lecturer.applicationUser.firstName} ${lecturer.applicationUser.lastName} (${lecturer.lecturerCode})`;
  };

  return (
    <Modal isOpen={isOpen} size="5xl" onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          <div>
            <h3>Assign Lecturer</h3>
            {selectedClassNames && selectedClassNames.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Selected classes: {selectedClassNames.join(", ")}
              </p>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          {majorIds.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No majors found for selected classes. Cannot fetch lecturers.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading lecturers...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              Error loading lecturers. Please try again.
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                isClearable
                placeholder="Search lecturers by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="max-h-96 overflow-y-auto">
                <Table aria-label="Lecturers table">
                  <TableHeader>
                    <TableColumn>LECTURER CODE</TableColumn>
                    <TableColumn>FULL NAME</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      filteredLecturers.length === 0 && lecturers.length > 0
                        ? "No lecturers found matching your search."
                        : "No lecturers available for the selected majors."
                    }
                  >
                    {filteredLecturers.map((lecturer) => (
                      <TableRow key={lecturer.id}>
                        <TableCell>{lecturer.lecturerCode}</TableCell>
                        <TableCell>
                          {`${lecturer.applicationUser.firstName} ${lecturer.applicationUser.lastName}`}
                        </TableCell>
                        <TableCell>{lecturer.applicationUser.email}</TableCell>
                        <TableCell>
                          <Button
                            color="primary"
                            disabled={
                              selectedLecturerId === lecturer.id ||
                              assignLecturerMutation.isPending
                            }
                            size="sm"
                            onClick={() => handleAssignLecturer(lecturer.id)}
                          >
                            {selectedLecturerId === lecturer.id
                              ? "Selected"
                              : assignLecturerMutation.isPending
                                ? "Assigning..."
                                : "Choose"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedLecturerId && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Selected Lecturer:</strong>{" "}
                    {(() => {
                      const selectedLecturer = lecturers.find(
                        (l) => l.id === selectedLecturerId
                      );

                      return selectedLecturer
                        ? getDisplayName(selectedLecturer)
                        : "";
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
