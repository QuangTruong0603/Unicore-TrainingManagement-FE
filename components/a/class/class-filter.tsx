import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
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
}

interface FilterState {
  name?: string;
  groupName?: number;
  minCapacity?: number;
  maxCapacity?: number;
  startDate?: Date;
  endDate?: Date;
  isRegistrable?: boolean | null;
  courseId?: string;
  semesterId?: string;
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
    name: "",
    minCapacity: 0,
    maxCapacity: 100,
    isRegistrable: null,
  });
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

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

    // Process name filter
    if (filterState.name) {
      newFilters.name = filterState.name;
      newChips.push({
        id: "name",
        label: `Name: ${filterState.name}`,
        onRemove: () => removeFilter("name"),
      });
    }

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
    if (filterState.minCapacity !== undefined) {
      newFilters.minCapacity = filterState.minCapacity;
      newChips.push({
        id: "minCapacity",
        label: `Min Capacity: ${filterState.minCapacity}`,
        onRemove: () => removeFilter("minCapacity"),
      });
    }

    if (filterState.maxCapacity !== undefined) {
      newFilters.maxCapacity = filterState.maxCapacity;
      newChips.push({
        id: "maxCapacity",
        label: `Max Capacity: ${filterState.maxCapacity}`,
        onRemove: () => removeFilter("maxCapacity"),
      });
    }

    // Process date filters
    if (filterState.startDate) {
      newFilters.startDate = filterState.startDate;
      newChips.push({
        id: "startDate",
        label: `Start Date: ${filterState.startDate.toLocaleDateString()}`,
        onRemove: () => removeFilter("startDate"),
      });
    }

    if (filterState.endDate) {
      newFilters.endDate = filterState.endDate;
      newChips.push({
        id: "endDate",
        label: `End Date: ${filterState.endDate.toLocaleDateString()}`,
        onRemove: () => removeFilter("endDate"),
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
      name: "",
      minCapacity: 0,
      maxCapacity: 100,
      isRegistrable: null,
    });

    setFilterChips([]);
    onFilterClear();
    onClose();
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button
          size="sm"
          startContent={<Filter className="w-4 h-4" />}
          onClick={onOpen}
        >
          Filter
        </Button>

        {filterChips.map((chip) => (
          <Chip key={chip.id} variant="flat" onClose={chip.onRemove}>
            {chip.label}
          </Chip>
        ))}

        {filterChips.length > 0 && (
          <Button
            color="danger"
            size="sm"
            variant="flat"
            onClick={() => {
              setFilterChips([]);
              onFilterClear();
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Filter Classes</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Filter */}
              <div>
                <Input
                  label="Class Name"
                  placeholder="Filter by name"
                  value={filterState.name || ""}
                  onChange={(e) => updateFilter("name", e.target.value)}
                />
              </div>

              {/* Group Name Filter */}
              <div>
                <Input
                  label="Group Number"
                  min={1}
                  placeholder="Filter by group number"
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
              <div>
                <Autocomplete
                  defaultItems={courses}
                  label="Course"
                  placeholder="Select a course"
                  selectedKey={filterState.courseId}
                  onSelectionChange={(key) => updateFilter("courseId", key)}
                >
                  {(course) => (
                    <AutocompleteItem key={course.id} textValue={course.name}>
                      <div className="flex flex-col">
                        <span>{course.name}</span>
                        <span className="text-tiny text-default-400">
                          {course.code}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Semester Filter */}
              <div>
                <Autocomplete
                  defaultItems={semesters}
                  label="Semester"
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
                        <span>
                          Semester {semester.semesterNumber}/{semester.year}
                        </span>
                        {semester.isActive && (
                          <span className="text-tiny text-success">Active</span>
                        )}
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Capacity Range */}
              <div className="md:col-span-2">
                <p className="text-sm mb-1">Capacity Range</p>
                <div className="flex items-center gap-4">
                  <Input
                    label="Min"
                    min={0}
                    type="number"
                    value={filterState.minCapacity?.toString() || "0"}
                    onChange={(e) =>
                      updateFilter(
                        "minCapacity",
                        e.target.value ? parseInt(e.target.value, 10) : 0
                      )
                    }
                  />
                  <Input
                    label="Max"
                    min={0}
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

              {/* Date Range */}
              <div>
                <DatePicker
                  label="Start Date"
                  onChange={(date) => updateFilter("startDate", date)}
                />
              </div>
              <div>
                <DatePicker
                  label="End Date"
                  onChange={(date) => updateFilter("endDate", date)}
                />
              </div>

              {/* Registration Status */}
              <div>
                <Select
                  label="Registration Status"
                  placeholder="Select status"
                  selectedKeys={
                    filterState.isRegistrable !== null &&
                    filterState.isRegistrable !== undefined
                      ? [filterState.isRegistrable.toString()]
                      : []
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      updateFilter("isRegistrable", null);
                    } else {
                      updateFilter("isRegistrable", value === "true");
                    }
                  }}
                >
                  <SelectItem key="">Any</SelectItem>
                  <SelectItem key="true">Open</SelectItem>
                  <SelectItem key="false">Closed</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={clearFilters}>
              Clear All
            </Button>
            <Button color="primary" onPress={applyFilters}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
