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
  ArrowDown,
  ArrowUp,
  Trash,
  Pencil,
  MoreVertical,
  Edit,
} from "lucide-react";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
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
    <Table isHeaderSticky isStriped aria-label="Student table">
      <TableHeader>
        <TableColumn
          key="studentCode"
          className={`cursor-pointer ${sortKey === "studentCode" ? "text-primary" : ""}`}
          onClick={() => onSort("studentCode")}
        >
          <div className="flex items-center gap-2">
            Student Code
            {renderSortIcon("studentCode")}
          </div>
        </TableColumn>
        <TableColumn
          key="name"
          className={`cursor-pointer ${sortKey === "firstName" ? "text-primary" : ""}`}
          onClick={() => onSort("firstName")}
        >
          <div className="flex items-center gap-2">
            Name
            {renderSortIcon("firstName")}
          </div>
        </TableColumn>
        <TableColumn
          key="email"
          className={`cursor-pointer ${sortKey === "email" ? "text-primary" : ""}`}
          onClick={() => onSort("email")}
        >
          <div className="flex items-center gap-2">
            Email
            {renderSortIcon("email")}
          </div>
        </TableColumn>
        <TableColumn
          key="phoneNumber"
          className={`cursor-pointer ${sortKey === "phoneNumber" ? "text-primary" : ""}`}
          onClick={() => onSort("phoneNumber")}
        >
          <div className="flex items-center gap-2">
            Phone
            {renderSortIcon("phoneNumber")}
          </div>
        </TableColumn>

        <TableColumn>Date of Birth</TableColumn>
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
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Student Actions"
                    onAction={(key) => {
                      if (key === "view") {
                        router.push(`/a/students/profile/${student.id}`);
                      } else if (key === "edit") {
                        onEdit(student);
                      } else if (key === "update") {
                        if (onUpdate) onUpdate(student);
                      } else if (key === "delete") {
                        handleDelete(student.id);
                      }
                    }}
                  >
                    <DropdownItem
                      key="view"
                      startContent={<Pencil className="w-4 h-4" />}
                    >
                      View
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      startContent={<Edit className="w-4 h-4" />}
                    >
                      Edit
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
