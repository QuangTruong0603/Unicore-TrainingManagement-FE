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
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";

import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { PaginatedResponse } from "@/services/dto";

interface LecturerTableProps {
  lecturers: PaginatedResponse<Lecturer>;
  isLoading: boolean;
  sortKey: string;
  sortDirection: "asc" | "desc";
  expandedRows: Record<string, boolean>;
  onSort: (key: string) => void;
  onEdit: (lecturer: Lecturer) => void;
  onDelete: (lecturerId: string, lecturerName: string) => void;
  onRowToggle: (lecturerId: string) => void;
  onViewDetail: (lecturer: Lecturer) => void;
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
  onViewDetail,
}: LecturerTableProps) {
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    );
  };

  const handleAction = (key: string, lecturer: Lecturer) => {
    if (key === "edit") {
      onEdit(lecturer);
    } else if (key === "delete") {
      onDelete(
        lecturer.id,
        `${lecturer.applicationUser.firstName} ${lecturer.applicationUser.lastName}`
      );
    } else if (key === "viewDetail") {
      onViewDetail(lecturer);
    }
  };

  return (
    <div className="lecturer-table">
      <Table removeWrapper aria-label="Lecturer table" className="min-w-full">
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
            onClick={() => onSort("applicationUser.email")}
          >
            <div className="flex items-center">
              Email {renderSortIcon("applicationUser.email")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("applicationUser.phoneNumber")}
          >
            <div className="flex items-center">
              Phone {renderSortIcon("applicationUser.phoneNumber")}
            </div>
          </TableColumn>
          <TableColumn
            className="cursor-pointer"
            onClick={() => onSort("applicationUser.dob")}
          >
            <div className="flex items-center">
              Date of Birth {renderSortIcon("applicationUser.dob")}
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

          <TableColumn>Details</TableColumn>
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
                <TableCell>{lecturer.applicationUser.email}</TableCell>
                <TableCell>{lecturer.applicationUser.phoneNumber}</TableCell>
                <TableCell>
                  {lecturer.applicationUser.dob
                    ? new Date(
                        lecturer.applicationUser.dob
                      ).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{lecturer.degree}</TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    aria-label={
                      expandedRows[lecturer.id]
                        ? "Hide Details"
                        : "Show Details"
                    }
                    size="sm"
                    variant="light"
                    onClick={() => onRowToggle(lecturer.id)}
                  >
                    {expandedRows[lecturer.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Lecturer Actions"
                      onAction={(key) => handleAction(key.toString(), lecturer)}
                    >
                      <DropdownItem
                        key="viewDetail"
                        startContent={<Eye className="w-4 h-4" />}
                      >
                        View Detail
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="w-4 h-4" />}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
              {expandedRows[lecturer.id] && (
                <TableRow className="expanded-row">
                  <TableCell colSpan={8}>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Main Major</p>
                        <p className="text-sm">{lecturer.mainMajor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Person ID</p>
                        <p className="text-sm">
                          {lecturer.applicationUser.personId}
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
