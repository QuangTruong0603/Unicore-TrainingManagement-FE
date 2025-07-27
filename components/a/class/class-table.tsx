import React from "react";
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash,
  Power,
  Edit,
  CheckCheck,
  X,
  Move,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./class-table.module.scss";

import { AcademicClass } from "@/services/class/class.schema";
import { useLecturerById } from "@/services/lecturer/lecturer.hooks";

// Lecturer cell component that fetches lecturer data
const LecturerCell: React.FC<{ lecturerId?: string }> = ({ lecturerId }) => {
  const isInvalidLecturerId = !lecturerId || lecturerId.includes("000000");

  if (isInvalidLecturerId) {
    return <span className="text-xs text-gray-400 italic">Not assigned</span>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: lecturerResponse, isLoading } = useLecturerById(lecturerId);
  const lecturer = lecturerResponse?.data;

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading...</span>;
  }

  if (!lecturer) {
    return <span className="text-xs text-gray-400 italic">Not assigned</span>;
  }

  return (
    <div className={styles.lecturerCell}>
      <Tooltip
        content={`${(lecturer as any).firstName} ${(lecturer as any).lastName} (${lecturer.lecturerCode})`}
      >
        <span className="text-sm text-gray-700 cursor-help">
          {`${(lecturer as any).firstName} ${(lecturer as any).lastName}`}
        </span>
      </Tooltip>
    </div>
  );
};

