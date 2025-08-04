import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
} from "@heroui/react";

import { AcademicClassQuery } from "@/services/class/class.schema";
import { Course } from "@/services/course/course.schema";
import { Semester } from "@/services/semester/semester.schema";
import { courseService } from "@/services/course/course.service";
import { semesterService } from "@/services/semester/semester.service";

interface ClassFilterProps {
  query: AcademicClassQuery;
  onFilterChange: (newQuery: AcademicClassQuery) => void;
  onFilterClear: () => void;
  courses?: Course[];
  semesters?: Semester[];
}

export function ClassFilter({
  query,
  onFilterChange,
  onFilterClear,
  courses: propCourses,
  semesters: propSemesters,
}: ClassFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courseSearchValue, setCourseSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use props if available, otherwise fetch data
  useEffect(() => {
    if (propCourses && propSemesters) {
      // Use props if provided
      setCourses(propCourses);
      setSemesters(propSemesters);

      return;
    }

    // Only fetch if props are not provided
    let isMounted = true;
    let courseRequestCompleted = false;
    let semesterRequestCompleted = false;

    const fetchData = async () => {
      if (isLoading) return; // Prevent multiple simultaneous requests

      setIsLoading(true);
      console.log("Fetching courses and semesters...");

      // Fetch courses and semesters in parallel
      const coursePromise = courseService
        .getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        })
        .then((response) => {
          if (isMounted && !courseRequestCompleted) {
            console.log("Course response:", response);
            setCourses(response.data.data);
            courseRequestCompleted = true;
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Failed to fetch courses:", error);
          }
        });

      const semesterPromise = semesterService
        .getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "year",
          isDesc: true,
        })
        .then((response) => {
          if (isMounted && !semesterRequestCompleted) {
            setSemesters(response.data.data);
            semesterRequestCompleted = true;
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Failed to fetch semesters:", error);
          }
        });

      // Wait for both requests to complete
      await Promise.allSettled([coursePromise, semesterPromise]);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [propCourses, propSemesters]);

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
  const handleEnrollmentStatusChange = (enrollmentStatus: string) => {
    const statusValue =
      enrollmentStatus === "all" ? undefined : parseInt(enrollmentStatus, 10);

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        enrollmentStatus: statusValue,
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
      query.filters?.isRegistrable !== undefined ||
      query.filters?.enrollmentStatus !== undefined
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
    if (query.filters?.enrollmentStatus !== undefined) count++;

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
  const enrollmentStatusOptions = [
    { key: "all", label: "All Status" },
    { key: "1", label: "Pending" },
    { key: "2", label: "Approved" },
    { key: "3", label: "Started" },
    { key: "6", label: "Rejected" },
    { key: "7", label: "Ended" },
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

              {/* Enrollment Status */}
              <div>
                <div className="text-sm font-medium mb-2">
                  Enrollment Status
                </div>
                <Select
                  placeholder="Select enrollment status"
                  selectedKeys={
                    query.filters?.enrollmentStatus !== undefined
                      ? [query.filters.enrollmentStatus.toString()]
                      : ["all"]
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleEnrollmentStatusChange(selectedKey);
                  }}
                >
                  {enrollmentStatusOptions.map((option) => (
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
