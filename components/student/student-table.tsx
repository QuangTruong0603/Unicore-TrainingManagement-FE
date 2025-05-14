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
} from "@heroui/react";
import { ChevronDown, ChevronUp, Trash, Pencil } from "lucide-react";

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
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  onDelete,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
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
              <TableCell className="text-center">
                {student.applicationUser.status}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  className="ml-1"
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(student)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  className="ml-1"
                  size="sm"
                  variant="light"
                  onPress={() => handleDelete(student.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};
