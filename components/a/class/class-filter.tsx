import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
} from "@heroui/react";

import { AcademicClassQuery } from "@/services/class/class.schema";
import { Course } from "@/services/course/course.schema";
import { Semester } from "@/services/semester/semester.schema";
import { Shift } from "@/services/shift/shift.schema";
import { courseService } from "@/services/course/course.service";
import { semesterService } from "@/services/semester/semester.service";
import { shiftService } from "@/services/shift/shift.service";

interface ClassFilterProps {
  query: AcademicClassQuery;
  onFilterChange: (newQuery: AcademicClassQuery) => void;
  onFilterClear: () => void;
}

export function ClassFilter({
  query,
  onFilterChange,
  onFilterClear,
}: ClassFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [courseSearchValue, setCourseSearchValue] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const courseResponse = await courseService.getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        });

        setCourses(courseResponse.data.data);

        // Fetch semesters
        const semesterResponse = await semesterService.getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "year",
          isDesc: true,
        });

        setSemesters(semesterResponse.data.data);

        // Fetch shifts
        const shiftsResponse = await shiftService.getAllShifts();

        setShifts(shiftsResponse.data);
      } catch {
        // Handle errors silently
      }
    };

    fetchData();
  }, []);

  // Get display value for selected course
  const getSelectedCourseDisplay = () => {
    if (!query.filters?.courseId) return "";

    const selectedCourse = courses.find(
      (course) => course.id === query.filters?.courseId
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

  const handleShiftChange = (shiftId: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        shiftId: shiftId === "all" ? undefined : shiftId,
      },
    });
  };

  const handleMinCapacityChange = (value: string) => {
    const minCapacity = value ? parseInt(value, 10) : undefined;

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        minCapacity,
      },
    });
  };

  const handleMaxCapacityChange = (value: string) => {
    const maxCapacity = value ? parseInt(value, 10) : undefined;

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        maxCapacity,
      },
    });
  };
  const handleRegistrableChange = (isRegistrable: string) => {
    const registrableValue =
      isRegistrable === "all" ? undefined : isRegistrable === "true";

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        isRegistrable: registrableValue,
      },
    });
  };
  const hasActiveFilters = () => {
    return (
      query.filters?.groupNumber !== undefined ||
      query.filters?.courseId ||
      query.filters?.semesterId ||
      query.filters?.shiftId ||
      query.filters?.minCapacity !== undefined ||
      query.filters?.maxCapacity !== undefined ||
      query.filters?.isRegistrable !== undefined
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.filters?.groupNumber !== undefined) count++;
    if (query.filters?.courseId) count++;
    if (query.filters?.semesterId) count++;
    if (query.filters?.shiftId) count++;
    if (query.filters?.minCapacity !== undefined) count++;
    if (query.filters?.maxCapacity !== undefined) count++;
    if (query.filters?.isRegistrable !== undefined) count++;

    return count;
  };

  const handleClearAll = () => {
    setCourseSearchValue("");
    onFilterClear();
    setIsFilterOpen(false);
  };

  const registrableOptions = [
    { key: "all", label: "All Status" },
    { key: "true", label: "Open" },
    { key: "false", label: "Closed" },
  ];

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
            <div className="text-small font-bold mb-3">Filter Classes</div>

            <div className="space-y-4">
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

              {/* Shift Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Shift</div>
                <Select
                  items={[
                    {
                      id: "all",
                      name: "All Shifts",
                      startTime: "",
                      endTime: "",
                    },
                    ...shifts,
                  ]}
                  placeholder="Select shift"
                  selectedKeys={
                    query.filters?.shiftId ? [query.filters.shiftId] : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleShiftChange(selectedKey);
                  }}
                >
                  {(shift) => (
                    <SelectItem key={shift.id}>
                      {shift.id === "all"
                        ? "All Shifts"
                        : `${shift.name} (${shift.startTime.substring(0, 5)} - ${shift.endTime.substring(0, 5)})`}
                    </SelectItem>
                  )}
                </Select>
              </div>

              {/* Capacity Range */}
              <div>
                <div className="text-sm font-medium mb-2">Capacity Range</div>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Min"
                    size="sm"
                    type="number"
                    value={query.filters?.minCapacity?.toString() || ""}
                    onChange={(e) => handleMinCapacityChange(e.target.value)}
                  />
                  <span className="text-sm">to</span>
                  <Input
                    className="flex-1"
                    placeholder="Max"
                    size="sm"
                    type="number"
                    value={query.filters?.maxCapacity?.toString() || ""}
                    onChange={(e) => handleMaxCapacityChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Registration Status */}
              <div>
                <div className="text-sm font-medium mb-2">
                  Registration Status
                </div>
                <Select
                  placeholder="Select status"
                  selectedKeys={
                    query.filters?.isRegistrable !== undefined
                      ? [query.filters.isRegistrable.toString()]
                      : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleRegistrableChange(selectedKey);
                  }}
                >
                  {registrableOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
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
