import { useState } from "react";
import { Button, Pagination, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";

import DefaultLayout from "@/layouts/default";
import { SemesterTable } from "@/components/a/semester/semester-table";
import { SemesterFilterComponent } from "@/components/a/semester/semester-filter";
import { SemesterModal } from "@/components/a/semester/semester-modal";
import { SemesterQuery, Semester } from "@/services/semester/semester.schema";
import {
  CreateSemesterData,
  UpdateSemesterData,
} from "@/services/semester/semester.dto";
import {
  useSemesters,
  useCreateSemester,
  useUpdateSemester,
  useActivateSemester,
  useDeactivateSemester,
} from "@/services/semester/semester.hooks";
import "./index.scss";

export default function SemestersPage() {
  // Modal control states
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();

  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "update">("create");

  // Table states
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = useState<string>("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Query states
  const [query, setQuery] = useState<SemesterQuery>({
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "year",
    isDesc: true,
  });

  // Fetch semesters
  const { data: semestersData, isLoading, refetch } = useSemesters(query);

  // Mutations
  const createSemester = useCreateSemester();
  const updateSemester = useUpdateSemester();
  const activateSemester = useActivateSemester();
  const deactivateSemester = useDeactivateSemester();

  // Sort handlers
  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Toggle sort direction if clicking the same column
      const newDirection = sortDirection === "asc" ? "desc" : "asc";

      setSortDirection(newDirection);
      setQuery({
        ...query,
        orderBy: key,
        isDesc: newDirection === "desc",
      });
    } else {
      // Set new sort key and default to ascending
      setSortKey(key);
      setSortDirection("asc");
      setQuery({
        ...query,
        orderBy: key,
        isDesc: false,
      });
    }
  };

  // Row expansion handler
  const handleRowToggle = (semesterId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  // Modal handlers
  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedSemester(null);
    onModalOpen();
  };

  const handleEditClick = (semester: Semester) => {
    setModalMode("update");
    setSelectedSemester(semester);
    onModalOpen();
  };

  // Form submission handlers
  const handleSubmit = async (
    data: CreateSemesterData | UpdateSemesterData
  ) => {
    try {
      if (modalMode === "create") {
        await createSemester.mutateAsync(data as CreateSemesterData);
      } else if (modalMode === "update" && selectedSemester) {
        await updateSemester.mutateAsync({
          id: selectedSemester.id,
          data: data as UpdateSemesterData,
        });
      }
      refetch();
    } catch (error) {
      console.error("Error submitting semester:", error);
    }
  };

  // Toggle semester active status
  const handleActiveToggle = async (semester: Semester) => {
    try {
      if (semester.isActive) {
        await deactivateSemester.mutateAsync(semester.id);
      } else {
        await activateSemester.mutateAsync(semester.id);
      }
      refetch();
    } catch (error) {
      console.error("Error toggling semester status:", error);
    }
  };

  // Filter handlers
  const handleFilterChange = (newQuery: SemesterQuery) => {
    setQuery(newQuery);
  };

  const handleFilterClear = () => {
    setQuery({
      ...query,
      filters: undefined,
    });
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setQuery({
      ...query,
      pageNumber: page,
    });
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Semester Management</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={handleCreateClick}
          >
            Add Semester
          </Button>
        </div>

        <SemesterFilterComponent
          query={query}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
        />

        <SemesterTable
          expandedRows={expandedRows}
          isLoading={isLoading}
          semesters={semestersData?.data.data || []}
          sortDirection={sortDirection}
          sortKey={sortKey}
          onActiveToggle={handleActiveToggle}
          onEdit={handleEditClick}
          onRowToggle={handleRowToggle}
          onSort={handleSort}
        />

        {semestersData && semestersData.data.total > 1 && (
          <div className="flex justify-end py-4">
            <Pagination
              initialPage={query.pageNumber}
              // total={semestersData.data.total}
              total={Math.ceil(
                semestersData.data.total / semestersData.data.pageSize
              )}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <SemesterModal
        isOpen={isModalOpen}
        isSubmitting={
          modalMode === "create"
            ? createSemester.isPending
            : updateSemester.isPending
        }
        mode={modalMode}
        semester={selectedSemester}
        onOpenChange={onModalOpenChange}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}
