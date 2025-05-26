import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, Input, Pagination, useDisclosure } from "@heroui/react";

import { ClassFilter } from "@/components/a/class/class-filter";
import { ClassModal } from "@/components/a/class/class-modal";
import { ClassTable } from "@/components/a/class/class-table";
import DefaultLayout from "@/layouts/default";
import { AcademicClass } from "@/services/class/class.schema";
import { AcademicClassCreateDto } from "@/services/class/class.dto";
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

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classes, query, total, isLoading, selectedClass } = useAppSelector(
    (state) => state.class
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.name || ""
  );
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

        dispatch(setClasses(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        dispatch(setError("Failed to fetch classes"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchClasses();
  }, [dispatch, query]);

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

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Classes Management</h1>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={onCreateOpen}
          >
            Create Class
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search classes..."
              startContent={<Search className="text-gray-400" />}
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onClear={() => setSearchInputValue("")}
            />
          </div>
          <ClassFilter
            query={query}
            onFilterChange={handleFilterChange}
            onFilterClear={handleFilterClear}
          />
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow">
          <ClassTable
            classes={classes}
            expandedRows={expandedRows}
            isLoading={isLoading}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onRowToggle={toggleRow}
            onSort={handleSort}
            onRegistrationToggle={handleRegistrationToggle}
            // onEditClick={handleEditClick}
          />

          {/* Pagination */}
          <div className="px-4 py-3 border-t flex justify-center">
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
      </div>
    </DefaultLayout>
  );
}
