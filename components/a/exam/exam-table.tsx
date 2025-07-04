import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash,
  Clock,
  Users,
  MapPin,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import { AddEnrollmentModal } from "./add-enrollment-modal";

import { Exam } from "@/services/exam/exam.schema";

interface ExamTableProps {
  exams: Exam[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (examId: string) => void;
  onDeleteExam?: (exam: Exam) => void;
  onUpdateExam?: (exam: Exam) => void;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

const columns: Column[] = [
  { key: "expand", label: "", sortable: false, width: "50px" },
  {
    key: "examTime",
    label: "Exam Date & Time",
    sortable: true,
    width: "200px",
  },
  { key: "type", label: "Type", sortable: true, width: "100px" },
  { key: "group", label: "Group", sortable: true, width: "80px" },
  { key: "duration", label: "Duration", sortable: true, width: "100px" },
  { key: "academicClass", label: "Class", sortable: false, width: "150px" },
  { key: "room", label: "Room", sortable: false, width: "120px" },
  { key: "statistics", label: "Statistics", sortable: false, width: "150px" },
  { key: "actions", label: "Actions", sortable: false, width: "80px" },
];

const examTypeMap: Record<number, string> = {
  1: "Midterm",
  2: "Final",
  3: "Quiz",
  4: "Lab",
  5: "Practical",
};

export function ExamTable({
  exams,
  isLoading = false,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onDeleteExam: _onDeleteExam,
  onUpdateExam: _onUpdateExam,
}: ExamTableProps) {
  const router = useRouter();
  const [isAddEnrollmentModalOpen, setIsAddEnrollmentModalOpen] =
    useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };
  const handleViewDetails = (exam: Exam) => {
    router.push(`/a/training/exam/${exam.id}`);
  };

  const handleAddEnrollmentClick = (exam: Exam) => {
    setSelectedExam(exam);
    setIsAddEnrollmentModalOpen(true);
  };

  const handleCloseAddEnrollmentModal = () => {
    setIsAddEnrollmentModalOpen(false);
    setSelectedExam(null);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return null;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    );
  };

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + "m" : ""}`;
    }

    return `${mins}m`;
  };
  const handleRowClick = (examId: string) => {
    onRowToggle(examId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading exams...</div>
      </div>
    );
  }

  return (
    <>
      <Table aria-label="Exam management table" className="min-w-full">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${
                column.sortable ? "cursor-pointer hover:bg-gray-50" : ""
              } font-semibold`}
              style={{ width: column.width }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center justify-between">
                <span>{column.label}</span>
                {column.sortable && renderSortIcon(column.key)}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="text-center py-8 text-gray-500">
                  No exams found
                </div>
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <React.Fragment key={exam.id}>
                <TableRow
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(exam)}
                >
                  <TableCell>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(exam.id);
                      }}
                    >
                      {expandedRows[exam.id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatDateTime(exam.examTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {examTypeMap[exam.type] || `Type ${exam.type}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      Group {exam.group}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} />
                      {formatDuration(exam.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {exam.academicClass?.name || "N/A"}
                      </div>
                      {exam.academicClass?.groupNumber && (
                        <div className="text-gray-500 text-xs">
                          Group {exam.academicClass.groupNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin size={14} />
                      <div>
                        <div className="font-medium">
                          {exam.room?.name || "N/A"}
                        </div>
                        {exam.room?.availableSeats && (
                          <div className="text-gray-500 text-xs">
                            {exam.room.availableSeats} seats
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span className="text-xs">
                          {exam.totalEnrollment || 0} enrolled
                        </span>
                      </div>
                      {exam.averageScore !== undefined && (
                        <div className="text-xs text-green-600">
                          Avg: {exam.averageScore.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Exam actions">
                        <DropdownItem
                          key="add-enrollment"
                          startContent={<UserPlus size={16} />}
                          onPress={() => handleAddEnrollmentClick(exam)}
                        >
                          Add Enrollment
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit size={16} />}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Trash size={16} />}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
                {expandedRows[exam.id] && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Statistics
                            </h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Passed: {exam.totalPassed || 0}</div>
                              <div>Failed: {exam.totalFailed || 0}</div>
                              <div>
                                Pass Rate:{" "}
                                {exam.totalEnrollment > 0
                                  ? (
                                      ((exam.totalPassed || 0) /
                                        exam.totalEnrollment) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </div>
                            </div>
                          </div>
                          {exam.academicClass && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">
                                Class Info
                              </h4>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div>
                                  Capacity: {exam.academicClass.capacity}
                                </div>
                                <div>
                                  Registrable:{" "}
                                  {exam.academicClass.isRegistrable
                                    ? "Yes"
                                    : "No"}
                                </div>
                                {exam.academicClass.listOfWeeks && (
                                  <div>
                                    Weeks:{" "}
                                    {exam.academicClass.listOfWeeks.join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Enrollment Modal */}
      {selectedExam && (
        <AddEnrollmentModal
          classId={selectedExam.academicClass?.id || ""}
          className={selectedExam.academicClass?.name || ""}
          examId={selectedExam.id}
          isOpen={isAddEnrollmentModalOpen}
          onClose={handleCloseAddEnrollmentModal}
        />
      )}
    </>
  );
}
