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
import { ChevronDown, ChevronUp } from "lucide-react";
import { Student } from "@/services/student/student.schema";
import styles from "./student-table.module.scss";

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
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
}) => {
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
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
      <div className="text-center py-8 text-gray-500">
        No students found
      </div>
    );
  }

  return (
    <Table aria-label="Student table">
      <TableHeader>
        <TableColumn
          key="studentCode"
          onClick={() => onSort("studentCode")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            Student Code
            {renderSortIcon("studentCode")}
          </div>
        </TableColumn>
        <TableColumn
          key="name"
          onClick={() => onSort("firstName")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            Name
            {renderSortIcon("firstName")}
          </div>
        </TableColumn>
        <TableColumn
          key="email"
          onClick={() => onSort("email")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            Email
            {renderSortIcon("email")}
          </div>
        </TableColumn>
        <TableColumn
          key="phoneNumber"
          onClick={() => onSort("phoneNumber")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            Phone
            {renderSortIcon("phoneNumber")}
          </div>
        </TableColumn>
        <TableColumn
          key="status"
          onClick={() => onSort("status")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            Status
            {renderSortIcon("status")}
          </div>
        </TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {students.data.data.map((student) => (
          <React.Fragment key={student.studentCode}>
            <TableRow>
              <TableCell>{student.studentCode}</TableCell>
              <TableCell>{`${student.applicationUser.firstName} ${student.applicationUser.lastName}`}</TableCell>
              <TableCell>{student.applicationUser.email}</TableCell>
              <TableCell>{student.applicationUser.phoneNumber}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    student.applicationUser.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.applicationUser.status === 1 ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onRowToggle(student.studentCode)}
                >
                  {expandedRows[student.studentCode] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
            {expandedRows[student.studentCode] && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">Person ID</p>
                        <p>{student.applicationUser.personId}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Date of Birth</p>
                        <p>{new Date(student.applicationUser.dob).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Major ID</p>
                        <p>{student.majorId}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Batch ID</p>
                        <p>{student.batchId}</p>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}; 