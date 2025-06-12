import { useEffect, useState } from "react";
import { Plus, Search, CalendarClock } from "lucide-react";
import { Button, Input, Pagination, useDisclosure } from "@heroui/react";

import { ClassFilter } from "@/components/a/class/class-filter";
import { ClassModal } from "@/components/a/class/class-modal";
import { ClassTable } from "@/components/a/class/class-table";
import { ClassRegistrationModal } from "@/components/a/class/class-registration-modal";
import DefaultLayout from "@/layouts/default";
import { AcademicClass } from "@/services/class/class.schema";
import {
  AcademicClassCreateDto,
  ClassRegistrationScheduleDto,
} from "@/services/class/class.dto";
import { classService } from "@/services/class/class.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setClasses,
  setError,
  setLoading,
  setQuery,
  setTotal,
  setSelectedClass,
} from "@/store/slices/classSlice";
import "./index.scss";
import { useDebounce } from "@/hooks/useDebounce";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Semester } from "@/services/semester/semester.schema";
import { semesterService } from "@/services/semester/semester.service";
import { Shift } from "@/services/shift/shift.schema";
import { shiftService } from "@/services/shift/shift.service";

interface FilterChip {
  id: string;
  label: string;
}

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classes, query, total, isLoading, selectedClass } = useAppSelector(
    (state) => state.class
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.name || ""
  );
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const debouncedSearchValue = useDebounce(searchInputValue, 600);
  // Track expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Create modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();

  // Update modal
  const { isOpen: isUpdateOpen, onOpenChange: onUpdateOpenChange } =
    useDisclosure();
  // Registration schedule modal
  const {
    isOpen: isRegistrationOpen,
    onOpen: onRegistrationOpen,
    onOpenChange: onRegistrationOpenChange,
  } = useDisclosure();

  const { confirmDialog } = useConfirmDialog();

  // Effect for handling debounced search
  useEffect(() => {
    // Only update if the search value has actually changed
    const currentSearchValue = query.filters?.name || "";

    if (currentSearchValue === debouncedSearchValue) {
      return;
    }

    // Create a new filters object only if needed
    const newFilters = query.filters ? { ...query.filters } : {};

    if (debouncedSearchValue) {
      newFilters.name = debouncedSearchValue;
    } else {
      delete newFilters.name;
    }

    dispatch(
      setQuery({
        ...query,
        filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
        pageNumber: 1,
      })
    );
  }, [debouncedSearchValue]);
  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        dispatch(setLoading(true));
        const response = await classService.getClasses(query);

        dispatch(setClasses(response.data.data || []));
        dispatch(setTotal(response.data.total || 0));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchClasses();

    // Update filter chips whenever query changes
    updateFilterChipsFromQuery();
  }, [query, dispatch]);

  // Fetch courses, semesters, and shifts for filter display
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await courseService.getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        });

        setCourses(coursesResponse.data.data);

        // Fetch semesters
        const semestersResponse = await semesterService.getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "year",
          isDesc: true,
        });

        setSemesters(semestersResponse.data.data);

        // Fetch shifts
        const shiftsResponse = await shiftService.getAllShifts();

        setShifts(shiftsResponse.data);
      } catch (err) {
        // Silent error handling
      }
    };

    fetchFilterData();
  }, []);

  // Update filter chips based on current query
  const updateFilterChipsFromQuery = () => {
    if (!query.filters) {
      setFilterChips([]);

      return;
    }

    const newChips: FilterChip[] = [];

    // Name search filter
    if (query.filters.name) {
      newChips.push({
        id: "name",
        label: `Name: ${query.filters.name}`,
      });
    }

    // Group name filter
    if (query.filters.groupNumber) {
      newChips.push({
        id: "groupNumber",
        label: `Group: ${query.filters.groupNumber}`,
      });
    }

    // Capacity range filter
    if (query.filters.minCapacity) {
      newChips.push({
        id: "minCapacity",
        label: `Min Capacity: ${query.filters.minCapacity}`,
      });
    }

    if (query.filters.maxCapacity) {
      newChips.push({
        id: "maxCapacity",
        label: `Max Capacity: ${query.filters.maxCapacity}`,
      });
    }

    // Registration status filter
    if (
      query.filters.isRegistrable !== undefined &&
      query.filters.isRegistrable !== null
    ) {
      newChips.push({
        id: "isRegistrable",
        label: `Registration: ${query.filters.isRegistrable ? "Open" : "Closed"}`,
      });
    } // Course filter
    if (query.filters.courseId) {
      const course = courses.find(
        (course) => course.id === query.filters!.courseId
      );

      newChips.push({
        id: "courseId",
        label: `Course: ${course ? `${course.code} - ${course.name}` : "Unknown"}`,
      });
    } // Semester filter
    if (query.filters.semesterId) {
      const semester = semesters.find(
        (semester) => semester.id === query.filters!.semesterId
      );

      newChips.push({
        id: "semesterId",
        label: `Semester: ${semester ? `${semester.semesterNumber}/${semester.year}` : "Unknown"}`,
      });
    }

    // Shift filter
    if (query.filters.shiftId) {
      const shift = shifts.find((shift) => shift.id === query.filters!.shiftId);

      newChips.push({
        id: "shiftId",
        label: `Shift: ${shift ? shift.name : "Unknown"}`,
      });
    }

    setFilterChips(newChips);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    dispatch(
      setQuery({
        ...query,
        orderBy: key,
        isDesc: query.orderBy === key ? !query.isDesc : false,
      })
    );
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    dispatch(
      setQuery({
        ...query,
        pageNumber: page,
      })
    );
  };

  // Handle filter change
  const handleFilterChange = (newQuery: any) => {
    dispatch(setQuery(newQuery));
  };

  // Clear filters
  const handleFilterClear = () => {
    dispatch(
      setQuery({
        ...query,
        pageNumber: 1,
        filters: undefined,
      })
    );
    setSearchInputValue("");
  };

  // Toggle expanded row
  const toggleRow = (classId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  // Handle registration status toggle
  const handleRegistrationToggle = async (academicClass: AcademicClass) => {
    try {
      if (academicClass.isRegistrable) {
        await classService.disableRegistration(academicClass.id);
      } else {
        await classService.enableRegistration(academicClass.id);
      }

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));
    } catch (error) {
      dispatch(setError("Failed to update registration status"));
    }
  };

  // Handle registration schedule creation
  const handleCreateRegistrationSchedule = async (
    data: ClassRegistrationScheduleDto
  ) => {
    try {
      setIsSubmitting(true);
      await classService.createClassRegistrationSchedule(data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));

      // Reset selection
      setSelectedClasses([]);
      onRegistrationOpenChange();
    } catch (error) {
      dispatch(setError("Failed to set registration schedule"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create class
  const handleCreateClass = async (data: AcademicClassCreateDto) => {
    try {
      setIsSubmitting(true);
      await classService.createClass(data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));
      dispatch(setTotal(response.data.total));

      onCreateOpenChange();
    } catch (error) {
      dispatch(setError("Failed to create class"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update class
  const handleUpdateClass = async (data: AcademicClassCreateDto) => {
    try {
      if (!selectedClass) return;

      setIsSubmitting(true);
      await classService.updateClass(selectedClass.id, data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));

      onUpdateOpenChange();
      dispatch(setSelectedClass(null));
    } catch (error) {
      dispatch(setError("Failed to update class"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = (academicClass: AcademicClass) => {
    confirmDialog(
      async () => {
        try {
          dispatch(setLoading(true));
          await classService.deleteClass(academicClass.id);
          
          // Refresh the classes list after successful deletion
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          dispatch(setError("Failed to delete class"));
          // eslint-disable-next-line no-console
          console.error("Error deleting class:", error);
        } finally {
          dispatch(setLoading(false));
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the class "${academicClass.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        {" "}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Classes Management</h1>
          <div className="flex items-center gap-3">
            {selectedClasses.length > 0 && (
              <Button
                color="secondary"
                startContent={<CalendarClock className="w-4 h-4" />}
                onClick={onRegistrationOpen}
              >
                Set Registration Schedule ({selectedClasses.length})
              </Button>
            )}
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onClick={onCreateOpen}
            >
              Create Class
            </Button>
          </div>
        </div>
        {/* Search and Filter Section */}
        <div className="mb-6">
          {/* Search and filter row */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="w-full rounded-xl"
                placeholder="Search classes..."
                startContent={<Search className="text-gray-400" />}
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onClear={() => setSearchInputValue("")}
              />
              {searchInputValue !== debouncedSearchValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <ClassFilter
              query={query}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
            />
          </div>

          {/* Filter chips display - increased margin-top */}
          {filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filterChips.map((chip) => (
                <div
                  key={chip.id}
                  className="bg-orange-100 text-primary px-3 py-1 rounded-full text-xs"
                >
                  {chip.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow">
          <ClassTable
            allowMultiSelect={true}
            classes={classes}
            expandedRows={expandedRows}
            isLoading={isLoading}
            selectedClasses={selectedClasses}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onDeleteClass={handleDeleteClass}
            onRegistrationToggle={handleRegistrationToggle}
            onRowToggle={toggleRow}
            onSelectedClassesChange={setSelectedClasses}
            onSort={handleSort}
          />
          {/* Pagination */}
          <div className="px-4 py-3 border-t flex justify-end">
            <Pagination
              initialPage={query.pageNumber}
              page={query.pageNumber}
              total={Math.ceil(total / query.itemsPerpage)}
              onChange={handlePageChange}
            />
          </div>
        </div>
        {/* Create Modal */}
        <ClassModal
          isOpen={isCreateOpen}
          isSubmitting={isSubmitting}
          mode="create"
          onOpenChange={onCreateOpenChange}
          onSubmit={handleCreateClass}
        />
        {/* Update Modal */}
        <ClassModal
          academicClass={selectedClass}
          isOpen={isUpdateOpen}
          isSubmitting={isSubmitting}
          mode="update"
          onOpenChange={onUpdateOpenChange}
          onSubmit={handleUpdateClass}
        />
        {/* Registration Schedule Modal */}
        <ClassRegistrationModal
          isOpen={isRegistrationOpen}
          isSubmitting={isSubmitting}
          selectedClasses={selectedClasses}
          onOpenChange={onRegistrationOpenChange}
          onSubmit={handleCreateRegistrationSchedule}
        />
      </div>
    </DefaultLayout>
  );
}
