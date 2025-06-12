import React, { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  DatePicker,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Filter, X } from "lucide-react";
import { parseDate, CalendarDate } from "@internationalized/date";

import { Course } from "@/services/course/course.schema";
import { Semester } from "@/services/semester/semester.schema";

interface EnrollmentFilterProps {
  courses: Course[];
  semesters: Semester[];
  query: any;
  onFilterChange: (newQuery: any) => void;
  onFilterClear: () => void;
}

export function EnrollmentFilter({
  courses,
  semesters,
  query,
  onFilterChange,
  onFilterClear,
}: EnrollmentFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleStatusChange = (status: string) => {
    const statusValue = status === "all" ? undefined : parseInt(status);

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        status: statusValue,
      },
    });
  };

  const handleCourseChange = (courseId: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        courseId: courseId === "all" ? undefined : courseId,
      },
    });
  };

  const handleSemesterChange = (semesterId: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        semesterId: semesterId === "all" ? undefined : semesterId,
      },
    });
  };

  const handleFromDateChange = (date: CalendarDate | null) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        fromDate: date
          ? new Date(date.year, date.month - 1, date.day)
          : undefined,
      },
    });
  };

  const handleToDateChange = (date: CalendarDate | null) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        toDate: date
          ? new Date(date.year, date.month - 1, date.day)
          : undefined,
      },
    });
  };

  const statusOptions = [
    { key: "all", label: "All Statuses" },
    { key: "0", label: "Pending" },
    { key: "1", label: "Enrolled" },
    { key: "2", label: "Dropped" },
    { key: "3", label: "Completed" },
  ];

  const hasActiveFilters = () => {
    return (
      query.filters?.status !== undefined ||
      query.filters?.courseId ||
      query.filters?.semesterId ||
      query.filters?.fromDate ||
      query.filters?.toDate
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        isOpen={isFilterOpen}
        placement="bottom-end"
        onOpenChange={setIsFilterOpen}
      >
        <PopoverTrigger>
          <Button
            color={hasActiveFilters() ? "primary" : "default"}
            startContent={<Filter size={16} />}
            variant={hasActiveFilters() ? "solid" : "bordered"}
          >
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="px-1 py-2">
            <div className="text-small font-bold mb-3">Filter Enrollments</div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Status</div>
                <Select
                  placeholder="Select status"
                  selectedKeys={
                    query.filters?.status !== undefined
                      ? [query.filters.status.toString()]
                      : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleStatusChange(selectedKey);
                  }}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {/* Course Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Course</div>
                <Select
                  items={[
                    { id: "all", code: "All", name: "Courses" },
                    ...courses,
                  ]}
                  placeholder="Select course"
                  selectedKeys={
                    query.filters?.courseId ? [query.filters.courseId] : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleCourseChange(selectedKey);
                  }}
                >
                  {(course) => (
                    <SelectItem key={course.id}>
                      {course.id === "all"
                        ? "All Courses"
                        : `${course.code} - ${course.name}`}
                    </SelectItem>
                  )}
                </Select>
              </div>

              {/* Semester Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Semester</div>
                <Select
                  items={[
                    { id: "all", semesterNumber: 0, year: 0 },
                    ...semesters,
                  ]}
                  placeholder="Select semester"
                  selectedKeys={
                    query.filters?.semesterId
                      ? [query.filters.semesterId]
                      : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleSemesterChange(selectedKey);
                  }}
                >
                  {(semester) => (
                    <SelectItem key={semester.id}>
                      {semester.id === "all"
                        ? "All Semesters"
                        : `Semester ${semester.semesterNumber}/${semester.year}`}
                    </SelectItem>
                  )}
                </Select>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium mb-2">From Date</div>
                  <DatePicker
                    value={
                      query.filters?.fromDate
                        ? parseDate(
                            query.filters.fromDate.toISOString().split("T")[0]
                          )
                        : null
                    }
                    onChange={handleFromDateChange}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">To Date</div>
                  <DatePicker
                    value={
                      query.filters?.toDate
                        ? parseDate(
                            query.filters.toDate.toISOString().split("T")[0]
                          )
                        : null
                    }
                    onChange={handleToDateChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button size="sm" variant="flat" onPress={onFilterClear}>
                Clear All
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => setIsFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters() && (
        <Button
          isIconOnly
          color="danger"
          size="sm"
          variant="light"
          onPress={onFilterClear}
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
