import React, { useState, useEffect } from "react";
import { Button, Pagination, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";

import DefaultLayout from "@/layouts/default";
import { TrainingRoadmapTable } from "@/components/a/training-roadmap/training-roadmap-table";
import { TrainingRoadmapModal } from "@/components/a/training-roadmap/training-roadmap-modal";
import { TrainingRoadmapFilter } from "@/components/a/training-roadmap/training-roadmap-filter";
import { majorService } from "@/services/major/major.service";
import { Major } from "@/services/major/major.schema";
import { batchService } from "@/services/batch/batch.service";
import { Batch } from "@/services/batch/batch.schema";
import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";
import { TrainingRoadmapFormData } from "@/components/a/training-roadmap/training-roadmap-form";
import { useDeleteTrainingRoadmap } from "@/services/training-roadmap/training-roadmap.hooks";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setRoadmaps,
  setFilter,
  setSearchQuery,
  setPage,
  setSort,
  setTotal,
  setLoading,
  setError,
} from "@/store/slices/trainingRoadmapSlice";
import { trainingRoadmapService } from "@/services/training-roadmap/training-roadmap.service";
import "./index.scss";

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

  // State for batches (for modal)
  const [batches, setBatches] = useState<Batch[]>([]);
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  const {
    isOpen: updateModalOpen,
    onOpen: onUpdateModalOpen,
    onOpenChange: onUpdateModalOpenChange,
  } = useDisclosure();

  // State for form submission
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] =
    useState<TrainingRoadmap | null>(null);

  // Fetch majors and batches on component mount

  useEffect(() => {
    let isMounted = true;

    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        if (isMounted) {
          setMajors(response.data || []);
        }
      } catch (error) {
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError"
        ) {
          console.error("Failed to fetch majors:", error);
        }
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatches();

        if (isMounted) {
          setBatches(response.data || []);
        }
      } catch (error) {
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError"
        ) {
          console.error("Failed to fetch batches:", error);
        }
      }
    };

    fetchMajors();
    fetchBatches();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch training roadmaps when query changes
  useEffect(() => {
    let isMounted = true;

    const fetchRoadmaps = async () => {
      try {
        if (isMounted) {
          dispatch(setLoading(true));
        }

        const response =
          await trainingRoadmapService.getTrainingRoadmaps(query);

        if (isMounted) {
          dispatch(setRoadmaps(response.data.data));
          dispatch(setTotal(response.data.total));
        }
      } catch (error) {
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError"
        ) {
          dispatch(
            setError(
              error instanceof Error ? error.message : "An error occurred"
            )
          );
        }
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    fetchRoadmaps();

    return () => {
      isMounted = false;
    };
  }, [query, dispatch]);

  // Effect for handling debounced search
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearchValue));
  }, [debouncedSearchValue, dispatch]);

  // Reset expanded rows when roadmaps change
  useEffect(() => {
    setExpandedRows({});
  }, [roadmaps]);

  // Handle row toggle (expand/collapse)
  const handleRowToggle = (roadmapId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [roadmapId]: !prev[roadmapId],
    }));
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

  // Handle update roadmap submission
  const handleUpdateSubmit = async (data: TrainingRoadmapFormData) => {
    if (!selectedRoadmap) return;

    try {
      setIsUpdateSubmitting(true);
      await trainingRoadmapService.updateTrainingRoadmap(
        selectedRoadmap.id,
        data
      );
      onUpdateModalOpenChange();
      setSelectedRoadmap(null);

      // Refresh roadmaps after updating
      const response = await trainingRoadmapService.getTrainingRoadmaps(query);

      dispatch(setRoadmaps(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (error) {
      console.error("Failed to update roadmap:", error);
    } finally {
      setIsUpdateSubmitting(false);
    }
  };

  // Handle edit roadmap
  const handleEditRoadmap = (roadmap: TrainingRoadmap) => {
    setSelectedRoadmap(roadmap);
    onUpdateModalOpen();
  };
  // Delete roadmap mutation
  const deleteRoadmapMutation = useDeleteTrainingRoadmap();
  const { confirmDialog } = useConfirmDialog();

  // Handle delete roadmap
  const handleDeleteRoadmap = (roadmap: TrainingRoadmap) => {
    confirmDialog(
      async () => {
        try {
          await deleteRoadmapMutation.mutateAsync(roadmap.id);
          // The mutation will automatically refresh the list
        } catch {
          // Handle error silently or show a toast
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the training roadmap "${roadmap.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
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
          <TrainingRoadmapFilter
            majors={majors}
            query={query}
            onFilterChange={(filter) => dispatch(setFilter(filter))}
            onFilterClear={() => dispatch(setFilter({}))}
            onSearchChange={(searchQuery) =>
              dispatch(setSearchQuery(searchQuery))
            }
          />
        </div>{" "}
        <div className="bg-white rounded-lg shadow">
          <TrainingRoadmapTable
            expandedRows={expandedRows}
            isLoading={isLoading}
            roadmaps={Array.isArray(roadmaps) ? roadmaps : []}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onDelete={handleDeleteRoadmap}
            onEdit={handleEditRoadmap}
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
          batches={batches}
          isOpen={createModalOpen}
          isSubmitting={isCreateSubmitting}
          majors={majors}
          mode="create"
          onOpenChange={onCreateModalOpenChange}
          onSubmit={handleCreateSubmit}
        />
        {/* Modal for updating roadmap */}
        <TrainingRoadmapModal
          batches={batches}
          initialData={
            selectedRoadmap
              ? {
                  majorId: selectedRoadmap.majorId,
                  name: selectedRoadmap.name,
                  description: selectedRoadmap.description || "",
                  startYear: new Date().getFullYear(), // You might want to get this from the roadmap data
                  batchIds:
                    selectedRoadmap.batchDatas?.map((batch) => batch.id) || [],
                }
              : undefined
          }
          isOpen={updateModalOpen}
          isSubmitting={isUpdateSubmitting}
          majors={majors}
          mode="update"
          onOpenChange={onUpdateModalOpenChange}
          onSubmit={handleUpdateSubmit}
        />
      </div>
    </DefaultLayout>
  );
};

export default TrainingRoadmapPage;
