import React from "react";
import { Button } from "@heroui/react";
import { ArrowDown, ArrowUp, Check, Power, PowerOff } from "lucide-react";
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
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onEdit,
  onActiveToggle,
}) => {
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
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
      key: "status",
      title: "Status",
      sortable: true,
      render: (semester: Semester) => (
        <div
          className={`${styles.status} ${
            semester.isActive ? styles.active : styles.inactive
          } flex items-center gap-2`}
        >
          {semester.isActive ? (
            <>
              <Check className="w-4 h-4" /> Active
            </>
          ) : (
            <>
              <PowerOff className="w-4 h-4" /> Inactive
            </>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (semester: Semester) => (
        <div className={styles.actionButtons}>
          <Button color="warning" size="sm" onPress={() => onEdit(semester)}>
            Edit
          </Button>
          <Button
            color={semester.isActive ? "danger" : "success"}
            size="sm"
            onPress={() => onActiveToggle(semester)}
          >
            {semester.isActive ? (
              <>
                <PowerOff className="w-4 h-4 mr-1" /> Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-1" /> Activate
              </>
            )}
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
              className={column.sortable ? "cursor-pointer" : ""}
              onClick={() => {
                if (column.sortable && onSort) {
                  onSort(column.key);
                }
              }}
            >
              <div className="flex items-center">
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
                  <TableCell key={`${semester.id}_${column.key}`}>
                    {column.render(semester)}
                  </TableCell>
                ))}
              </TableRow>
              {expandedRows[semester.id] && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className={styles.expandedContent}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Created At</p>
                          <p>{new Date(semester.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Updated At</p>
                          <p>{new Date(semester.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </HeroTable>
    </div>
  );
};
