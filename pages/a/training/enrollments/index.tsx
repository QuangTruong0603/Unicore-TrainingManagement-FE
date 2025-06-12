import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input, Pagination, Button, addToast } from "@heroui/react";

import { EnrollmentFilter } from "@/components/a/enrollment/enrollment-filter";
import DefaultLayout from "@/layouts/default";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Semester } from "@/services/semester/semester.schema";
import { semesterService } from "@/services/semester/semester.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import {
  setEnrollments,
  setError,
  setLoading,
  setQuery,
  setTotal,
} from "@/store/slices/enrollmentSlice";
import { useDebounce } from "@/hooks/useDebounce";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import "./index.scss";
import { EnrollmentTable } from "@/components/a/enrollment/enrollment-table";

interface FilterChip {
  id: string;
  label: string;
}

export default function EnrollmentsPage() {
  const dispatch = useAppDispatch();
  const { enrollments, query, total, isLoading } = useAppSelector(
    (state: RootState) => state.enrollment
  );
  const { confirmDialog } = useConfirmDialog();

  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.studentCode || ""
  );
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    []
  );
  const debouncedSearchValue = useDebounce<string>(searchInputValue, 600);

  // Fetch enrollments whenever query changes
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await enrollmentService.getEnrollments(query);

        dispatch(setEnrollments(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch {
        dispatch(setError("Failed to fetch enrollments"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEnrollments();
  }, [query, dispatch]);

  // Update query when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue !== (query.filters?.studentCode || "")) {
      dispatch(
        setQuery({
          ...query,
          pageNumber: 1,
          filters: {
            ...query.filters,
            studentCode: debouncedSearchValue || undefined,
          },
        })
      );
    }
  }, [debouncedSearchValue, query, dispatch]);

  // Fetch filter data (courses and semesters)
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
      } catch {
        // Silent error handling
      }
    };

    fetchFilterData();
  }, []);

  // Update filter chips when query filters change
  useEffect(() => {
    const newChips: FilterChip[] = [];

    // Student Code filter
    if (query.filters?.studentCode) {
      newChips.push({
        id: "studentCode",
        label: `Student: ${query.filters.studentCode}`,
      });
    }

    // Status filter
    if (query.filters?.status !== undefined && query.filters?.status !== null) {
      const statusLabel = getStatusLabel(query.filters.status);

      newChips.push({
        id: "status",
        label: `Status: ${statusLabel}`,
      });
    }

    // Course filter
    if (query.filters?.courseId) {
      const course = courses.find((c) => c.id === query.filters!.courseId);

      newChips.push({
        id: "courseId",
        label: `Course: ${course ? `${course.code} - ${course.name}` : "Unknown"}`,
      });
    }

    // Semester filter
    if (query.filters?.semesterId) {
      const semester = semesters.find(
        (s) => s.id === query.filters!.semesterId
      );

      newChips.push({
        id: "semesterId",
        label: `Semester: ${semester ? `${semester.semesterNumber}/${semester.year}` : "Unknown"}`,
      });
    }

    // Date range filters
    if (query.filters?.fromDate) {
      newChips.push({
        id: "fromDate",
        label: `From: ${query.filters.fromDate.toLocaleDateString()}`,
      });
    }

    if (query.filters?.toDate) {
      newChips.push({
        id: "toDate",
        label: `To: ${query.filters.toDate.toLocaleDateString()}`,
      });
    }

    setFilterChips(newChips);
  }, [query.filters, courses, semesters]);

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Enrolled";
      case 2:
        return "Dropped";
      case 3:
        return "Completed";
      default:
        return "Unknown";
    }
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

  const handleDeleteEnrollment = (enrollment: any) => {
    confirmDialog(
      async () => {
        try {
          dispatch(setLoading(true));
          await enrollmentService.deleteEnrollment(enrollment.id);

          // Refresh the enrollments list after successful deletion
          const response = await enrollmentService.getEnrollments(query);

          dispatch(setEnrollments(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          dispatch(setError("Failed to delete enrollment"));
          addToast({
            title: "Error",
            description: "Failed to delete enrollment",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error deleting enrollment:", error);
        } finally {
          dispatch(setLoading(false));
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the enrollment ?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedEnrollmentIds(selectedIds);
  };
  const handleMarkAsDone = () => {
    // eslint-disable-next-line no-console
    console.log("Selected enrollment IDs:", selectedEnrollmentIds);
    // Reset selection after marking as done
    setSelectedEnrollmentIds([]);
  };

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Enrollments</h1>
          {selectedEnrollmentIds.length > 0 && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              size="md"
              onPress={handleMarkAsDone}
            >
              Mark as Done ({selectedEnrollmentIds.length})
            </Button>
          )}
        </div>

        <div className="mb-6">
          {/* Search and filter container */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="pl-10 w-full rounded-xl"
                placeholder="Search by student code..."
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
            <EnrollmentFilter
              courses={courses}
              query={query}
              semesters={semesters}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
            />
          </div>

          {/* Filter chips display */}
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
          <EnrollmentTable
            enrollments={enrollments}
            isLoading={isLoading}
            selectedEnrollmentIds={selectedEnrollmentIds}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onDeleteEnrollment={handleDeleteEnrollment}
            onSelectionChange={handleSelectionChange}
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
      </div>
    </DefaultLayout>
  );
}
