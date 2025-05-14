import React from "react";
import { Button, Pagination } from "@heroui/react";
import { Plus, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { StudentTable } from "@/components/student/student-table";
import { StudentFilter } from "@/components/student/student-filter";
import { StudentModal } from "@/components/student/student-modal";
import { StudentImportModal } from "@/components/student/student-import-modal";
import { Student, StudentQuery } from "@/services/student/student.schema";
import { PaginatedResponse } from "@/store/slices/studentSlice";
import DefaultLayout from "@/layouts/default";
import { RootState, AppDispatch } from "@/store/store";
import {
  setStudents,
  setQuery,
  setTotal,
  setLoading,
  setError,
} from "@/store/slices/studentSlice";
import { studentService } from "@/services/student/student.service";

export default function StudentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    students,
    query,
    total,
    isLoading,
  } = useSelector((state: RootState) => state.student);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | undefined>();
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const fetchStudents = React.useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await studentService.getStudents(query) as unknown as PaginatedResponse;
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
    dispatch(setQuery({
      ...query,
      searchQuery,
      pageNumber: 1, // Reset to first page when searching
    }));
  };

  const handleSort = (key: string) => {
    dispatch(setQuery({
      ...query,
      by: key,
      isDesc: query.by === key ? !query.isDesc : false,
    }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setQuery({
      ...query,
      pageNumber: page,
    }));
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

  // const handleDelete = async (studentId: string) => {
  //   if (window.confirm("Are you sure you want to delete this student?")) {
  //     try {
  //       dispatch(setLoading(true));
  //       await studentService.deleteStudent(studentId);
  //       await fetchStudents(); // Refresh the list after deletion
  //     } catch (error: any) {
  //       dispatch(setError(error.message || "Failed to delete student"));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   }
  // };

  const handleSubmit = async (data: Partial<Student>) => {
    try {
      dispatch(setLoading(true));
      if (selectedStudent) {
        await studentService.updateStudent(selectedStudent.studentCode, data);
      } else {
        await studentService.createStudent(data);
      }
      await fetchStudents(); // Refresh the list after create/update
      setIsModalOpen(false);
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to save student"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleImport = async (file: File, batchId: string, majorId: string) => {
    try {
      dispatch(setLoading(true));
      await studentService.importStudents(file, batchId, majorId);
      await fetchStudents(); // Refresh the list after import
      setIsImportModalOpen(false);
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to import students"));
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
              variant="bordered"
              startContent={<Upload className="w-4 h-4" />}
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

        <div className="mb-6">
          <StudentFilter
            searchQuery={query.searchQuery || ""}
            onSearchChange={handleSearch}
          />
        </div>

        <StudentTable
          students={students || {
            success: true,
            data: {
              data: [],
              total: 0
            },
            errors: []
          }}
          isLoading={isLoading}
          expandedRows={expandedRows}
          sortKey={query.by || ""}
          sortDirection={query.isDesc ? "desc" : "asc"}
          onSort={handleSort}
          onRowToggle={handleRowToggle}
        />

        <div className="mt-4 flex justify-center">
          <Pagination
            page={query.pageNumber}
            total={Math.ceil(total / query.pageSize)}
            onChange={handlePageChange}
          />
        </div>

        <StudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          student={selectedStudent}
          isEdit={!!selectedStudent}
        />

        <StudentImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSubmit={handleImport}
        />
      </div>
    </DefaultLayout>
  );
} 