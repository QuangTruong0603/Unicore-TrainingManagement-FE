import React, { useState, useEffect } from "react";
import {
  Button,
  Tooltip,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@heroui/react";
import { ArrowDown, ArrowUp, MoreVertical, Trash } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import { Enrollment } from "@/services/enrollment/enrollment.schema";

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  isLoading?: boolean;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onDeleteEnrollment?: (enrollment: Enrollment) => void;
  selectedEnrollmentIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

const columns: Column[] = [
  { key: "checkbox", label: "", width: "w-12" },
  { key: "studentCode", label: "Student Code", sortable: true },
  { key: "studentName", label: "Student Name", sortable: true },
  { key: "courseName", label: "Course Name", sortable: true },
  { key: "className", label: "Class", sortable: true },
  { key: "semester", label: "Semester", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "enrolledDate", label: "Enrolled Date", sortable: true },
  { key: "actions", label: "Actions", width: "w-24" },
];

export function EnrollmentTable({
  enrollments,
  isLoading,
  sortKey,
  sortDirection,
  onSort,
  onDeleteEnrollment,
  selectedEnrollmentIds,
  onSelectionChange,
}: EnrollmentTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Started";
      case 3:
        return "Passed";
      case 4:
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const handleCheckboxChange = (enrollmentId: string, isChecked: boolean) => {
    if (isChecked) {
      onSelectionChange([...selectedEnrollmentIds, enrollmentId]);
    } else {
      onSelectionChange(
        selectedEnrollmentIds.filter((id) => id !== enrollmentId)
      );
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onSelectionChange(enrollments.map((enrollment) => enrollment.id));
    } else {
      onSelectionChange([]);
    }
  };

  const isAllSelected =
    enrollments.length > 0 &&
    selectedEnrollmentIds.length === enrollments.length;
  const isIndeterminate =
    selectedEnrollmentIds.length > 0 &&
    selectedEnrollmentIds.length < enrollments.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label="Enrollments table"
      classNames={{
        wrapper: "min-h-[400px]",
      }}
    >
      <TableHeader>
        {columns.map((column) => (
          <TableColumn
            key={column.key}
            className={`${column.sortable ? "cursor-pointer" : ""} ${
              column.sortable && sortKey === column.key ? "text-primary" : ""
            } ${column.width || ""}`}
            onClick={() => column.sortable && onSort?.(column.key)}
          >
            {column.key === "checkbox" ? (
              <div className="flex justify-center">
                {isClient ? (
                  <Checkbox
                    aria-label="Select all enrollments"
                    isIndeterminate={isIndeterminate}
                    isSelected={isAllSelected}
                    onValueChange={handleSelectAll}
                  />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
            ) : (
              <div className="flex items-center">
                {column.label} {column.sortable && renderSortIcon(column.key)}
              </div>
            )}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody emptyContent="No enrollments found">
        {enrollments.map((enrollment) => {
          return (
            <React.Fragment key={enrollment.id}>
              <TableRow>
                <TableCell>
                  {isClient ? (
                    <Checkbox
                      aria-label="Select enrollment"
                      isSelected={selectedEnrollmentIds.includes(enrollment.id)}
                      onValueChange={(checked: boolean) =>
                        handleCheckboxChange(enrollment.id, checked)
                      }
                    />
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {enrollment.student?.studentCode || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {enrollment.student?.user?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {enrollment.student?.user?.email || "N/A"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip
                    content={
                      enrollment.academicClass?.course?.description || ""
                    }
                  >
                    <span className="max-w-[200px] truncate block">
                      {enrollment.academicClass?.course?.name || "N/A"}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <span>{enrollment.academicClass?.name || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <span>
                    {enrollment.academicClass?.semester
                      ? `${enrollment.academicClass.semester.semesterNumber}/${enrollment.academicClass.semester.year}`
                      : "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={
                      enrollment.status == 3
                        ? "success"
                        : enrollment.status == 2
                          ? "secondary"
                          : enrollment.status == 1
                            ? "warning"
                            : enrollment.status === 4
                              ? "danger"
                              : "default"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {getStatusLabel(enrollment.status)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatDate(enrollment.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end pr-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Enrollment Actions"
                        onAction={(key) => {
                          switch (key) {
                            case "delete":
                              if (onDeleteEnrollment)
                                onDeleteEnrollment(enrollment);
                              break;
                          }
                        }}
                      >
                        <DropdownItem
                          key="delete"
                          startContent={<Trash className="w-4 h-4" />}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
