import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, Input, Pagination, useDisclosure } from "@heroui/react";

import { CourseFilter } from "@/components/a/course/course-filter";
import { CourseModal } from "@/components/a/course/course-modal";
import { CourseTable } from "@/components/a/course/course-table";
import DefaultLayout from "@/layouts/default";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Major } from "@/services/major/major.schema";
import { majorService } from "@/services/major/major.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import {
  setCourses,
  setError,
  setLoading,
  setQuery,
  setTotal,
} from "@/store/slices/courseSlice";
import "./index.scss";

interface FilterChip {
  id: string;
  label: string;
}

// Custom hook for debounced values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, query, total, isLoading } = useAppSelector(
    (state: {
      course: {
        courses: Course[];
        query: any;
        total: number;
        isLoading: boolean;
      };
    }) => state.course
  );
  const [majors, setMajors] = useState<Major[]>([]);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.name || ""
  );
  const debouncedSearchValue = useDebounce<string>(searchInputValue, 600);
  // Add state to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // Create modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();

  const { confirmDialog } = useConfirmDialog();

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        setMajors(response.data);
      } catch (_error) {
        // Error handling without console.error
      }
    };

    fetchMajors();
  }, []); // Effect for handling debounced search
  useEffect(() => {
    const currentFilters = query.filters || {};

    dispatch(
      setQuery({
        ...query,
        filters: { ...currentFilters, name: debouncedSearchValue || undefined },
        pageNumber: 1,
      })
    );
  }, [debouncedSearchValue, dispatch]); // Removed query from dependencies

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        dispatch(setLoading(true));
        const response = await courseService.getCourses(query);

        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCourses();

    // Update filter chips whenever query changes
    updateFilterChipsFromQuery();
  }, [query, dispatch]);
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

    // Cost range filter
    if (query.filters.costRange) {
      const [min, max] = query.filters.costRange;

      newChips.push({
        id: "cost",
        label: `Cost: $${min} - $${max}`,
      });
    }

    // Credit range filter
    if (query.filters.creditRange) {
      const [min, max] = query.filters.creditRange;

      newChips.push({
        id: "credit",
        label: `Credits: ${min} - ${max}`,
      });
    }

    // Major filter
    if (query.filters.majorIds?.length) {
      const selectedMajors = majors
        .filter((m) => query.filters?.majorIds?.includes(m.id))
        .map((m) => m.code)
        .join(", ");

      newChips.push({
        id: "majorIds",
        label: `Majors: ${selectedMajors || "Selected"}`,
      });
    }

    // Active status filter
    if (
      query.filters.isActive !== undefined &&
      query.filters.isActive !== null
    ) {
      newChips.push({
        id: "active",
        label: `Active: ${query.filters.isActive ? "Yes" : "No"}`,
      });
    }

    // Open for all filter
    if (
      query.filters.isOpenForAll !== undefined &&
      query.filters.isOpenForAll !== null
    ) {
      newChips.push({
        id: "openForAll",
        label: `Open For All: ${query.filters.isOpenForAll ? "Yes" : "No"}`,
      });
    }

    // Required course filter
    if (
      query.filters.isRequired !== undefined &&
      query.filters.isRequired !== null
    ) {
      newChips.push({
        id: "requiredCourse",
        label: `Required Course: ${query.filters.isRequired ? "Yes" : "No"}`,
      });
    }

    // Pre-course IDs filter
    if (query.filters.preCourseIds?.length) {
      newChips.push({
        id: "preCourseIds",
        label: `Pre-Courses: ${query.filters.preCourseIds.length}`,
      });
    }

    // Parallel course IDs filter
    if (query.filters.parallelCourseIds?.length) {
      newChips.push({
        id: "parallelCourseIds",
        label: `Parallel Courses: ${query.filters.parallelCourseIds.length}`,
      });
    }

    setFilterChips(newChips);
  };

  const handleActiveToggle = async (course: Course) => {
    try {
      const updatedCourse = {
        ...course,
        isActive: !course.isActive,
        majorIds: course.majorIds ?? undefined,
      };

      await courseService.updateCourse(course.id, updatedCourse);
      // Refetch courses after toggling active status
      const response = await courseService.getCourses(query);

      dispatch(setCourses(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (_error) {
      // Error handling without console.error
    }
  };

  const onCreateSubmit = async (data: any) => {
    try {
      setIsCreateSubmitting(true);
      await courseService.createCourse(data);
      onCreateOpenChange();
      // Refetch courses after creating
      const response = await courseService.getCourses(query);

      dispatch(setCourses(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (_error) {
      // Error handling without console.error
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleSort = (key: string) => {
    // Map UI column keys to backend field names for sorting
    const fieldMap: Record<string, string> = {
      status: "isOpenForAll",
      activeStatus: "isActive",
    };

    // Use the mapped field name if it exists, otherwise use the original key
    const orderBy = fieldMap[key] || key;

    dispatch(
      setQuery({
        ...query,
        orderBy,
        isDesc: query.orderBy === orderBy ? !query.isDesc : false,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setQuery({ ...query, pageNumber: page }));
  };

  const handleFilterChange = (newQuery: any) => {
    dispatch(setQuery(newQuery));
  };
  const handleFilterClear = () => {
    // Reset search input
    setSearchInputValue("");

    dispatch(
      setQuery({
        pageNumber: 1,
        itemsPerpage: query.itemsPerpage,
        orderBy: undefined,
        isDesc: false,
        filters: {},
      })
    );
  };
  const handleRowToggle = (courseId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleDeleteCourse = (course: Course) => {
    confirmDialog(
      async () => {
        try {
          dispatch(setLoading(true));
          await courseService.deleteCourse(course.id);

          // Refresh the courses list after successful deletion
          const response = await courseService.getCourses(query);

          dispatch(setCourses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          dispatch(setError("Failed to delete course"));
          // eslint-disable-next-line no-console
          console.error("Error deleting course:", error);
        } finally {
          dispatch(setLoading(false));
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the course "${course.name}" (${course.code})?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            variant="solid"
            onPress={onCreateOpen}
          >
            Create Course
          </Button>
        </div>

        <div className="mb-6">
          {/* Search and filter container */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="pl-10 w-full rounded-xl"
                placeholder="Search course names..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {searchInputValue !== debouncedSearchValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <CourseFilter
              majors={majors}
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

        <div className="bg-white rounded-lg shadow">
          <CourseTable
            courses={courses}
            expandedRows={expandedRows}
            isLoading={isLoading}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onActiveToggle={handleActiveToggle}
            onDeleteCourse={handleDeleteCourse}
            onRowToggle={handleRowToggle}
            onSort={handleSort}
          />
        </div>

        <div className="flex justify-end">
          <Pagination
            page={query.pageNumber}
            total={Math.ceil(total / query.itemsPerpage)}
            onChange={handlePageChange}
          />
        </div>

        {/* Create Course Modal */}
        <CourseModal
          isOpen={isCreateOpen}
          isSubmitting={isCreateSubmitting}
          majors={majors}
          mode="create"
          onOpenChange={onCreateOpenChange}
          onSubmit={onCreateSubmit}
        />
      </div>
    </DefaultLayout>
  );
}
