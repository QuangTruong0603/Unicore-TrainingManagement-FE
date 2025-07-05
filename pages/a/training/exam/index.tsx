import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, Input, Pagination, useDisclosure } from "@heroui/react";

import { ExamFilter } from "@/components/a/exam/exam-filter";
import { ExamModal } from "@/components/a/exam/exam-modal";
import { ExamTable } from "@/components/a/exam/exam-table";
import DefaultLayout from "@/layouts/default";
import { Exam } from "@/services/exam/exam.schema";
import { examService } from "@/services/exam/exam.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import {
  setExams,
  setError,
  setLoading,
  setQuery,
  setTotal,
} from "@/store/slices/examSlice";

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

export default function ExamSchedulePage() {
  const dispatch = useAppDispatch();
  const { exams, query, total, isLoading } = useAppSelector(
    (state: {
      exam: {
        exams: Exam[];
        query: any;
        total: number;
        isLoading: boolean;
      };
    }) => state.exam
  );

  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState<string>("");
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

  // Effect for handling debounced search
  useEffect(() => {
    const currentFilters = query.filters || {};

    dispatch(
      setQuery({
        ...query,
        filters: { ...currentFilters, name: debouncedSearchValue || undefined },
        pageNumber: 1,
      })
    );
  }, [debouncedSearchValue, dispatch]);
  useEffect(() => {
    const fetchExams = async () => {
      try {
        dispatch(setLoading(true));
        const response = await examService.getExams(query);

        dispatch(setExams(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchExams();
  }, [query, dispatch]);
  const onCreateSubmit = async (data: any) => {
    try {
      setIsCreateSubmitting(true);
      await examService.createExam(data);
      onCreateOpenChange();
      // Refetch exams after creating
      const response = await examService.getExams(query);

      dispatch(setExams(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch {
      // Error handling without console.error
    } finally {
      setIsCreateSubmitting(false);
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

  const handleRowToggle = (examId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  const handleDeleteExam = (exam: Exam) => {
    confirmDialog(
      async () => {
        try {
          dispatch(setLoading(true));
          await examService.deleteExam(exam.id);

          // Refresh the exams list after successful deletion
          const response = await examService.getExams(query);

          dispatch(setExams(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          dispatch(setError("Failed to delete exam"));
          // eslint-disable-next-line no-console
          console.error("Error deleting exam:", error);
        } finally {
          dispatch(setLoading(false));
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete this exam?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exam Schedule</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            variant="solid"
            onPress={onCreateOpen}
          >
            Create Exam
          </Button>
        </div>

        <div className="mb-6">
          {/* Search and filter container */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="pl-10 w-full rounded-xl"
                placeholder="Search exams..."
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
            <ExamFilter
              query={query}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <ExamTable
            exams={exams}
            expandedRows={expandedRows}
            isLoading={isLoading}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onDeleteExam={handleDeleteExam}
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

        {/* Create Exam Modal */}
        <ExamModal
          isOpen={isCreateOpen}
          isSubmitting={isCreateSubmitting}
          mode="create"
          onOpenChange={onCreateOpenChange}
          onSubmit={onCreateSubmit}
        />
      </div>
    </DefaultLayout>
  );
}
