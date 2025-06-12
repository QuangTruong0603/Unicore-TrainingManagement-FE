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
  updateRoadmapStatus,
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

  // State for form submission
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  // Fetch majors and batches on component mount

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        setMajors(response.data || []);
      } catch (error) {
        console.error("Failed to fetch majors:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatches();

        setBatches(response.data || []);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      }
    };

    fetchMajors();
    fetchBatches();
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
            onActiveToggle={handleActiveToggle}
            onDelete={handleDeleteRoadmap}
            onEdit={(roadmap) => {
              console.log("Edit roadmap requested:", roadmap);
            }}
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
      </div>
    </DefaultLayout>
  );
};

export default TrainingRoadmapPage;
