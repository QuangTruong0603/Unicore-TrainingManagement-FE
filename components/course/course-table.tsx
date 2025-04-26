import React from "react";
import { Button } from "@heroui/react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  X,
  ChevronsUpDown,
} from "lucide-react";
import {
  Table as HeroTable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./course-table.module.scss";

import { Course } from "@/services/course/course.schema";

interface CourseTableProps {
  courses: Course[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (courseId: string) => void;
  onRegistrationToggle: (course: Course) => void;
  onActiveToggle: (course: Course) => void;
}

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render: (course: Course) => React.ReactNode;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  isLoading = false,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onRegistrationToggle,
  onActiveToggle,
}) => {
  const columns: Column[] = [
    {
      key: "code",
      title: "Code",
      sortable: true,
      render: (course: Course) => course.code,
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (course: Course) => (
        <div
          className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
          title={course.name}
        >
          {course.name}
        </div>
      ),
    },
    {
      key: "major",
      title: "Major",
      sortable: true,
      render: (course: Course) => (
        <div
          className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis text-sm"
          title={course.major?.name || "No major assigned"}
        >
          {course.major?.name || "No major assigned"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded text-sm ${course.isRegistrable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {course.isRegistrable ? "Registrable" : "Not Registrable"}
        </span>
      ),
    },
    {
      key: "activeStatus",
      title: "Active Status",
      sortable: true,
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded text-sm ${course.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
        >
          {course.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (course: Course) => (
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-1 h-8 px-3 font-medium"
            color={course.isRegistrable ? "danger" : "success"}
            size="sm"
            startContent={
              course.isRegistrable ? <X size={16} /> : <Check size={16} />
            }
            variant="flat"
            onPress={() => onRegistrationToggle(course)}
          >
            {course.isRegistrable ? "Unregistry" : "Registry"}
          </Button>
          <Button
            className="flex items-center gap-1 h-8 px-3 font-medium"
            color={course.isActive ? "danger" : "success"}
            size="sm"
            startContent={
              course.isActive ? <PowerOff size={16} /> : <Power size={16} />
            }
            variant="flat"
            onPress={() => onActiveToggle(course)}
          >
            {course.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
    {
      key: "expand",
      title: "",
      render: (course: Course) => (
        <Button
          isIconOnly
          className="h-8 w-8 min-w-0 p-0 flex justify-center items-center"
          color="default"
          size="sm"
          variant="light"
          onPress={() => onRowToggle(course.id)}
        >
          {expandedRows[course.id] ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </Button>
      ),
    },
  ];

  const renderExpandedContent = (course: Course) => {
    return (
      <div className={styles.expandedContent}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border-t">
          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">
              {course.description || "No description available"}
            </p>
          </div>

          {/* Credit info */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Course Information
            </h4>
            <p className="text-gray-600">Credit: {course.credit}</p>
            <p className="text-gray-600">
              Major: {course.major?.name || "No major assigned"}
            </p>
            <p className="text-gray-600">
              Major Code: {course.major?.code || "N/A"}
            </p>
            <p className="text-gray-600">
              Cost per Credit: {course.major?.costPerCredit || 0}$
            </p>
            <p className="text-gray-600">
              Minimum Credit Required: {course.minCreditRequired || 0}
            </p>
            <p className="text-gray-600">
              Practice Period: {course.practicePeriod}
            </p>
          </div>

          {/* Course Certificates */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Certificates</h4>
            {course.courseCertificates &&
            course.courseCertificates.length > 0 ? (
              <ul className="list-disc pl-5">
                {course.courseCertificates.map((cert) => (
                  <li key={cert.certificateId} className="text-gray-600">
                    {cert.name} (Required Score: {cert.requiredScore})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No certificates available</p>
            )}
          </div>

          {/* Course Materials */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Materials</h4>
            {course.courseMaterials && course.courseMaterials.length > 0 ? (
              <ul className="list-disc pl-5">
                {course.courseMaterials.map((material) => (
                  <li key={material.materialId} className="text-gray-600">
                    <a
                      className="text-blue-500 hover:underline"
                      href={material.fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {material.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No materials available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // Create a flattened array that includes both rows and expanded rows
  const flattenedRows = courses.flatMap((course) => {
    const mainRow = {
      key: `row-${course.id}`,
      content: (
        <TableRow key={`row-${course.id}`}>
          {columns.map((column) => (
            <TableCell key={`${course.id}-${column.key}`}>
              {column.render(course)}
            </TableCell>
          ))}
        </TableRow>
      ),
    };

    if (expandedRows[course.id]) {
      return [
        mainRow,
        {
          key: `expanded-${course.id}`,
          content: (
            <TableRow
              key={`expanded-${course.id}`}
              className={styles.expandedRow}
            >
              <TableCell colSpan={columns.length}>
                {renderExpandedContent(course)}
              </TableCell>
            </TableRow>
          ),
        },
      ];
    }

    return [mainRow];
  });

  return (
    <div className={styles.tableWrapper}>
      <HeroTable aria-label="Courses Table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.sortable}
              className={column.sortable ? styles.sortableHeader : undefined}
              onClick={() => column.sortable && onSort?.(column.key)}
            >
              <div className="flex items-center gap-1">
                {column.title}
                {column.sortable && sortKey === column.key && (
                  <span className="text-gray-600">
                    {sortDirection === "asc" ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </span>
                )}
                {column.sortable && sortKey !== column.key && (
                  <ChevronsUpDown className="text-gray-300" size={14} />
                )}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {courses.length > 0 ? (
            flattenedRows.map((row) => row.content)
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center py-8 text-gray-500">
                  No courses found
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </HeroTable>
    </div>
  );
};
