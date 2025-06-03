import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
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

interface FilterState {
  groupName?: number;
  minCapacity?: number;
  maxCapacity?: number;
  isRegistrable?: boolean | null;
  courseId?: string;
  semesterId?: string;
  shiftId?: string;
}

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export function ClassFilter({
  query,
  onFilterChange,
  onFilterClear,
}: ClassFilterProps) {
  // Use useDisclosure for modal control
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [filterState, setFilterState] = useState<FilterState>({
    minCapacity: 0,
    maxCapacity: 100,
    isRegistrable: null,
  });
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Fetch courses and semesters for the dropdowns
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
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
        } catch (error) {
          // Handle errors silently
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Update filter state based on changed fields
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  // Remove a specific filter
  const removeFilter = (id: string) => {
    // Update the query by removing the specific filter
    const newFilters = { ...query.filters };
    const filterKey = id as keyof typeof newFilters;

    if (newFilters && filterKey in newFilters) {
      delete newFilters[filterKey];

      onFilterChange({
        ...query,
        filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
      });
    }

    // Remove the chip from UI
    setFilterChips((prev) => prev.filter((chip) => chip.id !== id));
  };

  // Apply all filters
  const applyFilters = () => {
    const newFilters: any = {};
    let newChips: FilterChip[] = [];

    // Process group name filter
    if (filterState.groupName !== undefined) {
      newFilters.groupName = filterState.groupName;
      newChips.push({
        id: "groupName",
        label: `Group: ${filterState.groupName}`,
        onRemove: () => removeFilter("groupName"),
      });
    }

    // Process capacity range filters
    if (filterState.minCapacity !== undefined && filterState.minCapacity > 0) {
      newFilters.minCapacity = filterState.minCapacity;
      newChips.push({
        id: "minCapacity",
        label: `Min Capacity: ${filterState.minCapacity}`,
        onRemove: () => removeFilter("minCapacity"),
      });
    }

    if (
      filterState.maxCapacity !== undefined &&
      filterState.maxCapacity < 100
    ) {
      newFilters.maxCapacity = filterState.maxCapacity;
      newChips.push({
        id: "maxCapacity",
        label: `Max Capacity: ${filterState.maxCapacity}`,
        onRemove: () => removeFilter("maxCapacity"),
      });
    }

    // Process registration status filter
    if (
      filterState.isRegistrable !== null &&
      filterState.isRegistrable !== undefined
    ) {
      newFilters.isRegistrable = filterState.isRegistrable;
      newChips.push({
        id: "isRegistrable",
        label: `Registration: ${filterState.isRegistrable ? "Open" : "Closed"}`,
        onRemove: () => removeFilter("isRegistrable"),
      });
    }

    // Process course filter
    if (filterState.courseId) {
      newFilters.courseId = filterState.courseId;
      const selectedCourse = courses.find((c) => c.id === filterState.courseId);

      newChips.push({
        id: "courseId",
        label: `Course: ${selectedCourse?.name || filterState.courseId}`,
        onRemove: () => removeFilter("courseId"),
      });
    }

    // Process semester filter
    if (filterState.semesterId) {
      newFilters.semesterId = filterState.semesterId;
      const selectedSemester = semesters.find(
        (s) => s.id === filterState.semesterId
      );

      newChips.push({
        id: "semesterId",
        label: `Semester: ${selectedSemester ? `${selectedSemester.semesterNumber}/${selectedSemester.year}` : filterState.semesterId}`,
        onRemove: () => removeFilter("semesterId"),
      });
    }

    // Process shift filter
    if (filterState.shiftId) {
      newFilters.shiftId = filterState.shiftId;
      const selectedShift = shifts.find((s) => s.id === filterState.shiftId);

      newChips.push({
        id: "shiftId",
        label: `Shift: ${selectedShift?.name || filterState.shiftId}`,
        onRemove: () => removeFilter("shiftId"),
      });
    }

    // Update query with new filters
    onFilterChange({
      ...query,
      filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
    });

    // Update filter chips
    setFilterChips(newChips);

    // Close the modal
    onClose();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState({
      minCapacity: 0,
      maxCapacity: 100,
      isRegistrable: null,
      shiftId: undefined,
    });

    setFilterChips([]);
    onFilterClear();
    onClose();
  };

  // Calculate if any filters are active
  const hasActiveFilters = filterChips.length > 0;

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button
          className="flex items-center gap-1"
          color={hasActiveFilters ? "primary" : "default"}
          variant={hasActiveFilters ? "solid" : "bordered"}
          onPress={onOpen}
        >
          <Filter size={16} />
          <span>Filters {hasActiveFilters && `(${filterChips.length})`}</span>
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="md"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center p-4 border-b">
            <span className="text-lg font-medium">Filter Classes</span>
          </ModalHeader>
          <ModalBody className="py-4 px-4">
            {/* Group Name Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="group-number"
              >
                Group Number
              </label>
              <Input
                aria-label="Group Number"
                className="w-full bg-gray-50"
                id="group-number"
                min={1}
                placeholder="Filter by group number"
                size="sm"
                type="number"
                value={filterState.groupName?.toString() || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined;

                  updateFilter("groupName", value);
                }}
              />
            </div>

            {/* Course Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="course-filter"
              >
                Course
              </label>
              <Autocomplete
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[400px]",
                }}
                defaultItems={courses}
                id="course-filter"
                placeholder="Select a course"
                selectedKey={filterState.courseId}
                onSelectionChange={(key) => updateFilter("courseId", key)}
              >
                {(course) => (
                  <AutocompleteItem key={course.id} textValue={course.name}>
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

            {/* Semester Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="semester-filter"
              >
                Semester
              </label>
              <Autocomplete
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[400px]",
                }}
                defaultItems={semesters}
                id="semester-filter"
                placeholder="Select a semester"
                selectedKey={filterState.semesterId}
                onSelectionChange={(key) => updateFilter("semesterId", key)}
              >
                {(semester) => (
                  <AutocompleteItem
                    key={semester.id}
                    textValue={`${semester.semesterNumber}/${semester.year}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        Semester {semester.semesterNumber}/{semester.year}
                      </span>
                      {semester.isActive && (
                        <span className="text-xs text-success">Active</span>
                      )}
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            {/* Shift Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="shift-filter"
              >
                Shift
              </label>
              <Autocomplete
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[400px]",
                }}
                defaultItems={shifts}
                id="shift-filter"
                placeholder="Select a shift"
                selectedKey={filterState.shiftId}
                onSelectionChange={(key) => updateFilter("shiftId", key)}
              >
                {(shift) => (
                  <AutocompleteItem key={shift.id} textValue={shift.name}>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {shift.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {shift.startTime.substring(0, 5)}
                        {" - "}
                        {shift.endTime.substring(0, 5)}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            {/* Capacity Range */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="capacity-range"
              >
                Capacity Range
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  aria-label="Minimum capacity"
                  className="w-[120px] bg-gray-50"
                  id="min-capacity"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.minCapacity?.toString() || "0"}
                  onChange={(e) =>
                    updateFilter(
                      "minCapacity",
                      e.target.value ? parseInt(e.target.value, 10) : 0
                    )
                  }
                />
                <span>to</span>
                <Input
                  aria-label="Maximum capacity"
                  className="w-[120px] bg-gray-50"
                  id="max-capacity"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.maxCapacity?.toString() || "100"}
                  onChange={(e) =>
                    updateFilter(
                      "maxCapacity",
                      e.target.value ? parseInt(e.target.value, 10) : 100
                    )
                  }
                />
              </div>
            </div>

            {/* Registration Status */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="registration-toggle"
              >
                Registration Status
              </label>
              <div className="flex gap-2" id="registration-toggle" role="group">
                <Button
                  className="flex-1"
                  color={
                    filterState.isRegistrable === true ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRegistrable === true ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRegistrable",
                      filterState.isRegistrable === true ? null : true
                    )
                  }
                >
                  Open
                </Button>
                <Button
                  className="flex-1"
                  color={
                    filterState.isRegistrable === false ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRegistrable === false ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRegistrable",
                      filterState.isRegistrable === false ? null : false
                    )
                  }
                >
                  Closed
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t pt-4 flex justify-between">
            <Button color="danger" variant="light" onPress={clearFilters}>
              Reset All
            </Button>
            <div className="flex gap-2">
              <Button variant="bordered" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
