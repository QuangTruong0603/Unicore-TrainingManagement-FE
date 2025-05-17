/* eslint-disable padding-line-between-statements */
import React, { useEffect } from "react";
import {
  Button,
  Pagination,
  Autocomplete,
  AutocompleteItem,
  addToast,
} from "@heroui/react";
import { Plus, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { StudentTable } from "@/components/student/student-table";
import { StudentFilter } from "@/components/student/student-filter";
import { StudentModal } from "@/components/student/student-modal";
import { StudentImportModal } from "@/components/student/student-import-modal";
import { Student } from "@/services/student/student.schema";
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";
import { batchService } from "@/services/batch/batch.service";
import { majorService } from "@/services/major/major.service";
import { PaginatedResponse } from "@/store/slices/studentSlice";
import DefaultLayout from "@/layouts/default";
import { RootState, AppDispatch } from "@/store/store";
import ConfirmDialog from "@/components/ui/confirm-dialog/confirm-dialog";
import { openConfirmDialog } from "@/store/slices/confirmDialogSlice";
import {
  setStudents,
  setQuery,
  setLoading,
  setError,
} from "@/store/slices/studentSlice";
import { studentService } from "@/services/student/student.service";

// Add useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function StudentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { students, query, total, isLoading } = useSelector(
    (state: RootState) => state.student
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<
    Student | undefined
  >();
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [majors, setMajors] = React.useState<Major[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);

  // Add local states for immediate UI updates
  const [localBatchId, setLocalBatchId] = React.useState(query.batchId || "");
  const [localMajorId, setLocalMajorId] = React.useState(query.majorId || "");
  const [localSearch, setLocalSearch] = React.useState(query.searchQuery || "");

  // Debounce the values
  const debouncedBatchId = useDebounce(localBatchId, 300);
  const debouncedMajorId = useDebounce(localMajorId, 300);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Update query when debounced values change
  React.useEffect(() => {
    dispatch(
      setQuery({
        ...query,
        batchId: debouncedBatchId || undefined,
        pageNumber: 1,
      })
    );
  }, [debouncedBatchId]);

  React.useEffect(() => {
    dispatch(
      setQuery({
        ...query,
        majorId: debouncedMajorId || undefined,
        pageNumber: 1,
      })
    );
  }, [debouncedMajorId]);

  React.useEffect(() => {
    dispatch(
      setQuery({
        ...query,
        searchQuery: debouncedSearch,
        pageNumber: 1,
      })
    );
  }, [debouncedSearch]);

  const fetchStudents = React.useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = (await studentService.getStudents(
        query
      )) as unknown as PaginatedResponse;
      dispatch(setStudents(response));
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch students"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, query]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (searchQuery: string) => {
    setLocalSearch(searchQuery);
  };

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        setMajors(response.data);
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatches();
        setBatches(response.data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, []);

  const handleSort = (key: string) => {
    dispatch(
      setQuery({
        ...query,
        by: key,
        isDesc: query.by === key ? !query.isDesc : false,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(
      setQuery({
        ...query,
        pageNumber: page,
      })
    );
  };

  const handleRowToggle = (studentId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleCreate = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    dispatch(
      openConfirmDialog({
        title: "Delete Student",
        message: "Are you sure you want to delete this student? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: async () => {
          try {
            dispatch(setLoading(true));
            await studentService.deleteStudent(studentId);
            addToast({
              title: "Success",
              description: "Student deleted successfully",
              color: "success",
            });
            await fetchStudents(); // Refresh the list after deletion
          } catch (error: any) {
            dispatch(setError(error.message || "Failed to delete student"));
            addToast({
              title: "Error",
              description: error.message || "Failed to delete student",
              color: "danger",
            });
          } finally {
            dispatch(setLoading(false));
          }
        },
      })
    );
  };

  const handleSubmit = async (data: Partial<Student>) => {
    try {
      dispatch(setLoading(true));
      if (selectedStudent) {
        // Prepare payload for edit API
        const payload = {
          accumulateCredits: data.accumulateCredits ?? 0,
          accumulateScore: data.accumulateScore ?? 0,
          accumulateActivityScore: data.accumulateActivityScore ?? 0,
          majorId: data.majorId,
          batchId: data.batchId,
          firstName: data.applicationUser?.firstName,
          lastName: data.applicationUser?.lastName,
          personId: data.applicationUser?.personId,
          dob: data.applicationUser?.dob,
          phoneNumber: data.applicationUser?.phoneNumber,
          status: data.applicationUser?.status,
        };
        await studentService.updateStudent(selectedStudent.id, payload);
        addToast({
          title: "Success",
          description: "Student updated successfully",
          color: "success",
        });
      } else {
        await studentService.createStudent(data);
        addToast({
          title: "Success",
          description: "Student created successfully",
          color: "success",
        });
      }
      await fetchStudents(); // Refresh the list after create/update
      setIsModalOpen(false);
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to save student"));
      addToast({
        title: "Error",
        description: error.message || "Failed to save student",
        color: "danger",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleImport = async (file: File, batchId: string, majorId: string) => {
    try {
      dispatch(setLoading(true));
      await studentService.importStudents(file, batchId, majorId);
      addToast({
        title: "Success",
        description: "Students imported successfully",
        color: "success",
      });
      await fetchStudents(); // Refresh the list after import
      setIsImportModalOpen(false);
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to import students"));
      addToast({
        title: "Error",
        description: error.message || "Failed to import students",
        color: "danger",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<Upload className="w-4 h-4" />}
              variant="bordered"
              onPress={() => setIsImportModalOpen(true)}
            >
              Import
            </Button>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleCreate}
            >
              Add Student
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-1/4 w-full">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="batch-input"
            >
              Batch
            </label>
            <Autocomplete
              allowsCustomValue={false}
              className="w-full"
              defaultItems={batches}
              placeholder="Search and select a batch"
              selectedKey={localBatchId}
              variant="bordered"
              onSelectionChange={(key) => {
                setLocalBatchId(key?.toString() || "");
              }}
            >
              {(batch) => (
                <AutocompleteItem
                  key={batch.id}
                  textValue={
                    batch.title
                      ? `${batch.title} - ${batch.startYear}`
                      : batch.title
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {batch.title || "No title"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {batch.startYear}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <div className="md:w-1/4 w-full">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="major-input"
            >
              Major
            </label>
            <Autocomplete
              allowsCustomValue={false}
              className="w-full"
              defaultItems={majors}
              placeholder="Search and select a major"
              selectedKey={localMajorId}
              variant="bordered"
              onSelectionChange={(key) => {
                setLocalMajorId(key?.toString() || "");
              }}
            >
              {(major) => (
                <AutocompleteItem
                  key={major.id}
                  textValue={`${major.name} - ${major.code}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{major.name}</span>
                    <span className="text-xs text-gray-500">{major.code}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <div className="md:w-2/4 w-full flex flex-col justify-end">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 invisible"
              htmlFor="search-input"
            >
              Search
            </label>
            <StudentFilter
              searchQuery={localSearch || ""}
              onSearchChange={handleSearch}
            />
          </div>
        </div>

        <StudentTable
          expandedRows={expandedRows}
          isLoading={isLoading}
          sortDirection={query.isDesc ? "desc" : "asc"}
          sortKey={query.by || ""}
          students={
            students || {
              success: true,
              data: {
                data: [],
                total: 0,
              },
              errors: [],
            }
          }
          onDelete={handleDelete}
          onEdit={handleEdit}
          onRowToggle={handleRowToggle}
          onSort={handleSort}
        />

        <div className="mt-4 flex justify-center">
          <Pagination
            page={query.pageNumber}
            total={Math.ceil(total / query.pageSize)}
            onChange={handlePageChange}
          />
        </div>

        <StudentModal
          batches={batches}
          isEdit={!!selectedStudent}
          isOpen={isModalOpen}
          majors={majors}
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />

        <StudentImportModal
          batches={batches}
          isOpen={isImportModalOpen}
          majors={majors}
          onClose={() => setIsImportModalOpen(false)}
          onSubmit={handleImport}
        />

        <ConfirmDialog />
      </div>
    </DefaultLayout>
  );
}