interface ClassTableProps {
  classes: AcademicClass[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (classId: string) => void;
  onRegistrationToggle: (academicClass: AcademicClass) => void;
  onDeleteClass?: (academicClass: AcademicClass) => void;
  onToggleActivation?: (academicClass: AcademicClass) => void;
  onUpdateClass?: (academicClass: AcademicClass) => void;
  onApproveAllEnrollments?: (academicClass: AcademicClass) => void;
  onRejectAllEnrollments?: (academicClass: AcademicClass) => void;
  onMoveEnrollments?: (academicClass: AcademicClass) => void;
  selectedClasses: string[];
  onSelectedClassesChange: (selectedClasses: string[]) => void;
  allowMultiSelect?: boolean;
  isScorePage?: boolean;
  onClassNameClick?: (academicClass: AcademicClass) => void;
}

interface Column {
  key: string;
  title: string | React.ReactNode;
  sortable?: boolean;
  render: (academicClass: AcademicClass) => React.ReactNode;
}

export const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  isLoading = false,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onRegistrationToggle,
  onDeleteClass,
  onToggleActivation,
  onUpdateClass,
  onApproveAllEnrollments,
  onRejectAllEnrollments,
  onMoveEnrollments,
  selectedClasses,
  onSelectedClassesChange,
  allowMultiSelect,
  isScorePage = false,
  onClassNameClick,
}) => {
  // Safety check: Ensure classes is an array
  const safeClasses = Array.isArray(classes) ? classes : [];

  const handleSelectionChange = (classId: string, isChecked: boolean) => {
    if (isChecked) {
      onSelectedClassesChange([...selectedClasses, classId]);
    } else {
      onSelectedClassesChange(selectedClasses.filter((id) => id !== classId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onSelectedClassesChange(safeClasses.map((c) => c.id));
    } else {
      onSelectedClassesChange([]);
    }
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
    // Selection column (only visible if allowMultiSelect is true)
    ...(allowMultiSelect
      ? [
          {
            key: "select",
            title: (
              <Checkbox
                isIndeterminate={
                  selectedClasses.length > 0 &&
                  selectedClasses.length < safeClasses.length
                }
                isSelected={
                  selectedClasses.length === safeClasses.length &&
                  safeClasses.length > 0
                }
                onValueChange={handleSelectAll}
              />
            ),
            sortable: false,
            render: (academicClass: AcademicClass) => (
              <Checkbox
                isSelected={selectedClasses.includes(academicClass.id)}
                onValueChange={(isChecked) =>
                  handleSelectionChange(academicClass.id, isChecked)
                }
              />
            ),
          },
        ]
      : []),
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (academicClass: AcademicClass) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={`max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis ${isScorePage ? "text-primary cursor-pointer font-semibold" : ""}`}
          title={academicClass.name}
          onClick={
            isScorePage && onClassNameClick
              ? () => onClassNameClick(academicClass)
              : undefined
          }
          {...(isScorePage && onClassNameClick
            ? {
                role: "button",
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onClassNameClick(academicClass);
                  }
                },
              }
            : {})}
        >
          {academicClass.name}
        </div>
      ),
    },
    {
      key: "groupName",
      title: "Group",
      sortable: true,
      render: (academicClass: AcademicClass) => academicClass.groupNumber,
    },
    {
      key: "enrollment",
      title: "Enrollment",
      sortable: true,
      render: (academicClass: AcademicClass) => (
        <div className="text-center">
          <span className="text-sm font-medium">
            {academicClass.enrollmentCount} / {academicClass.capacity}
          </span>
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  academicClass.enrollmentCount >= academicClass.capacity
                    ? "bg-red-500"
                    : academicClass.enrollmentCount / academicClass.capacity >
                        0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    (academicClass.enrollmentCount / academicClass.capacity) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      title: "Course",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <div className="max-w-[250px] w-full overflow-hidden">
          <Tooltip content={academicClass.course.name}>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs cursor-help">
              {academicClass.course.code}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "lecturer",
      title: "Lecturer",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <LecturerCell lecturerId={academicClass.lecturerId} />
      ),
    },
    {
      key: "type",
      title: "Type",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {academicClass.parentTheoryAcademicClassId ? "Practice" : "Theory"}
        </span>
      ),
    },
    {
      key: "semester",
      title: "Semester",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {`${academicClass.semester.semesterNumber}/${academicClass.semester.year}`}
        </span>
      ),
    },
    {
      key: "room",
      title: "Room",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        if (!academicClass.scheduleInDays || academicClass.scheduleInDays.length === 0) {
          return <span className="text-xs text-gray-400 italic">Not assigned</span>;
        }
        
        const rooms = academicClass.scheduleInDays.map((schedule: any) => schedule.room.name);
        const uniqueRooms = [...new Set(rooms)];
        
        return (
          <div className="max-w-[120px]">
            <Tooltip content={uniqueRooms.join(", ")}>
              <span className="text-xs text-gray-700 cursor-help">
                {uniqueRooms.length > 1 ? `${uniqueRooms[0]}...` : uniqueRooms[0]}
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "schedule",
      title: "Schedule",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        if (!academicClass.scheduleInDays || academicClass.scheduleInDays.length === 0) {
          return <span className="text-xs text-gray-400 italic">Not scheduled</span>;
        }
        
        const schedules = academicClass.scheduleInDays.map((schedule: any) => 
          `${schedule.dayOfWeek}: ${schedule.shift.startTime.substring(0, 5)}-${schedule.shift.endTime.substring(0, 5)}`
        );
        
        return (
          <div className="max-w-[150px]">
            <Tooltip content={
              <div className="space-y-1">
                {schedules.map((sched, index) => (
                  <div key={index} className="text-xs">{sched}</div>
                ))}
              </div>
            }>
              <div className="text-xs text-gray-700 cursor-help">
                {schedules.length > 1 ? (
                  <div>
                    <div>{schedules[0]}</div>
                    <div className="text-gray-400">+{schedules.length - 1} more</div>
                  </div>
                ) : (
                  schedules[0]
                )}
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "enrollmentStatus",
      title: "Enrollment Status",
      sortable: true,
      render: (academicClass: AcademicClass) => {
        const getEnrollmentStatusLabel = (status?: number) => {
          switch (status) {
            case 1:
              return {
                label: "Pending",
                color: "bg-gray-100 text-gray-600",
              };
            case 2:
              return {
                label: "Approved",
                color: "bg-yellow-100 text-yellow-800",
              };
            case 3:
              return {
                label: "Started",
                color: "bg-orange-100 text-orange-800",
              };
            case 4:
              return {
                label: "Passed",
                color: "bg-green-100 text-green-800",
              };
            case 5:
              return {
                label: "Failed",
                color: "bg-red-100 text-red-800",
              };
            case 6:
              return {
                label: "Rejected",
                color: "bg-purple-100 text-purple-800",
              };
            default:
              return {
                label: "Not Enrolled",
                color: "bg-gray-100 text-gray-600",
              };
          }
        };

        const statusInfo = getEnrollmentStatusLabel(
          academicClass.enrollmentStatus
        );

        return (
          <div
            className={`px-2 py-1 rounded-full text-xs text-center ${statusInfo.color}`}
          >
            {statusInfo.label}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (academicClass: AcademicClass) => (
        <div
          className={`px-2 py-1 rounded-full text-xs text-center ${
            academicClass.isRegistrable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {academicClass.isRegistrable ? "Open" : "Closed"}
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Is Active",
      sortable: true,
      render: (_academicClass: AcademicClass) => (
        <div
          className={`px-2 py-1 rounded-full text-xs text-center ${
            true // Assuming all classes shown are active, update with actual field if available
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {"Active"}
        </div>
      ),
    },
    ...(!isScorePage
      ? [
          {
            key: "actions",
            title: "Actions",
            sortable: false,
            render: (academicClass: AcademicClass) => {
              const handleActionSelection = (key: React.Key) => {
                switch (key) {
                  case "update":
                    if (onUpdateClass) onUpdateClass(academicClass);
                    break;
                  case "delete":
                    if (onDeleteClass) onDeleteClass(academicClass);
                    break;
                  case "activate":
                    if (onToggleActivation) onToggleActivation(academicClass);
                    break;
                  case "registration":
                    onRegistrationToggle(academicClass);
                    break;
                  case "approveEnrollments":
                    if (onApproveAllEnrollments)
                      onApproveAllEnrollments(academicClass);
                    break;
                  case "rejectEnrollments":
                    if (onRejectAllEnrollments)
                      onRejectAllEnrollments(academicClass);
                    break;
                  case "moveEnrollments":
                    if (onMoveEnrollments) onMoveEnrollments(academicClass);
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
                      aria-label="Class Actions"
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
                      <DropdownItem
                        key="activate"
                        startContent={<Power className="w-4 h-4" />}
                      >
                        {" "}
                        {academicClass.isActive ? "Deactivate" : "Activate"}
                      </DropdownItem>
                      {!academicClass.isRegistrable &&
                      academicClass.enrollmentStatus !== 3 &&
                      academicClass.enrollmentStatus !== 4 &&
                      academicClass.enrollmentStatus !== 5 &&
                      academicClass.enrollmentStatus !== undefined ? (
                        <>
                          <DropdownItem
                            key="approveEnrollments"
                            startContent={<CheckCheck className="w-4 h-4" />}
                          >
                            Approve all enrollment
                          </DropdownItem>
                          <DropdownItem
                            key="rejectEnrollments"
                            startContent={<X className="w-4 h-4" />}
                          >
                            Reject all enrollment
                          </DropdownItem>
                          <DropdownItem
                            key="moveEnrollments"
                            startContent={<Move className="w-4 h-4" />}
                          >
                            Move Enrollments
                          </DropdownItem>
                        </>
                      ) : null}
                    </DropdownMenu>
                  </Dropdown>
                  <Tooltip content="Toggle details">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowToggle(academicClass.id);
                      }}
                    >
                      {expandedRows[academicClass.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Expanded detail view for a class
  const renderExpandedDetails = (academicClass: AcademicClass) => {
    return (
      <div className="p-4 bg-gray-50 border-t">
        <h3 className="font-medium mb-2">Class Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Course Info</h4>
            <p className="text-sm">
              <span className="font-medium">Code:</span>{" "}
              {academicClass.course.code}
            </p>
            <p className="text-sm">
              <span className="font-medium">Name:</span>{" "}
              {academicClass.course.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Credits:</span>{" "}
              {academicClass.course.credit}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Schedule</h4>
            {academicClass.scheduleInDays &&
            academicClass.scheduleInDays.length > 0 ? (
              <div className="space-y-1 mt-1">
                {academicClass.scheduleInDays.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="bg-white p-1.5 rounded border text-xs"
                  >
                    <p>
                      <span className="font-medium">Day:</span>{" "}
                      {schedule.dayOfWeek}
                    </p>
                    <p>
                      <span className="font-medium">Room:</span>{" "}
                      {schedule.room.name}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {`${schedule.shift.startTime.substring(0, 5)} - ${schedule.shift.endTime.substring(0, 5)}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No schedule assigned</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Additional Info
            </h4>
            <p className="text-sm">
              <span className="font-medium">Weeks:</span>{" "}
              {academicClass.listOfWeeks.join(", ")}
            </p>
            <p className="text-sm">
              <span className="font-medium">Semester:</span>{" "}
              {`${academicClass.semester.semesterNumber}/${academicClass.semester.year}`}
            </p>
            {academicClass.minEnrollmentRequired && (
              <p className="text-sm">
                <span className="font-medium">Min Enrollment:</span>{" "}
                {academicClass.minEnrollmentRequired}
              </p>
            )}
            {academicClass.registrationOpenTime && (
              <p className="text-sm">
                <span className="font-medium">Registration Opens:</span>{" "}
                {new Date(academicClass.registrationOpenTime).toLocaleString()}
              </p>
            )}
            {academicClass.registrationCloseTime && (
              <p className="text-sm">
                <span className="font-medium">Registration Closes:</span>{" "}
                {new Date(academicClass.registrationCloseTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.tableWrapper}>
      <Table
        isHeaderSticky
        isStriped
        aria-label="Classes table"
        classNames={{
          base: "min-h-[400px]",
          table: "min-w-[1200px]", // Ensure minimum width for horizontal scrolling
        }}
        selectionMode="none"
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? "cursor-pointer" : ""} ${column.sortable && sortKey === column.key ? "text-primary" : ""}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center">
                {column.title}
                {column.sortable && renderSortIcon(column.key)}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          emptyContent={"No classes found"}
          isLoading={isLoading}
          loadingContent={"Loading classes..."}
        >
          {safeClasses.map((academicClass) => (
            <React.Fragment key={academicClass.id}>
              <TableRow key={academicClass.id}>
                {columns.map((column) => (
                  <TableCell key={`${academicClass.id}-${column.key}`}>
                    {column.render(academicClass)}
                  </TableCell>
                ))}
              </TableRow>
              {expandedRows[academicClass.id] && (
                <TableRow>
                  <TableCell className="p-0" colSpan={columns.length}>
                    {renderExpandedDetails(academicClass)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
