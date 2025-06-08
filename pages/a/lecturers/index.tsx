import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Plus, Upload, Download, MoreVertical } from "lucide-react";

import DefaultLayout from "../../../layouts/default";

import { LecturerTable } from "@/components/a/lecturer/lecturer-table";
import { LecturerModal } from "@/components/a/lecturer/lecturer-modal";
import { LecturerFilter } from "@/components/a/lecturer/lecturer-filter";
import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { RootState } from "@/store";
import {
  setQuery,
  setLecturers,
  setTotal,
  setLoading,
  setError,
} from "@/store/slices/lecturerSlice";
import { lecturerService } from "@/services/lecturer/lecturer.service";

import "./index.scss";

export default function LecturersPage() {
  const dispatch = useDispatch();
  const { query, isLoading } = useSelector(
    (state: RootState) => state.lecturer
  );
  const lecturers = useSelector((state: RootState) => state.lecturer.lecturers);
  const total = useSelector((state: RootState) => state.lecturer.total);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<
    Lecturer | undefined
  >(undefined);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchLecturers();
    fetchDepartments();
  }, [query]);

  const fetchLecturers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await lecturerService.getLecturers(query);

      // Now the types should match correctly
      dispatch(setLecturers(response));
      dispatch(setTotal(response.data.total));
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      dispatch(setError("Failed to fetch lecturers"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchDepartments = async () => {
    try {
      // Fetch departments from your API
      // const response = await departmentService.getDepartments();
      // setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSearchChange = (searchQuery: string) => {
    dispatch(
      setQuery({
        ...query,
        searchQuery,
        pageNumber: 1,
      })
    );
  };

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

  const handleRowToggle = (lecturerId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [lecturerId]: !prev[lecturerId],
    }));
  };

  const handleAddLecturer = () => {
    setIsEdit(false);
    setSelectedLecturer(undefined);
    setIsModalOpen(true);
  };

  const handleEditLecturer = (lecturer: Lecturer) => {
    setIsEdit(true);
    setSelectedLecturer(lecturer);
    setIsModalOpen(true);
  };

  const handleDeleteLecturer = async (lecturerId: string) => {
    try {
      await lecturerService.deleteLecturer(lecturerId);
      fetchLecturers();
    } catch (error) {
      console.error("Error deleting lecturer:", error);
    }
  };

  const handleModalSubmit = async (data: Partial<Lecturer>) => {
    try {
      if (isEdit && selectedLecturer) {
        await lecturerService.updateLecturer(
          selectedLecturer.lecturerCode,
          data
        );
      } else {
        await lecturerService.createLecturer(data);
      }
      setIsModalOpen(false);
      fetchLecturers();
    } catch (error) {
      console.error("Error submitting lecturer data:", error);
    }
  };

  const totalPages = Math.ceil(total / query.itemsPerpage);

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lecturer Management</h1>
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" isIconOnly>
                  <MoreVertical size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Actions">
                <DropdownItem key="import" startContent={<Upload size={16} />}>
                  Import Lecturers
                </DropdownItem>
                <DropdownItem
                  key="export"
                  startContent={<Download size={16} />}
                >
                  Export Lecturers
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              startContent={<Plus size={20} />}
              onClick={handleAddLecturer}
            >
              Add Lecturer
            </Button>
          </div>
        </div>

        <LecturerFilter
          searchQuery={query.searchQuery || ""}
          onSearchChange={handleSearchChange}
        />

        <div className="bg-white rounded-lg shadow">
          {lecturers && (
            <LecturerTable
              lecturers={lecturers}
              isLoading={isLoading}
              sortKey={query.by || ""}
              sortDirection={query.isDesc ? "desc" : "asc"}
              expandedRows={expandedRows}
              onSort={handleSort}
              onEdit={handleEditLecturer}
              onDelete={handleDeleteLecturer}
              onRowToggle={handleRowToggle}
            />
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              page={query.pageNumber}
              total={totalPages}
              onChange={handlePageChange}
            />
          </div>
        )}

        <LecturerModal
          isOpen={isModalOpen}
          isEdit={isEdit}
          lecturer={selectedLecturer}
          departments={departments}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      </div>
    </DefaultLayout>
  );
}
