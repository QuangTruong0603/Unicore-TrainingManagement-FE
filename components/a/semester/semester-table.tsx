import React, { useEffect } from "react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  Power,
  PowerOff,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import { Semester } from "@/services/semester/semester.schema";

interface SemesterTableProps {
  semesters: Semester[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (semesterId: string) => void;
  onEdit: (semester: Semester) => void;
  onActiveToggle: (semester: Semester) => void;
}

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render: (semester: Semester) => React.ReactNode;
}

export const SemesterTable: React.FC<SemesterTableProps> = ({
  semesters,
  isLoading = false,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onEdit,
  onActiveToggle,
}) => {
  // Initialize default sort by year if no sort is set
  useEffect(() => {
    if (!sortKey && onSort) {
      onSort("year");
    }
  }, [sortKey, onSort]);

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-primary-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-primary-500" />
    );
  };

  const columns: Column[] = [
    {
      key: "semesterNumber",
      title: "Semester",
      sortable: true,
      render: (semester: Semester) => `Semester ${semester.semesterNumber}`,
    },
    {
      key: "year",
      title: "Year",
      sortable: true,
      render: (semester: Semester) => semester.year,
    },
    {
      key: "isActive",
      title: "Status",
      sortable: true,
      render: (semester: Semester) => (
        <Chip
          color={semester.isActive ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {semester.isActive ? "Active" : "Inactive"}
        </Chip>
      ),
    },
    {
      key: "startDate",
      title: "Start Date",
      sortable: true,
      render: (semester: Semester) =>
        new Date(semester.startDate).toLocaleDateString(),
    },
    {
      key: "endDate",
      title: "End Date",
      sortable: true,
      render: (semester: Semester) =>
        new Date(semester.endDate).toLocaleDateString(),
    },
    {
      key: "numberOfWeeks",
      title: "Weeks",
      sortable: true,
      render: (semester: Semester) => semester.numberOfWeeks,
    },
    {
      key: "actions",
      title: "Actions",
      render: (semester: Semester) => (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly aria-label="Actions" size="sm" variant="light">
                <MoreVertical size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Semester Actions">
              <DropdownItem
                key="edit"
                startContent={<Edit size={16} />}
                onPress={() => onEdit(semester)}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                startContent={<Trash2 size={16} />}
                onPress={() => {
                  // eslint-disable-next-line no-console
                  console.log("Delete semester:", semester);
                }}
              >
                Delete
              </DropdownItem>
              <DropdownItem
                key="toggle-active"
                startContent={
                  semester.isActive ? (
                    <PowerOff size={16} />
                  ) : (
                    <Power size={16} />
                  )
                }
                onPress={() => onActiveToggle(semester)}
              >
                {semester.isActive ? "Deactivate" : "Activate"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table isHeaderSticky isStriped aria-label="Semester table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? "cursor-pointer" : ""} ${column.key === "actions" ? "text-right" : ""}`}
              onClick={() => {
                if (column.sortable && onSort) {
                  onSort(column.key);
                }
              }}
            >
              <div
                className={`flex items-center ${column.key === "actions" ? "justify-end" : ""} ${sortKey === column.key ? "text-primary-500" : ""}`}
              >
                {column.title}
                {column.sortable && renderSortIcon(column.key)}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? "Loading..." : "No semesters found"}
          isLoading={isLoading}
        >
          {semesters.map((semester) => (
            <React.Fragment key={semester.id}>
              <TableRow onClick={() => onRowToggle(semester.id)}>
                {columns.map((column) => (
                  <TableCell
                    key={`${semester.id}_${column.key}`}
                    className={column.key === "actions" ? "text-right" : ""}
                  >
                    {column.render(semester)}
                  </TableCell>
                ))}
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
