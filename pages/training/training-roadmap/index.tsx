import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Pagination,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { Search, Plus, Filter } from "lucide-react";

import DefaultLayout from "@/layouts/default";
import { TrainingRoadmapTable } from "@/components/training-roadmap/training-roadmap-table";
import { TrainingRoadmapModal } from "@/components/training-roadmap/training-roadmap-modal";
import { majorService } from "@/services/major/major.service";
import { Major } from "@/services/major/major.schema";
import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";
import { TrainingRoadmapFormData } from "@/components/training-roadmap/training-roadmap-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setRoadmaps,
  setQuery,
  setFilter,
  setSearchQuery,
  setPage,
  setSort,
  setTotal,
  setLoading,
  setError,
  updateRoadmapStatus,
} from "@/store/slices/trainingRoadmapSlice";
import { trainingRoadmapService } from "@/services/training-roadmap/training-roadmap.service";

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

const TrainingRoadmapPage: React.FC = () => {
  // Use Redux state
  const dispatch = useAppDispatch();
  const { roadmaps, query, totalPages, isLoading } = useAppSelector(
    (state) => state.trainingRoadmap
  );

  // State for majors (for filter)
  const [majors, setMajors] = useState<Major[]>([]);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // State for filter chips
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);

  // State for search input with debounce
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.searchQuery || ""
  );
  const debouncedSearchValue = useDebounce<string>(searchInputValue, 600);

  // Modal states using useDisclosure hook
  const {
    isOpen: createModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();

  // Filter modal states
  const {
    isOpen: filterModalOpen,
    onOpen: onFilterModalOpen,
    onOpenChange: onFilterModalOpenChange,
  } = useDisclosure();

  // State for temporary filter (used in filter modal)
  const [tempFilter, setTempFilter] = useState(query.filters || {});

  // State for form submission
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  // Fetch majors on component mount
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        setMajors(response.data || []);
      } catch (error) {
        console.error("Failed to fetch majors:", error);
      }
    };

    fetchMajors();
  }, []);

  // Fetch training roadmaps when query changes
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        dispatch(setLoading(true));
        const response =
          await trainingRoadmapService.getTrainingRoadmaps(query);

        dispatch(setRoadmaps(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchRoadmaps();
    // Update filter chips whenever query changes
    updateFilterChipsFromQuery();
  }, [query, dispatch]);

  // Effect for handling debounced search
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearchValue));
  }, [debouncedSearchValue, dispatch]);

  // When filter modal opens, initialize temp filter with current filter
  useEffect(() => {
    if (filterModalOpen) {
      setTempFilter(query.filters || {});
    }
  }, [filterModalOpen, query.filters]);

  // Reset expanded rows when roadmaps change
  useEffect(() => {
    setExpandedRows({});
  }, [roadmaps]);

  // Update filter chips based on current query
  const updateFilterChipsFromQuery = () => {
    if (!query.filters) {
      setFilterChips([]);

      return;
    }

    const newChips: FilterChip[] = [];

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

    // Code filter
    if (query.filters.code) {
      newChips.push({
        id: "code",
        label: `Code: ${query.filters.code}`,
      });
    }

    // Year range filter
    if (query.filters.startYearRange) {
      newChips.push({
        id: "years",
        label: `Years: ${query.filters.startYearRange[0]} - ${query.filters.startYearRange[1]}`,
      });
    }

    setFilterChips(newChips);
  };

  // Handle search change
  const handleSearchChange = (searchQuery: string) => {
    setSearchInputValue(searchQuery);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    dispatch(
      setQuery({
        pageNumber: 1,
        itemsPerpage: query.itemsPerpage,
        searchQuery: query.searchQuery,
        orderBy: undefined,
        isDesc: false,
        filters: {},
      })
    );
    setTempFilter({});
    onFilterModalOpenChange();
  };

  // Apply filters from modal
  const handleApplyFilters = () => {
    dispatch(setFilter(tempFilter));
    onFilterModalOpenChange();
  };

  // Handle major selection
  const handleMajorChange = (selectedMajorIds: Set<string>) => {
    // Convert Set to Array, but limit to only one selection to be consistent with course filter
    const majorIds = Array.from(selectedMajorIds);

    setTempFilter({
      ...tempFilter,
      majorIds: majorIds,
    });
  };

  // Handle code filter change
  const handleCodeChange = (value: string) => {
    setTempFilter({
      ...tempFilter,
      code: value || undefined,
    });
  };

  // Handle start year range change
  const handleYearRangeChange = (index: number, value: number) => {
    const currentRange = tempFilter.startYearRange || [
      2020,
      new Date().getFullYear(),
    ];
    const newRange = [...currentRange] as [number, number];

    newRange[index] = value;

    setTempFilter({
      ...tempFilter,
      startYearRange: newRange as [number, number],
    });
  };

  // Handle row toggle (expand/collapse)
  const handleRowToggle = (roadmapId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [roadmapId]: !prev[roadmapId],
    }));
  };

  // Handle active status toggle
  const handleActiveToggle = async (roadmap: TrainingRoadmap) => {
    try {
      dispatch(setLoading(true));

      if (roadmap.isActive) {
        // Deactivate
        await trainingRoadmapService.deactivateTrainingRoadmap(roadmap.id);
      } else {
        // Activate
        await trainingRoadmapService.activateTrainingRoadmap(roadmap.id);
      }

      // Update the roadmap status in the Redux store
      dispatch(
        updateRoadmapStatus({ id: roadmap.id, isActive: !roadmap.isActive })
      );
    } catch (error) {
      console.error(
        `Failed to ${roadmap.isActive ? "deactivate" : "activate"} roadmap:`,
        error
      );
      dispatch(
        setError(
          `Failed to ${roadmap.isActive ? "deactivate" : "activate"} roadmap`
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle sort
  const handleSort = (key: string) => {
    dispatch(
      setSort({
        key,
        isDesc: query.orderBy === key ? !query.isDesc : false,
      })
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  // Handle create new roadmap
  const handleCreateRoadmap = () => {
    onCreateModalOpen();
  };

  // Handle create roadmap submission
  const handleCreateSubmit = async (data: TrainingRoadmapFormData) => {
    try {
      setIsCreateSubmitting(true);
      await trainingRoadmapService.createTrainingRoadmap(data);
      onCreateModalOpenChange();

      // Refresh roadmaps after creating
      const response = await trainingRoadmapService.getTrainingRoadmaps(query);

      dispatch(setRoadmaps(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (error) {
      console.error("Failed to create roadmap:", error);
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Training Roadmaps</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            variant="solid"
            onPress={handleCreateRoadmap}
          >
            Create Roadmap
          </Button>
        </div>
        <div className="mb-6">
          {/* Search and filter container */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="pl-10 w-full rounded-xl"
                placeholder="Search roadmaps..."
                value={searchInputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
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
            <Button
              className="min-w-[100px] h-11 px-4"
              color={filterChips.length > 0 ? "primary" : "default"}
              startContent={<Filter size={18} />}
              variant={filterChips.length > 0 ? "solid" : "bordered"}
              onPress={onFilterModalOpen}
            >
              Filters {filterChips.length > 0 && `(${filterChips.length})`}
            </Button>
          </div>

          {/* Filter chips display */}
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
        </div>{" "}
        <div className="bg-white rounded-lg shadow">
          {" "}
          <TrainingRoadmapTable
            expandedRows={expandedRows}
            isLoading={isLoading}
            roadmaps={Array.isArray(roadmaps) ? roadmaps : []}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onActiveToggle={handleActiveToggle}
            onEdit={() => {}} // Empty function as we're removing edit functionality
            onRowToggle={handleRowToggle}
            onSort={handleSort}
          />
        </div>
        <div className="mt-4 flex justify-end">
          {totalPages > 1 && (
            <Pagination
              page={query.pageNumber}
              total={totalPages}
              onChange={handlePageChange}
            />
          )}
        </div>
        {/* Modal for creating roadmap */}
        <TrainingRoadmapModal
          isOpen={createModalOpen}
          isSubmitting={isCreateSubmitting}
          majors={majors}
          mode="create"
          onOpenChange={onCreateModalOpenChange}
          onSubmit={handleCreateSubmit}
        />
        {/* Filter Modal */}
        <Modal
          isOpen={filterModalOpen}
          size="md"
          onOpenChange={onFilterModalOpenChange}
        >
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Filter Roadmaps</h3>
            </ModalHeader>
            <ModalBody className="space-y-4">
              {/* Major Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="major-select"
                >
                  Major
                </label>
                <Select
                  className="w-full"
                  id="major-select"
                  items={majors}
                  placeholder="Select a major"
                  selectedKeys={tempFilter.majorIds || []}
                  selectionMode="single"
                  onSelectionChange={(keys) =>
                    handleMajorChange(keys as Set<string>)
                  }
                >
                  {(major) => (
                    <SelectItem key={major.id} textValue={major.name}>
                      {major.name} ({major.code})
                    </SelectItem>
                  )}
                </Select>
              </div>

              {/* Code Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="roadmap-code"
                >
                  Roadmap Code
                </label>
                <Input
                  id="roadmap-code"
                  placeholder="Filter by code"
                  value={tempFilter.code || ""}
                  onChange={(e) => handleCodeChange(e.target.value)}
                />
              </div>

              {/* Year Range Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="start-year-range"
                >
                  Start Year Range
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="start-year-range"
                    placeholder="From year"
                    type="number"
                    value={
                      tempFilter.startYearRange?.[0] !== undefined
                        ? String(tempFilter.startYearRange[0])
                        : ""
                    }
                    onChange={(e) =>
                      handleYearRangeChange(0, parseInt(e.target.value))
                    }
                  />
                  <span>to</span>
                  <Input
                    placeholder="To year"
                    type="number"
                    value={
                      tempFilter.startYearRange?.[1] !== undefined
                        ? String(tempFilter.startYearRange[1])
                        : ""
                    }
                    onChange={(e) =>
                      handleYearRangeChange(1, parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={handleResetFilters}
              >
                Reset
              </Button>
              <Button color="primary" onPress={handleApplyFilters}>
                Apply Filters
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default TrainingRoadmapPage;
