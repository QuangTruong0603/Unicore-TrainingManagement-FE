import React, { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";

import { CourseQuery } from "@/services/course/course.schema";
import { Major } from "@/services/major/major.schema";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";

interface CourseFilterProps {
  query: CourseQuery;
  majors: Major[];
  onFilterChange: (newQuery: CourseQuery) => void;
  onFilterClear: () => void;
}

export function CourseFilter({
  query,
  majors,
  onFilterChange,
  onFilterClear,
}: CourseFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch all courses for the dropdowns
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        // Use a larger page size to get most courses in one request
        const response = await courseService.getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        });

        setCourses(response.data.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch courses", error);
      }
    };

    fetchAllCourses();
  }, []);
  // Immediate filter handler

  const handleMajorChange = (selectedKey: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        majorIds: selectedKey ? [selectedKey] : undefined,
      },
    });
  };

  const handleOpenForAllChange = (isOpenForAll: string) => {
    const openValue =
      isOpenForAll === "all" ? undefined : isOpenForAll === "true";

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        isOpenForAll: openValue,
      },
    });
  };

  const handlePreCourseChange = (
    key: string | null,
    action: "add" | "remove",
    courseId?: string
  ) => {
    const currentIds = query.filters?.preCourseIds || [];
    let newIds: string[];

    if (action === "add" && key && !currentIds.includes(key)) {
      newIds = [...currentIds, key];
    } else if (action === "remove" && courseId) {
      newIds = currentIds.filter((id) => id !== courseId);
    } else {
      return;
    }

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        preCourseIds: newIds.length > 0 ? newIds : undefined,
      },
    });
  };

  const handleParallelCourseChange = (
    key: string | null,
    action: "add" | "remove",
    courseId?: string
  ) => {
    const currentIds = query.filters?.parallelCourseIds || [];
    let newIds: string[];

    if (action === "add" && key && !currentIds.includes(key)) {
      newIds = [...currentIds, key];
    } else if (action === "remove" && courseId) {
      newIds = currentIds.filter((id) => id !== courseId);
    } else {
      return;
    }

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: {
        ...query.filters,
        parallelCourseIds: newIds.length > 0 ? newIds : undefined,
      },
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      query.filters?.creditRange ||
      query.filters?.majorIds?.length ||
      query.filters?.isActive !== undefined ||
      query.filters?.isRequired !== undefined ||
      query.filters?.isOpenForAll !== undefined ||
      query.filters?.preCourseIds?.length ||
      query.filters?.parallelCourseIds?.length
    );
  };
  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.filters?.creditRange) count++;
    if (query.filters?.majorIds?.length) count++;
    if (query.filters?.isActive !== undefined) count++;
    if (query.filters?.isRequired !== undefined) count++;
    if (query.filters?.isOpenForAll !== undefined) count++;
    if (query.filters?.preCourseIds?.length) count++;
    if (query.filters?.parallelCourseIds?.length) count++;

    return count;
  };

  // Clear all filters
  const handleClearAll = () => {
    onFilterClear();
    setIsFilterOpen(false);
  };

  const selectedMajorId = query.filters?.majorIds?.[0] || "";
  const isOpenForAll = query.filters?.isOpenForAll;
  const preCourseIds = query.filters?.preCourseIds || [];
  const parallelCourseIds = query.filters?.parallelCourseIds || [];

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
            color={hasActiveFilters() ? "primary" : "default"}
            variant={hasActiveFilters() ? "solid" : "bordered"}
          >
            <Filter size={16} />
            <span>
              Filters {hasActiveFilters() && `(${getActiveFiltersCount()})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Courses</h3>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setIsFilterOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-4 max-h-96">
              {/* Major Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="major-autocomplete"
                >
                  Major
                </label>
                <Autocomplete
                  allowsCustomValue={false}
                  className="w-full"
                  defaultItems={majors}
                  id="major-autocomplete"
                  placeholder="Search and select major"
                  selectedKey={selectedMajorId || null}
                  onSelectionChange={(key) => {
                    handleMajorChange(key?.toString() || "");
                  }}
                >
                  {(major) => (
                    <AutocompleteItem
                      key={major.id}
                      textValue={`${major.name} (${major.code})`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {major.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {major.code}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Open For All */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="open-for-all-button"
                >
                  Open For All Majors
                </label>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    color={isOpenForAll === true ? "primary" : "default"}
                    id="open-for-all-button"
                    size="sm"
                    variant={isOpenForAll === true ? "solid" : "bordered"}
                    onPress={() =>
                      handleOpenForAllChange(
                        isOpenForAll === true ? "all" : "true"
                      )
                    }
                  >
                    Open For All
                  </Button>
                  <Button
                    className="flex-1"
                    color={isOpenForAll === false ? "primary" : "default"}
                    size="sm"
                    variant={isOpenForAll === false ? "solid" : "bordered"}
                    onPress={() =>
                      handleOpenForAllChange(
                        isOpenForAll === false ? "all" : "false"
                      )
                    }
                  >
                    Major Specific
                  </Button>
                </div>
              </div>

              {/* Prerequisite Courses */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="prerequisite-autocomplete"
                >
                  Prerequisite Courses
                </label>
                {preCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {preCourseIds.map((courseId) => {
                      const selectedCourse = courses.find(
                        (c) => c.id === courseId
                      );

                      return (
                        selectedCourse && (
                          <Chip
                            key={courseId}
                            className="bg-primary-100 text-primary-700"
                            size="sm"
                            onClose={() =>
                              handlePreCourseChange(null, "remove", courseId)
                            }
                          >
                            {selectedCourse.code}
                          </Chip>
                        )
                      );
                    })}
                  </div>
                )}
                <Autocomplete
                  allowsCustomValue={false}
                  className="w-full"
                  defaultItems={courses.filter(
                    (c) => !preCourseIds.includes(c.id)
                  )}
                  id="prerequisite-autocomplete"
                  placeholder="Search and select prerequisite courses"
                  onSelectionChange={(key) => {
                    if (key) {
                      handlePreCourseChange(key.toString(), "add");
                    }
                  }}
                >
                  {(course) => (
                    <AutocompleteItem
                      key={course.id}
                      textValue={`${course.code} - ${course.name}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {course.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.code}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Parallel Courses */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="parallel-autocomplete"
                >
                  Parallel Courses
                </label>
                {parallelCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {parallelCourseIds.map((courseId) => {
                      const selectedCourse = courses.find(
                        (c) => c.id === courseId
                      );

                      return (
                        selectedCourse && (
                          <Chip
                            key={courseId}
                            className="bg-primary-100 text-primary-700"
                            size="sm"
                            onClose={() =>
                              handleParallelCourseChange(
                                null,
                                "remove",
                                courseId
                              )
                            }
                          >
                            {selectedCourse.code}
                          </Chip>
                        )
                      );
                    })}
                  </div>
                )}
                <Autocomplete
                  allowsCustomValue={false}
                  className="w-full"
                  defaultItems={courses.filter(
                    (c) => !parallelCourseIds.includes(c.id)
                  )}
                  id="parallel-autocomplete"
                  placeholder="Search and select parallel courses"
                  onSelectionChange={(key) => {
                    if (key) {
                      handleParallelCourseChange(key.toString(), "add");
                    }
                  }}
                >
                  {(course) => (
                    <AutocompleteItem
                      key={course.id}
                      textValue={`${course.code} - ${course.name}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {course.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.code}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
            </div>
            {/* Footer */}
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
