import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { ArrowDown, ArrowUp, Power, PowerOff } from "lucide-react";
import {
  Table as HeroTable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./semester-table.module.scss";

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
        <span
          className={`px-2 py-1 rounded text-sm ${
            semester.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {semester.isActive ? "Active" : "Inactive"}
        </span>
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
        <div className="flex justify-end gap-2">
          <Button
            className="flex items-center gap-1 h-8 px-3 font-medium"
            color="primary"
            size="sm"
            variant="flat"
            onPress={() => onEdit(semester)}
          >
            Edit
          </Button>
          <Button
            className="flex items-center gap-1 h-8 px-3 font-medium"
            color={semester.isActive ? "danger" : "success"}
            size="sm"
            startContent={
              semester.isActive ? <PowerOff size={16} /> : <Power size={16} />
            }
            variant="flat"
            onPress={() => onActiveToggle(semester)}
          >
            {semester.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <HeroTable isHeaderSticky aria-label="Semester table">
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
              <TableRow
                className={styles.expandableRow}
                onClick={() => onRowToggle(semester.id)}
              >
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
      </HeroTable>
    </div>
  );
};
