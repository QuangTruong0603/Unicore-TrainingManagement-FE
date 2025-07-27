/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from "react";
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  MoreVertical,
  Edit,
  Trash,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { useRouter } from "next/router";

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
  onActiveToggle: (course: Course) => void;
  onDeleteCourse?: (course: Course) => void;
  onUpdateCourse?: (course: Course) => void;
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
  onActiveToggle,
  onDeleteCourse,
  onUpdateCourse,
}) => {
  const router = useRouter();

  const handleNavigateToMaterials = (courseId: string, courseName: string) => {
    router.push(
      `/a/academic/courses/${courseId}/materials?name=${encodeURIComponent(courseName)}`
    );
  };

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
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer text-primary hover:underline"
          title={course.name}
          onClick={() => handleNavigateToMaterials(course.id, course.name)}
        >
          {course.name}
        </div>
      ),
    },
    {
      key: "major",
      title: "Applicable Majors",
      sortable: false,
      render: (course: Course) => (
        <div className="max-w-[250px] w-full overflow-hidden flex flex-wrap gap-1">
          {course.isOpenForAll ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              All Majors
            </span>
          ) : course.majors && course.majors.length > 0 ? (
            course.majors.map((major) => (
              <Tooltip key={major.id} content={major.name}>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs cursor-help">
                  {major.code}
                </span>
              </Tooltip>
            ))
          ) : (
            <span className="text-gray-500 text-xs">None</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Open For All",
      sortable: true,
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${course.isOpenForAll ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {course.isOpenForAll ? "Open For All" : "Not Open For All"}
        </span>
      ),
    },
    // {
    //   key: "activeStatus",
    //   title: "Active Status",
    //   sortable: true,
    //   render: (course: Course) => (
    //     <span
    //       className={`px-2 py-1 rounded-full text-xs ${course.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
    //     >
    //       {course.isActive ? "Active" : "Inactive"}
    //     </span>
    //   ),
    // },
    {
      key: "actions",
      title: "Actions",
      render: (course: Course) => {
        const handleActionSelection = (key: React.Key) => {
          switch (key) {
            case "update":
              if (onUpdateCourse) onUpdateCourse(course);
              break;
            case "delete":
              if (onDeleteCourse) onDeleteCourse(course);
              break;
            case "activate":
              onActiveToggle(course);
              break;
          }
        };

        return (
          <div className="flex gap-2 justify-end pr-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Course Actions"
                onAction={handleActionSelection}
              >
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
                {/* <DropdownItem
                  key="activate"
                  startContent={
                    course.isActive ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )
                  }
                >
                  {course.isActive ? "Deactivate" : "Activate"}
                </DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      },
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
          </div>{" "}
          {/* Credit info */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Course Information
            </h4>
            <p className="text-gray-600">Credit: {course.credit}</p>
            <p className="text-gray-600">
              Minimum Credit Required: {course.minCreditRequired || 0}
            </p>
            <p className="text-gray-600">
              Practice Period: {course.practicePeriod}
            </p>
            <p className="text-gray-600">
              Theory Period: {course.theoryPeriod}
            </p>
          </div>
          {/* Parallel Courses */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Parallel Courses
            </h4>
            {course.parallelCourseIds && course.parallelCourseIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {course.parallelCourseIds.map((courseId) => (
                  <span
                    key={courseId}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    {courseId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No parallel courses</p>
            )}
          </div>
          {/* Pre Courses */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Pre Courses</h4>
            {course.preCourseIds && course.preCourseIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {course.preCourseIds.map((courseId) => (
                  <span
                    key={courseId}
                    className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                  >
                    {courseId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No prerequisite courses</p>
            )}
          </div>
          {/* Course Certificates */}
          {/* <div>
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
          </div> */}
          {/* Course Materials */}
          {/* <div>
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
          </div> */}
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
      <Table isHeaderSticky isStriped aria-label="Courses Table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? styles.sortableHeader : ""} ${column.sortable && sortKey === column.key ? "cursor-pointer text-primary" : "cursor-pointer"}`}
              onClick={() => column.sortable && onSort?.(column.key)}
            >
              <div className="flex items-center">
                {column.title} {column.sortable && renderSortIcon(column.key)}
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
      </Table>
    </div>
  );
};
