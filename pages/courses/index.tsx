import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Pagination, useDisclosure } from "@heroui/react";

import { CourseFilter } from "@/components/course/course-filter";
import { CourseModal } from "@/components/course/course-modal";
import { DataTable } from "@/components/ui/table/table";
import DefaultLayout from "@/layouts/default";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Major } from "@/services/major/major.schema";
import { majorService } from "@/services/major/major.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCourses,
  setError,
  setLoading,
  setQuery,
  setTotal,
} from "@/store/slices/courseSlice";

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
    (state) => state.course
  );
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.searchQuery || ""
  );
  const debouncedSearchValue = useDebounce<string>(searchInputValue, 600);

  // Create modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  // Update modal
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onOpenChange: onUpdateOpenChange,
  } = useDisclosure();

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
  }, []);

  // Effect for handling debounced search
  useEffect(() => {
    dispatch(
      setQuery({ ...query, searchQuery: debouncedSearchValue, pageNumber: 1 })
    );
  }, [debouncedSearchValue, dispatch]);

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

    // Price range filter
    if (query.filters.priceRange) {
      const [min, max] = query.filters.priceRange;

      newChips.push({
        id: "price",
        label: `Price: $${min} - $${max}`,
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

    // Status filter
    if (
      query.filters.isOpening !== undefined &&
      query.filters.isOpening !== null
    ) {
      newChips.push({
        id: "status",
        label: `Status: ${query.filters.isOpening ? "Opening" : "Normal"}`,
      });
    }

    // Practice class filter
    if (
      query.filters.isHavePracticeClass !== undefined &&
      query.filters.isHavePracticeClass !== null
    ) {
      newChips.push({
        id: "practiceClass",
        label: `Practice Class: ${query.filters.isHavePracticeClass ? "Yes" : "No"}`,
      });
    }

    // Score calculation filter
    if (
      query.filters.isUseForCalculateScore !== undefined &&
      query.filters.isUseForCalculateScore !== null
    ) {
      newChips.push({
        id: "scoreCalculation",
        label: `Used for Score: ${query.filters.isUseForCalculateScore ? "Yes" : "No"}`,
      });
    }

    // Min credit filter
    if (query.filters.minCreditCanApply) {
      newChips.push({
        id: "minCreditApply",
        label: `Min Credits to Apply: ${query.filters.minCreditCanApply}`,
      });
    }

    setFilterChips(newChips);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    onUpdateOpen();
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm(`Are you sure you want to delete ${course.name}?`)) {
      try {
        await courseService.deleteCourse(course.id);
        // Refetch courses after deleting
        const response = await courseService.getCourses(query);

        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (_error) {
        // Error handling without console.error
      }
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

  const onUpdateSubmit = async (data: any) => {
    try {
      if (selectedCourse) {
        setIsUpdateSubmitting(true);
        await courseService.updateCourse(selectedCourse.id, data);
        onUpdateOpenChange();
        setSelectedCourse(null);
        // Refetch courses after updating
        const response = await courseService.getCourses(query);

        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      }
    } catch (_error) {
      // Error handling without console.error
    } finally {
      setIsUpdateSubmitting(false);
    }
  };

  const handleSearch = (value: string) => {
    dispatch(setQuery({ ...query, searchQuery: value, pageNumber: 1 }));
  };

  const handleSort = (key: string) => {
    dispatch(
      setQuery({
        ...query,
        orderBy: key,
        isDesc: query.orderBy === key ? !query.isDesc : false,
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
    dispatch(
      setQuery({
        pageNumber: 1,
        itemsPerpage: query.itemsPerpage,
        searchQuery: query.searchQuery,
        orderBy: "name",
        isDesc: false,
        filters: {},
      })
    );
  };

  const columns = [
    {
      key: "code",
      title: "Code",
      sortable: true,
      render: (course: Course) => course.code,
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (course: Course) => course.name,
    },
    {
      key: "credit",
      title: "Credit",
      sortable: true,
      render: (course: Course) => course.credit,
    },
    {
      key: "price",
      title: "Price",
      sortable: true,
      render: (course: Course) => `$${course.price}`,
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded text-sm ${course.isOpening ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {course.isOpening ? "Opening" : "Closed"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (course: Course) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="bordered"
            onPress={() => handleEdit(course)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            size="sm"
            variant="flat"
            onPress={() => handleDelete(course)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <Button color="primary" variant="solid" onPress={onCreateOpen}>
            Add Course
          </Button>
        </div>

        <div className="mb-6">
          {/* Search and filter container */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="pl-10 w-full rounded-xl"
                placeholder="Search courses..."
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
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                >
                  {chip.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            columns={columns}
            data={courses}
            isLoading={isLoading}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onSort={handleSort}
          />
        </div>

        <div className="mt-4 flex justify-end">
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

        {/* Update Course Modal */}
        <CourseModal
          course={selectedCourse}
          isOpen={isUpdateOpen}
          isSubmitting={isUpdateSubmitting}
          majors={majors}
          mode="update"
          onOpenChange={onUpdateOpenChange}
          onSubmit={onUpdateSubmit}
        />
      </div>
    </DefaultLayout>
  );
}
