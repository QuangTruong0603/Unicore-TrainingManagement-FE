import { useEffect, useState } from "react";
import { Input, Pagination } from "@heroui/react";
import { useRouter } from "next/router";

import { ClassFilter } from "@/components/a/class/class-filter";
import DefaultLayout from "@/layouts/default";
import { classService } from "@/services/class/class.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setClasses,
  setError,
  setLoading,
  setQuery,
  setTotal,
} from "@/store/slices/classSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Semester } from "@/services/semester/semester.schema";
import { semesterService } from "@/services/semester/semester.service";
import { Shift } from "@/services/shift/shift.schema";
import { shiftService } from "@/services/shift/shift.service";
import { ClassTable } from "@/components/a/class/class-table";
import { AcademicClass } from "@/services/class/class.schema";

interface FilterChip {
  id: string;
  label: string;
}

export default function ClassPage() {
  const dispatch = useAppDispatch();
  const { classes, query, total, isLoading } = useAppSelector(
    (state) => state.class
  );
  const router = useRouter();
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.name || ""
  );
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const debouncedSearchValue = useDebounce(searchInputValue, 600);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Effect for handling debounced search
  useEffect(() => {
    const currentSearchValue = query.filters?.name || "";

    if (currentSearchValue === debouncedSearchValue) return;
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

  // Fetch classes (with lecturerId)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        dispatch(setLoading(true));
        // Lấy lecturerId từ localStorage
        const lecturerId = JSON.parse(
          localStorage.getItem("lecturerInfo") || "{}"
        ).id;
        const response = await classService.getClasses({
          ...query,
          filters: {
            ...query.filters,
            lecturerId: lecturerId || undefined,
          },
        });

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
    updateFilterChipsFromQuery();
  }, [query, dispatch]);

  // Fetch courses, semesters, and shifts for filter display
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const coursesResponse = await courseService.getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        });

        setCourses(coursesResponse.data.data);
        const semestersResponse = await semesterService.getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "year",
          isDesc: true,
        });

        setSemesters(semestersResponse.data.data);
        const shiftsResponse = await shiftService.getAllShifts();

        setShifts(shiftsResponse.data);
      } catch {
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

    if (query.filters.name) {
      newChips.push({ id: "name", label: `Name: ${query.filters.name}` });
    }
    if (query.filters.groupNumber) {
      newChips.push({
        id: "groupNumber",
        label: `Group: ${query.filters.groupNumber}`,
      });
    }
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
    if (query.filters.courseId) {
      const course = courses.find(
        (course) => course.id === query.filters!.courseId
      );

      newChips.push({
        id: "courseId",
        label: `Course: ${course ? `${course.code} - ${course.name}` : "Unknown"}`,
      });
    }
    if (query.filters.semesterId) {
      const semester = semesters.find(
        (semester) => semester.id === query.filters!.semesterId
      );

      newChips.push({
        id: "semesterId",
        label: `Semester: ${semester ? `${semester.semesterNumber}/${semester.year}` : "Unknown"}`,
      });
    }
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

  const handleClassNameClick = (academicClass: AcademicClass) => {
    router.push(`/l/score/${academicClass.id}`);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Classes</h1>
        {/* Search and Filter Section */}
        <div className="mb-6">
          {/* Search and filter row */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="w-full rounded-xl"
                placeholder="Search class..."
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
        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow">
          <ClassTable
            allowMultiSelect={false}
            classes={classes}
            expandedRows={expandedRows}
            isLoading={isLoading}
            isScorePage={true}
            selectedClasses={[]}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onClassNameClick={handleClassNameClick}
            onRegistrationToggle={() => {}}
            onRowToggle={toggleRow}
            onSelectedClassesChange={() => {}}
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
      </div>
    </DefaultLayout>
  );
}
