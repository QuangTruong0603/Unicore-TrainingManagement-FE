/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Button,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
} from "@heroui/react";
import { Plus, Upload, Download, MoreVertical } from "lucide-react";

import DefaultLayout from "../../../layouts/default";

import { LecturerTable } from "@/components/a/lecturer/lecturer-table";
import { LecturerModal } from "@/components/a/lecturer/lecturer-modal";
import { LecturerFilter } from "@/components/a/lecturer/lecturer-filter";
import { Lecturer } from "@/services/lecturer/lecturer.schema";
import { Department } from "@/services/department/department.schema";
import { RootState } from "@/store";
import {
  setQuery,
  setLecturers,
  setTotal,
  setLoading,
  setError,
} from "@/store/slices/lecturerSlice";
import { lecturerService } from "@/services/lecturer/lecturer.service";
import { departmentService } from "@/services/department/department.service";
import { openConfirmDialog } from "@/store/slices/confirmDialogSlice";
import ConfirmDialog from "@/components/ui/confirm-dialog/confirm-dialog";

import "./index.scss";

export default function LecturersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
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
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch lecturers when query changes
  useEffect(() => {
    fetchLecturers();
  }, [query]);

  // Fetch departments only once when component mounts
  useEffect(() => {
    fetchDepartments();
  }, []);

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
      const response = await departmentService.getDepartments();

      setDepartments(response.data);
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

  const handleDepartmentChange = (departmentId: string) => {
    dispatch(
      setQuery({
        ...query,
        departmentId: departmentId === "" ? undefined : departmentId,
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

  const handleEditLecturer = async (lecturer: Lecturer) => {
    console.log("143", lecturer);
    try {
      dispatch(setLoading(true));
      // Fetch the full lecturer data by ID
      const response = await lecturerService.getLecturerById(lecturer.id);

      setIsEdit(true);
      setSelectedLecturer(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching lecturer details:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch lecturer details. Please try again.",
        color: "danger",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewDetail = (lecturer: Lecturer) => {
    console.log("167", lecturer.id);
    router.push(`/a/lecturers/profile/${lecturer.applicationUser.email}`);
  };

  const handleDeleteLecturer = (lecturerId: string, lecturerName: string) => {
    dispatch(
      openConfirmDialog({
        title: "Delete Lecturer",
        message: `Are you sure you want to delete lecturer "${lecturerName}"?`,
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: async () => {
          try {
            await lecturerService.deleteLecturer(lecturerId);
            addToast({
              title: "Success",
              description: `Lecturer "${lecturerName}" has been deleted successfully.`,
              color: "success",
            });
            fetchLecturers();
          } catch (error) {
            console.error("Error deleting lecturer:", error);
            addToast({
              title: "Error",
              description: "Failed to delete lecturer. Please try again.",
              color: "danger",
            });
          }
        },
      })
    );
  };

  const handleModalSubmit = async (data: Partial<Lecturer>) => {
    console.log("200", data);
    try {
      if (isEdit && selectedLecturer) {
        console.log("194", selectedLecturer);
        const response = await lecturerService.updateLecturer(
          selectedLecturer.id,
          data
        );

        if (response.success) {
          addToast({
            title: "Success",
            description: "Lecturer has been updated successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Error",
            description: response.errors[0],
            color: "danger",
          });
        }
      } else {
        const response = await lecturerService.createLecturer(data);

        if (response.success) {
          addToast({
            title: "Success",
            description: "New lecturer has been created successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Error",
            description: response.errors[0],
            color: "danger",
          });
        }
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
      <div className="lecturer-container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lecturer Management</h1>
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="flat">
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
          departmentId={query.departmentId}
          departments={departments}
          searchQuery={query.searchQuery || ""}
          onDepartmentChange={handleDepartmentChange}
          onSearchChange={handleSearchChange}
        />

        <div className="bg-white rounded-lg shadow">
          {lecturers && (
            <LecturerTable
              expandedRows={expandedRows}
              isLoading={isLoading}
              lecturers={lecturers}
              sortDirection={query.isDesc ? "desc" : "asc"}
              sortKey={query.by || ""}
              onDelete={handleDeleteLecturer}
              onEdit={handleEditLecturer}
              onRowToggle={handleRowToggle}
              onSort={handleSort}
              onViewDetail={handleViewDetail}
            />
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Pagination
            page={query.pageNumber}
            total={totalPages}
            onChange={handlePageChange}
          />
        </div>

        <LecturerModal
          departments={departments}
          isEdit={isEdit}
          isOpen={isModalOpen}
          lecturer={selectedLecturer}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />

        <ConfirmDialog />
      </div>
    </DefaultLayout>
  );
}
