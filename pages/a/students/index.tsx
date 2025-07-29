/* eslint-disable padding-line-between-statements */
import React, { useEffect } from "react";
import { Button, Pagination, Input, addToast } from "@heroui/react";
import { Plus, Upload, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { StudentTable } from "@/components/a/student/student-table";
import { StudentFilter } from "@/components/a/student/student-filter";
import { StudentModal } from "@/components/a/student/student-modal";
import { StudentCreateModal } from "@/components/a/student/student-create-modal";
import { StudentImportModal } from "@/components/a/student/student-import-modal";
import { Student, StudentQuery } from "@/services/student/student.schema";
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
import { CreateStudentDto } from "@/services/student/student.dto";
import "./index.scss";

export default function StudentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { students, query, total, isLoading } = useSelector(
    (state: RootState) => state.student
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<
    Student | undefined
  >();
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [majors, setMajors] = React.useState<Major[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = React.useState(query.searchQuery || "");

  React.useEffect(() => {
    let isMounted = true;

    const fetchStudentsWithCleanup = async () => {
      try {
        dispatch(setLoading(true));
        const response = (await studentService.getStudents(
          query
        )) as unknown as PaginatedResponse;

        // Only update state if component is still mounted
        if (isMounted) {
          dispatch(setStudents(response));
        }
      } catch (error: any) {
        // Only set error if it's not a cancellation error and component is still mounted
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError" &&
          !error.message?.includes("canceled")
        ) {
          dispatch(setError(error.message || "Failed to fetch students"));
        }
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    fetchStudentsWithCleanup();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [query, dispatch]);

  const fetchStudents = async () => {
    try {
      dispatch(setLoading(true));
      const response = (await studentService.getStudents(
        query
      )) as unknown as PaginatedResponse;
      dispatch(setStudents(response));
    } catch (error: any) {
      // Only set error if it's not a cancellation error
      if (
        error instanceof Error &&
        error.name !== "CanceledError" &&
        !error.message?.includes("canceled")
      ) {
        dispatch(setError(error.message || "Failed to fetch students"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  // New handlers for unified filter
  const handleFilterChange = (newQuery: StudentQuery) => {
    dispatch(setQuery(newQuery));
  };

  const handleFilterClear = () => {
    setSearchQuery("");
    dispatch(
      setQuery({
        pageNumber: 1,
        pageSize: query.pageSize,
        total: 0,
        itemsPerpage: query.itemsPerpage,
        by: undefined,
        isDesc: false,
      })
    );
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    dispatch(
      setQuery({
        ...query,
        pageNumber: 1,
        searchQuery: search || undefined,
      })
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();

        if (isMounted) {
          setMajors(response.data);
        }
      } catch (error) {
        // Only log error if it's not a cancellation error and component is still mounted
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError" &&
          !error.message?.includes("canceled")
        ) {
          console.error("Error fetching majors:", error);
        }
      }
    };

    fetchMajors();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatches();
        if (isMounted) {
          setBatches(response.data);
        }
      } catch (error) {
        // Only log error if it's not a cancellation error and component is still mounted
        if (
          isMounted &&
          error instanceof Error &&
          error.name !== "CanceledError" &&
          !error.message?.includes("canceled")
        ) {
          console.error("Error fetching batches:", error);
        }
      }
    };

    fetchBatches();

    // Cleanup function
    return () => {
      isMounted = false;
    };
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
    setIsCreateModalOpen(true);
  };

  const handleCreateStudent = async (data: CreateStudentDto) => {
    try {
      dispatch(setLoading(true));
      const response = await studentService.createStudentWithDto(data);

      if (response.success) {
        addToast({
          title: "Success",
          description: `Student created successfully. Student Code: ${response.data.studentCode}, Email: ${response.data.email}`,
          color: "success",
        });
        await fetchStudents(); // Refresh the list after create
        setIsCreateModalOpen(false);
      } else {
        throw new Error(
          response.errors?.join(", ") || "Failed to create student"
        );
      }
    } catch (error: any) {
      // Only show error if it's not a cancellation error
      if (
        error instanceof Error &&
        error.name !== "CanceledError" &&
        !error.message?.includes("canceled")
      ) {
        dispatch(setError(error.message || "Failed to create student"));
        addToast({
          title: "Error",
          description: error.message || "Failed to create student",
          color: "danger",
        });
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    dispatch(
      openConfirmDialog({
        title: "Delete Student",
        message:
          "Are you sure you want to delete this student? This action cannot be undone.",
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
            // Only show error if it's not a cancellation error
            if (
              error instanceof Error &&
              error.name !== "CanceledError" &&
              !error.message?.includes("canceled")
            ) {
              dispatch(setError(error.message || "Failed to delete student"));
              addToast({
                title: "Error",
                description: error.message || "Failed to delete student",
                color: "danger",
              });
            }
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
      await studentService.updateStudent(selectedStudent!.id, payload);
      addToast({
        title: "Success",
        description: "Student updated successfully",
        color: "success",
      });
      await fetchStudents(); // Refresh the list after update
      setIsModalOpen(false);
    } catch (error: any) {
      // Only show error if it's not a cancellation error
      if (
        error instanceof Error &&
        error.name !== "CanceledError" &&
        !error.message?.includes("canceled")
      ) {
        dispatch(setError(error.message || "Failed to update student"));
        addToast({
          title: "Error",
          description: error.message || "Failed to update student",
          color: "danger",
        });
      }
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
      // Only show error if it's not a cancellation error
      if (
        error instanceof Error &&
        error.name !== "CanceledError" &&
        !error.message?.includes("canceled")
      ) {
        dispatch(setError(error.message || "Failed to import students"));
        addToast({
          title: "Error",
          description: error.message || "Failed to import students",
          color: "danger",
        });
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBatchCreated = (newBatch: Batch) => {
    // Add the new batch to the batches list
    setBatches((prev) => [...prev, newBatch]);
    addToast({
      title: "Success",
      description: `Batch "${newBatch.title}" created successfully`,
      color: "success",
    });
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
        </div>{" "}
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
          <div className="flex-1 relative">
            <Input
              className="w-full"
              placeholder="Search students by name, email, or student code..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <StudentFilter
              batches={batches}
              majors={majors}
              query={query}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
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
        <div className="mt-4 flex justify-end">
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
        <StudentCreateModal
          batches={batches}
          isOpen={isCreateModalOpen}
          majors={majors}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateStudent}
        />
        <StudentImportModal
          batches={batches}
          isOpen={isImportModalOpen}
          majors={majors}
          onBatchCreated={handleBatchCreated}
          onClose={() => setIsImportModalOpen(false)}
          onSubmit={handleImport}
        />
        <ConfirmDialog />
      </div>
    </DefaultLayout>
  );
}
