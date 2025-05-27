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
  Clock,
  Calendar,
  MoreVertical,
  Trash,
  Power,
  Lock,
  Unlock,
} from "lucide-react";
import {
  Table as HeroTable,
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
}

interface Column {
  key: string;
  title: string;
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
      key: "course",
      title: "Course",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <div className="max-w-[250px] w-full overflow-hidden">
          <Tooltip content={academicClass.course.name}>
            <span className="bg-blue-100 text-primary px-2 py-1 rounded-full text-xs cursor-help">
              {academicClass.course.code}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "semester",
      title: "Semester",
      sortable: false,
      render: (academicClass: AcademicClass) => (
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
          {`${academicClass.semester.semesterNumber}/${academicClass.semester.year}`}
        </span>
      ),
    },
    {
      key: "shift",
      title: "Shift",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        const shifts = academicClass.scheduleInDays.map(
          (schedule) => schedule.shift.name
        );
        const uniqueShifts = Array.from(new Set(shifts));

        return (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" /> {uniqueShifts.join(", ")}
          </div>
        );
      },
    },
    {
      key: "dayOfWeek",
      title: "Day of Week",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        const days = academicClass.scheduleInDays.map(
          (schedule) => schedule.dayOfWeek
        );
        const uniqueDays = Array.from(new Set(days));

        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" /> {uniqueDays.join(", ")}
          </div>
        );
      },
    },
    {
      key: "room",
      title: "Room",
      sortable: false,
      render: (academicClass: AcademicClass) => {
        const rooms = academicClass.scheduleInDays.map(
          (schedule) => schedule.room.name
        );
        const uniqueRooms = Array.from(new Set(rooms));

        return (
          <div className="flex items-center">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
              {uniqueRooms.join(", ")}
            </span>
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
                <DropdownItem
                  key="registration"
                  startContent={
                    academicClass.isRegistrable ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )
                  }
                >
                  {academicClass.isRegistrable
                    ? "Close Registration"
                    : "Open Registration"}
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
                {academicClass.scheduleInDays.map((schedule) => (
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
      <HeroTable
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
          {classes.map((academicClass) => (
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
      </HeroTable>
    </div>
  );
};
