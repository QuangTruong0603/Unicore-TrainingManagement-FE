import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ChevronDown,
  ChevronUp,
  Trash,
  Pencil,
  MoreVertical,
  Edit,
} from "lucide-react";

import { Student } from "@/services/student/student.schema";
interface StudentTableProps {
  students: {
    success: boolean;
    data: {
      data: Student[];
      total: number;
    };
    errors: string[];
  } | null;
  isLoading: boolean;
  expandedRows: Record<string, boolean>;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onRowToggle: (studentId: string) => void;
  onDelete: (studentId: string) => void;
  onEdit: (student: Student) => void;
  onUpdate?: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  onDelete,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onUpdate,
}) => {
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleDelete = (studentId: string) => {
    onDelete(studentId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!students?.data.data.length) {
    return (
      <div className="text-center py-8 text-gray-500">No students found</div>
    );
  }

  return (
    <Table aria-label="Student table">
      <TableHeader>
        <TableColumn
          key="studentCode"
          className="cursor-pointer"
          onClick={() => onSort("studentCode")}
        >
          <div className="flex items-center gap-2">
            Student Code
            {renderSortIcon("studentCode")}
          </div>
        </TableColumn>
        <TableColumn
          key="name"
          className="cursor-pointer"
          onClick={() => onSort("firstName")}
        >
          <div className="flex items-center gap-2">
            Name
            {renderSortIcon("firstName")}
          </div>
        </TableColumn>
        <TableColumn
          key="email"
          className="cursor-pointer"
          onClick={() => onSort("email")}
        >
          <div className="flex items-center gap-2">
            Email
            {renderSortIcon("email")}
          </div>
        </TableColumn>
        <TableColumn
          key="phoneNumber"
          className="cursor-pointer"
          onClick={() => onSort("phoneNumber")}
        >
          <div className="flex items-center gap-2">
            Phone
            {renderSortIcon("phoneNumber")}
          </div>
        </TableColumn>

        <TableColumn>Date of Birth</TableColumn>
        <TableColumn
          key="status"
          className="cursor-pointer text-center"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center gap-2">
            Status
            {renderSortIcon("status")}
          </div>
        </TableColumn>
        <TableColumn className="text-center">Action</TableColumn>
      </TableHeader>
      <TableBody>
        {students.data.data.map((student) => (
          <React.Fragment key={student.studentCode}>
            <TableRow>
              <TableCell>{student.studentCode}</TableCell>
              <TableCell>{`${student.applicationUser.firstName} ${student.applicationUser.lastName}`}</TableCell>
              <TableCell>{student.applicationUser.email}</TableCell>
              <TableCell>{student.applicationUser.phoneNumber}</TableCell>
              <TableCell>{student.applicationUser.dob}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.applicationUser.status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {student.applicationUser.status === 1 ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Student Actions"
                    onAction={(key) => {
                      if (key === "edit") {
                        onEdit(student);
                      } else if (key === "update") {
                        if (onUpdate) onUpdate(student);
                      } else if (key === "delete") {
                        handleDelete(student.id);
                      }
                    }}
                  >
                    <DropdownItem
                      key="edit"
                      startContent={<Pencil className="w-4 h-4" />}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="update"
                      startContent={<Edit className="w-4 h-4" />}
                    >
                      Update
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<Trash className="w-4 h-4" />}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};
