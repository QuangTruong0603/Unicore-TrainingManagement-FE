import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";

import { ExamListFilterParams } from "@/services/exam/exam.dto";
import { semesterService } from "@/services/semester/semester.service";
import { classService } from "@/services/class/class.service";
import { courseService } from "@/services/course/course.service";
import { Semester } from "@/services/semester/semester.schema";
import { AcademicClass } from "@/services/class/class.schema";
import { Course } from "@/services/course/course.schema";

interface ExamQuery {
  pageNumber: number;
  itemsPerpage: number;
  orderBy?: string;
  isDesc: boolean;
  filters?: ExamListFilterParams & {
    semesterId?: string;
    courseId?: string;
    academicClassId?: string;
    minExamTime?: Date;
    maxExamTime?: Date;
  };
}

interface ExamFilterProps {
  query: ExamQuery;
  onFilterChange: (newQuery: ExamQuery) => void;
  onFilterClear: () => void;
}

export function ExamFilter({
  query,
  onFilterChange,
  onFilterClear,
}: ExamFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Fetch semesters when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingSemesters(true);

        const semesterResponse = await semesterService.getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          isDesc: false,
          filters: { isActive: true },
        });

        setSemesters(semesterResponse.data.data);
      } catch {
        // Error fetching initial data
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch courses when semester is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedSemesterId) {
        try {
          setIsLoadingCourses(true);
          const courseResponse = await courseService.getCourses({
            pageNumber: 1,
            itemsPerpage: 100,
            isDesc: false,
            orderBy: "name",
          });

          setCourses(courseResponse.data.data);
        } catch {
          // Error fetching courses
        } finally {
          setIsLoadingCourses(false);
        }
      } else {
        setCourses([]);
      }
    };

    fetchCourses();
  }, [selectedSemesterId]);

  // Fetch classes when semester and course are selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedSemesterId && selectedCourseId) {
        try {
          setIsLoadingClasses(true);
          const classResponse = await classService.getClasses({
            pageNumber: 1,
            itemsPerpage: 100,
            isDesc: false,
            orderBy: "name",
            filters: {
              semesterId: selectedSemesterId,
              courseId: selectedCourseId,
            },
          });

          setAcademicClasses(classResponse.data.data);
        } catch {
          // Error fetching classes
        } finally {
          setIsLoadingClasses(false);
        }
      } else {
        setAcademicClasses([]);
      }
    };

    fetchClasses();
  }, [selectedSemesterId, selectedCourseId]); // Sync selectedSemesterId with query filters
  useEffect(() => {
    const queryValue = query.filters?.semesterId || "";

    if (queryValue !== selectedSemesterId) {
      setSelectedSemesterId(queryValue);
    }
  }, [query.filters?.semesterId, selectedSemesterId]);

  // Sync selectedCourseId with query filters
  useEffect(() => {
    const queryValue = query.filters?.courseId || "";

    if (queryValue !== selectedCourseId) {
      setSelectedCourseId(queryValue);
    }
  }, [query.filters?.courseId]);
  const handleSemesterChange = (selectedKey: string) => {
    setSelectedSemesterId(selectedKey);
    setSelectedCourseId(""); // Clear course selection
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        semesterId: selectedKey || undefined,
        // Clear course and class filters when semester changes
        courseId: undefined,
        academicClassId: undefined,
      },
    });
  };

  const handleCourseChange = (selectedKey: string | null) => {
    setSelectedCourseId(selectedKey || "");
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        courseId: selectedKey || undefined,
        // Clear class filter when course changes
        academicClassId: undefined,
      },
    });
  };

  const handleClassChange = (selectedKey: string | null) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        academicClassId: selectedKey || undefined,
      },
    });
  };
  const handleDateRangeChange = (
    field: "minExamTime" | "maxExamTime",
    value: string
  ) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        [field]: value ? new Date(value) : undefined,
      },
    });
  };

  const getActiveFiltersCount = () => {
    const filters = query.filters || {};
    let count = 0;

    if (filters.semesterId) count++;
    if (filters.courseId) count++;
    if (filters.academicClassId) count++;
    if (filters.minExamTime) count++;
    if (filters.maxExamTime) count++;

    return count;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        isOpen={isFilterOpen}
        placement="bottom-start"
        onOpenChange={setIsFilterOpen}
      >
        <PopoverTrigger>
          <Button
            className="flex items-center gap-1"
            color={getActiveFiltersCount() > 0 ? "primary" : "default"}
            variant={getActiveFiltersCount() > 0 ? "solid" : "bordered"}
          >
            <Filter size={16} />
            <span>
              Filters{" "}
              {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4">
          <div className="space-y-4">
            {" "}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                size="sm"
                startContent={<X size={16} />}
                variant="light"
                onClick={onFilterClear}
              >
                Clear All
              </Button>
            </div>
            {/* Semester Filter */}
            <div>
              <span className="block text-sm font-medium mb-1">Semester</span>{" "}
              <Select
                isLoading={isLoadingSemesters}
                placeholder="Select semester"
                selectedKeys={
                  query.filters?.semesterId ? [query.filters.semesterId] : []
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;

                  handleSemesterChange(selectedKey);
                }}
              >
                {semesters.map((semester) => (
                  <SelectItem key={semester.id}>
                    Semester {semester.semesterNumber} - {semester.year}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {/* Course Filter */}
            <div>
              <span className="block text-sm font-medium mb-1">Course</span>{" "}
              <Autocomplete
                isDisabled={!selectedSemesterId}
                isLoading={isLoadingCourses}
                placeholder="Search and select course"
                selectedKey={
                  selectedCourseId &&
                  courses.some((c) => c.id === selectedCourseId)
                    ? selectedCourseId
                    : null
                }
                onSelectionChange={(key) => handleCourseChange(key as string)}
              >
                {courses.map((course) => (
                  <AutocompleteItem
                    key={course.id}
                    textValue={`${course.name} (${course.code})`}
                  >
                    {course.name} ({course.code})
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              {!selectedSemesterId && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a semester first to load courses
                </p>
              )}
            </div>
            {/* Academic Class Filter */}
            <div>
              <span className="block text-sm font-medium mb-1">
                Academic Class
              </span>
              <Autocomplete
                isDisabled={!selectedSemesterId || !selectedCourseId}
                isLoading={isLoadingClasses}
                placeholder="Search and select class"
                selectedKey={query.filters?.academicClassId || null}
                onSelectionChange={(key) => handleClassChange(key as string)}
              >
                {academicClasses.map((cls) => (
                  <AutocompleteItem
                    key={cls.id}
                    textValue={`${cls.name} (Group ${cls.groupNumber})`}
                  >
                    {cls.name} (Group {cls.groupNumber})
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              {(!selectedSemesterId || !selectedCourseId) && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a semester and course first to load classes
                </p>
              )}{" "}
            </div>
            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-sm font-medium mb-1">
                  From Date
                </span>
                <Input
                  type="datetime-local"
                  value={
                    query.filters?.minExamTime
                      ? new Date(query.filters.minExamTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleDateRangeChange("minExamTime", e.target.value)
                  }
                />
              </div>
              <div>
                <span className="block text-sm font-medium mb-1">To Date</span>
                <Input
                  type="datetime-local"
                  value={
                    query.filters?.maxExamTime
                      ? new Date(query.filters.maxExamTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleDateRangeChange("maxExamTime", e.target.value)
                  }
                />{" "}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
