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
  selectedClasses: string[];
  onSelectedClassesChange: (selectedClasses: string[]) => void;
  allowMultiSelect?: boolean;
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
  selectedClasses,
  onSelectedClassesChange,
  allowMultiSelect,
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
        <div
          className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
          title={academicClass.name}
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
      key: "schedule",
      title: "Schedule",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        if (
          !academicClass.scheduleInDays ||
          academicClass.scheduleInDays.length === 0
        ) {
          return <span className="text-gray-500 text-xs">No schedule</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[300px]">
            {academicClass.scheduleInDays.map(
              (schedule: any, index: number) => (
                <span
                  key={`${schedule.id || index}`}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {`${schedule.shift.name} ${schedule.dayOfWeek} ${schedule.room.name}`}
                </span>
              )
            )}
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
                  {true ? "Deactivate" : "Activate"}
                </DropdownItem>
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
        }}
        selectionMode="none"
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? "cursor-pointer" : ""}`}
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
