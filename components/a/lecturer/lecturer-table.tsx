import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { PaginatedResponse } from "@/store/slices/lecturerSlice";

interface LecturerTableProps {
  lecturers: PaginatedResponse;
  isLoading: boolean;
  sortKey: string;
  sortDirection: "asc" | "desc";
  expandedRows: Record<string, boolean>;
  onSort: (key: string) => void;
  onEdit: (lecturer: Lecturer) => void;
  onDelete: (lecturerId: string) => void;
  onRowToggle: (lecturerId: string) => void;
}

export function LecturerTable({
  lecturers,
  isLoading,
  sortKey,
  sortDirection,
  expandedRows,
  onSort,
  onEdit,
  onDelete,
  onRowToggle,
}: LecturerTableProps) {
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    );
  };

  const getWorkingStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Inactive";
      case 1:
        return "Active";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="lecturer-table">
      <Table
        aria-label="Lecturer table"
        className="min-w-full"
        removeWrapper
      >
        <TableHeader>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("lecturerCode")}
          >
            <div className="flex items-center">
              Code {renderSortIcon("lecturerCode")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("applicationUser.firstName")}
          >
            <div className="flex items-center">
              Name {renderSortIcon("applicationUser.firstName")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("degree")}
          >
            <div className="flex items-center">
              Degree {renderSortIcon("degree")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("mainMajor")}
          >
            <div className="flex items-center">
              Main Major {renderSortIcon("mainMajor")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("workingStatus")}
          >
            <div className="flex items-center">
              Status {renderSortIcon("workingStatus")}
            </div>
          </TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"No lecturers found"}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {lecturers?.data?.data?.map((lecturer: Lecturer) => (
            <React.Fragment key={lecturer.id}>
              <TableRow
                className={expandedRows[lecturer.id] ? "expanded-row" : ""}
              >
                <TableCell>{lecturer.lecturerCode}</TableCell>
                <TableCell>
                  {`${lecturer.applicationUser.firstName} ${lecturer.applicationUser.lastName}`}
                </TableCell>
                <TableCell>{lecturer.degree}</TableCell>
                <TableCell>{lecturer.mainMajor}</TableCell>
                <TableCell>
                  <Chip
                    className={`status-badge ${
                      lecturer.workingStatus === 1 ? "active" : "inactive"
                    }`}
                    size="sm"
                  >
                    {getWorkingStatusText(lecturer.workingStatus)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => onRowToggle(lecturer.id)}
                    >
                      {expandedRows[lecturer.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => onEdit(lecturer)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => onDelete(lecturer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows[lecturer.id] && (
                <TableRow className="expanded-row">
                  <TableCell colSpan={6}>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Email</p>
                        <p className="text-sm">
                          {lecturer.applicationUser.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Phone</p>
                        <p className="text-sm">
                          {lecturer.applicationUser.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Person ID</p>
                        <p className="text-sm">
                          {lecturer.applicationUser.personId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Date of Birth</p>
                        <p className="text-sm">
                          {lecturer.applicationUser.dob}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Join Date</p>
                        <p className="text-sm">
                          {new Date(lecturer.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Salary</p>
                        <p className="text-sm">
                          {lecturer.salary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 