import React, { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  DatePicker,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Filter } from "lucide-react";
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
  const [courseSearchValue, setCourseSearchValue] = useState("");

  // Get display value for selected course
  const getSelectedCourseDisplay = () => {
    if (!query.filters?.courseId) return "";

    const selectedCourse = courses.find(
      (course) => course.id === query.filters.courseId
    );

    return selectedCourse
      ? `${selectedCourse.code} - ${selectedCourse.name}`
      : "";
  };

  // Filter courses based on search input
  const filteredCourses = React.useMemo(() => {
    if (!courseSearchValue) return courses;

    return courses.filter(
      (course) =>
        course.code.toLowerCase().includes(courseSearchValue.toLowerCase()) ||
        course.name.toLowerCase().includes(courseSearchValue.toLowerCase())
    );
  }, [courses, courseSearchValue]);

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
        courseId: courseId === "all" || !courseId ? undefined : courseId,
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
          ? new Date(date.year, date.month - 1, date.day, 12, 0, 0)
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
          ? new Date(date.year, date.month - 1, date.day, 12, 0, 0)
          : undefined,
      },
    });
  };

  const statusOptions = [
    { key: "all", label: "All Statuses" },
    { key: "1", label: "Pending" },
    { key: "2", label: "Approved" },
    { key: "3", label: "Started" },
    { key: "4", label: "Passed" },
    { key: "5", label: "Failed" },
    { key: "6", label: "Rejected" },
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
  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.filters?.status !== undefined) count++;
    if (query.filters?.courseId) count++;
    if (query.filters?.semesterId) count++;
    if (query.filters?.fromDate) count++;
    if (query.filters?.toDate) count++;

    return count;
  };
  const handleClearAll = () => {
    setCourseSearchValue("");
    onFilterClear();
    setIsFilterOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
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
            Filter {hasActiveFilters() && `(${getActiveFiltersCount()})`}
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
                <Autocomplete
                  allowsCustomValue
                  className="w-full"
                  inputValue={courseSearchValue || getSelectedCourseDisplay()}
                  items={filteredCourses}
                  placeholder="Search for a course..."
                  selectedKey={query.filters?.courseId || null}
                  onInputChange={(value) => setCourseSearchValue(value)}
                  onSelectionChange={(key) => {
                    const selectedKey = key as string;

                    handleCourseChange(selectedKey);
                    setCourseSearchValue("");
                  }}
                >
                  {(course) => (
                    <AutocompleteItem key={course.id}>
                      {`${course.code} - ${course.name}`}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
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
                            `${query.filters.fromDate.getFullYear()}-${String(
                              query.filters.fromDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              query.filters.fromDate.getDate()
                            ).padStart(2, "0")}`
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
                            `${query.filters.toDate.getFullYear()}-${String(
                              query.filters.toDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              query.filters.toDate.getDate()
                            ).padStart(2, "0")}`
                          )
                        : null
                    }
                    onChange={handleToDateChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button color="primary" size="sm" onPress={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
