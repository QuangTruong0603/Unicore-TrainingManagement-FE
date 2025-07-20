import { useEffect, useState, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import {
  Input,
  Pagination,
  Tab,
  Tabs,
  Button,
  useDisclosure,
} from "@heroui/react";

import { DepartmentTable } from "@/components/a/major/department-table";
import { DepartmentModal } from "@/components/a/major/department-modal";
import { MajorGroupTable } from "@/components/a/major/major-group-table";
import { MajorGroupModal } from "@/components/a/major/major-group-modal";
import { MajorTable } from "@/components/a/major/major-table";
import { MajorModal } from "@/components/a/major/major-modal";
import DefaultLayout from "@/layouts/default";
import { useDepartments } from "@/services/department/department.hooks";
import { useMajorGroups } from "@/services/major-group/major-group.hooks";
import { useMajors } from "@/services/major/major.hooks";
import { majorService } from "@/services/major/major.service";
import { majorGroupService } from "@/services/major-group/major-group.service";
import { departmentService } from "@/services/department/department.service";
import { useAppDispatch } from "@/store/hooks";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { setQuery as setDepartmentQuery } from "@/store/slices/departmentSlice";
import { setQuery as setMajorGroupQuery } from "@/store/slices/majorGroupSlice";
import { setQuery as setMajorQuery } from "@/store/slices/majorSlice";
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

export default function MajorPage() {
  const dispatch = useAppDispatch();

  // Tab state
  const [activeTab, setActiveTab] = useState("majors");

  // Modal state for different entity types
  const {
    isOpen: isMajorModalOpen,
    onOpen: onMajorModalOpen,
    onOpenChange: onMajorModalChange,
  } = useDisclosure();
  const [isMajorSubmitting, setIsMajorSubmitting] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [majorModalMode, setMajorModalMode] = useState<"create" | "update">("create");

  const {
    isOpen: isMajorGroupModalOpen,
    onOpen: onMajorGroupModalOpen,
    onOpenChange: onMajorGroupModalChange,
  } = useDisclosure();
  const [isMajorGroupSubmitting, setIsMajorGroupSubmitting] = useState(false);
  const [selectedMajorGroup, setSelectedMajorGroup] = useState<any>(null);
  const [majorGroupModalMode, setMajorGroupModalMode] = useState<"create" | "update">("create");

  const {
    isOpen: isDepartmentModalOpen,
    onOpen: onDepartmentModalOpen,
    onOpenChange: onDepartmentModalChange,
  } = useDisclosure();
  const [isDepartmentSubmitting, setIsDepartmentSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [departmentModalMode, setDepartmentModalMode] = useState<"create" | "update">("create");

  const { confirmDialog } = useConfirmDialog();

  // Function to get the add button label based on activeTab
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case "majors":
        return "Add Major";
      case "majorGroups":
        return "Add Major Group";
      case "departments":
        return "Add Department";
      default:
        return "Add";
    }
  };

  // Function to handle add button click based on activeTab
  const handleAddButtonClick = () => {
    switch (activeTab) {
      case "majors":
        setSelectedMajor(null);
        setMajorModalMode("create");
        onMajorModalOpen();
        break;
      case "majorGroups":
        setSelectedMajorGroup(null);
        setMajorGroupModalMode("create");
        onMajorGroupModalOpen();
        break;
      case "departments":
        setSelectedDepartment(null);
        setDepartmentModalMode("create");
        onDepartmentModalOpen();
        break;
    }
  };

  // Major state and hooks
  const {
    majors,
    query: majorQuery,
    total: majorTotal,
    isLoading: isMajorLoading,
    fetchMajors,
    createMajor,
    activateMajor,
    deactivateMajor,
    deleteMajor,
  } = useMajors();

  const [majorSearchInput, setMajorSearchInput] = useState(
    () => majorQuery.searchQuery || ""
  );

  const debouncedMajorSearch = useDebounce<string>(majorSearchInput, 600);

  // MajorGroup state and hooks
  const {
    majorGroups,
    query: majorGroupQuery,
    total: majorGroupTotal,
    isLoading: isMajorGroupLoading,
    fetchMajorGroups,
    createMajorGroup,
    activateMajorGroup,
    deactivateMajorGroup,
    deleteMajorGroup,
  } = useMajorGroups();

  const [majorGroupSearchInput, setMajorGroupSearchInput] = useState(
    () => majorGroupQuery.searchQuery || ""
  );
  const debouncedMajorGroupSearch = useDebounce<string>(
    majorGroupSearchInput,
    600
  );

  // Department state and hooks
  const {
    departments,
    query: departmentQuery,
    total: departmentTotal,
    isLoading: isDepartmentLoading,
    fetchDepartments,
    createDepartment,
    activateDepartment,
    deactivateDepartment,
    deleteDepartment,
  } = useDepartments();

  const [departmentSearchInput, setDepartmentSearchInput] = useState(
    () => departmentQuery.searchQuery || ""
  );
  const debouncedDepartmentSearch = useDebounce<string>(
    departmentSearchInput,
    600
  );

  // Fetch data on mount based on active tab
  useEffect(() => {
    if (activeTab === "majors") {
      fetchMajors();
    } else if (activeTab === "majorGroups") {
      fetchMajorGroups();
    } else if (activeTab === "departments") {
      fetchDepartments();
    }
  }, [activeTab, fetchMajors, fetchMajorGroups, fetchDepartments]);

  // Effect for handling debounced major search
  useEffect(() => {
    const newQuery = {
      ...majorQuery,
      searchQuery: debouncedMajorSearch,
      pageNumber: 1,
    };

    if (debouncedMajorSearch !== majorQuery.searchQuery) {
      dispatch(setMajorQuery(newQuery));
    }
  }, [debouncedMajorSearch]);

  // Effect for handling debounced major group search
  useEffect(() => {
    const newQuery = {
      ...majorGroupQuery,
      searchQuery: debouncedMajorGroupSearch,
      pageNumber: 1,
    };

    if (debouncedMajorGroupSearch !== majorGroupQuery.searchQuery) {
      dispatch(setMajorGroupQuery(newQuery));
    }
  }, [debouncedMajorGroupSearch]);

  // Effect for handling debounced department search
  useEffect(() => {
    const newQuery = {
      ...departmentQuery,
      searchQuery: debouncedDepartmentSearch,
      pageNumber: 1,
    };

    if (debouncedDepartmentSearch !== departmentQuery.searchQuery) {
      dispatch(setDepartmentQuery(newQuery));
    }
  }, [debouncedDepartmentSearch]);

  // Major handlers
  const handleMajorSort = useCallback(
    (key: string) => {
      // Handle nested object properties for sorting
      const orderByKey = key.includes(".") ? key.split(".")[0] : key;

      dispatch(
        setMajorQuery({
          ...majorQuery,
          orderBy: orderByKey,
          isDesc:
            majorQuery.orderBy === orderByKey ? !majorQuery.isDesc : false,
        })
      );
    },
    [dispatch, majorQuery]
  );

  const handleMajorPageChange = useCallback(
    (page: number) => {
      dispatch(setMajorQuery({ ...majorQuery, pageNumber: page }));
    },
    [dispatch, majorQuery]
  );

  // Major Group handlers
  const handleMajorGroupSort = useCallback(
    (key: string) => {
      // Handle nested object properties for sorting
      const orderByKey = key.includes(".") ? key.split(".")[0] : key;

      dispatch(
        setMajorGroupQuery({
          ...majorGroupQuery,
          orderBy: orderByKey,
          isDesc:
            majorGroupQuery.orderBy === orderByKey
              ? !majorGroupQuery.isDesc
              : false,
        })
      );
    },
    [dispatch, majorGroupQuery]
  );

  const handleMajorGroupPageChange = useCallback(
    (page: number) => {
      dispatch(setMajorGroupQuery({ ...majorGroupQuery, pageNumber: page }));
    },
    [dispatch, majorGroupQuery]
  );

  // Department handlers
  const handleDepartmentSort = useCallback(
    (key: string) => {
      // Handle nested object properties for sorting
      const orderByKey = key.includes(".") ? key.split(".")[0] : key;

      dispatch(
        setDepartmentQuery({
          ...departmentQuery,
          orderBy: orderByKey,
          isDesc:
            departmentQuery.orderBy === orderByKey
              ? !departmentQuery.isDesc
              : false,
        })
      );
    },
    [dispatch, departmentQuery]
  );

  const handleDepartmentPageChange = useCallback(
    (page: number) => {
      dispatch(setDepartmentQuery({ ...departmentQuery, pageNumber: page }));
    },
    [dispatch, departmentQuery]
  );
  
  // Update handlers
  const handleMajorUpdate = (major: any) => {
    setSelectedMajor(major);
    setMajorModalMode("update");
    onMajorModalOpen();
  };

  const handleMajorGroupUpdate = (majorGroup: any) => {
    setSelectedMajorGroup(majorGroup);
    setMajorGroupModalMode("update");
    onMajorGroupModalOpen();
  };

  const handleDepartmentUpdate = (department: any) => {
    setSelectedDepartment(department);
    setDepartmentModalMode("update");
    onDepartmentModalOpen();
  };

  // Delete handlers
  const handleMajorDelete = (major: any) => {
    confirmDialog(
      async () => {
        try {
          await deleteMajor(major.id);
          // Refresh will be handled by the hook
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error deleting major:", error);
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the major "${major.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  const handleMajorGroupDelete = (majorGroup: any) => {
    confirmDialog(
      async () => {
        try {
          await deleteMajorGroup(majorGroup.id);
          // Refresh will be handled by the hook
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error deleting major group:", error);
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the major group "${majorGroup.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  const handleDepartmentDelete = (department: any) => {
    confirmDialog(
      async () => {
        try {
          await deleteDepartment(department.id);
          // Refresh will be handled by the hook
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error deleting department:", error);
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the department "${department.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };
  
  // No helper function needed

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Majors Management</h1>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={handleAddButtonClick}
          >
            {getAddButtonLabel()}
          </Button>
        </div>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab key="majors" title="Majors">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Input
                    className="pl-10 w-full rounded-xl"
                    placeholder="Search majors..."
                    value={majorSearchInput}
                    onChange={(e) => setMajorSearchInput(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  {majorSearchInput !== debouncedMajorSearch && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <MajorTable
                isLoading={isMajorLoading}
                majors={majors}
                sortDirection={majorQuery.isDesc ? "desc" : "asc"}
                sortKey={majorQuery.orderBy}
                onDeleteMajor={handleMajorDelete}
                onUpdateMajor={handleMajorUpdate}
                onSort={handleMajorSort}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination
                page={majorQuery.pageNumber}
                total={Math.ceil(majorTotal / majorQuery.itemsPerpage)}
                onChange={handleMajorPageChange}
              />
            </div>
          </Tab>

          <Tab key="majorGroups" title="Major Groups">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Input
                    className="pl-10 w-full rounded-xl"
                    placeholder="Search major groups..."
                    value={majorGroupSearchInput}
                    onChange={(e) => setMajorGroupSearchInput(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  {majorGroupSearchInput !== debouncedMajorGroupSearch && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <MajorGroupTable
                isLoading={isMajorGroupLoading}
                majorGroups={majorGroups}
                sortDirection={majorGroupQuery.isDesc ? "desc" : "asc"}
                sortKey={majorGroupQuery.orderBy}
                onDeleteMajorGroup={handleMajorGroupDelete}
                onUpdateMajorGroup={handleMajorGroupUpdate}
                onSort={handleMajorGroupSort}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination
                page={majorGroupQuery.pageNumber}
                total={Math.ceil(
                  majorGroupTotal / majorGroupQuery.itemsPerpage
                )}
                onChange={handleMajorGroupPageChange}
              />
            </div>
          </Tab>

          <Tab key="departments" title="Departments">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Input
                    className="pl-10 w-full rounded-xl"
                    placeholder="Search departments..."
                    value={departmentSearchInput}
                    onChange={(e) => setDepartmentSearchInput(e.target.value)}
                  />                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  {departmentSearchInput !== debouncedDepartmentSearch && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <DepartmentTable
                departments={departments}
                isLoading={isDepartmentLoading}
                sortDirection={departmentQuery.isDesc ? "desc" : "asc"}
                sortKey={departmentQuery.orderBy}
                onCreateDepartment={createDepartment}
                onDeleteDepartment={handleDepartmentDelete}
                onUpdateDepartment={handleDepartmentUpdate}
                onSort={handleDepartmentSort}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Pagination
                page={departmentQuery.pageNumber}
                total={Math.ceil(
                  departmentTotal / departmentQuery.itemsPerpage
                )}
                onChange={handleDepartmentPageChange}
              />
            </div>
          </Tab>
        </Tabs>

        {/* Modals */}
        <MajorModal
          isOpen={isMajorModalOpen}
          isSubmitting={isMajorSubmitting}
          mode={majorModalMode}
          major={selectedMajor}
          onOpenChange={onMajorModalChange}
          onSubmit={async (data) => {
            setIsMajorSubmitting(true);
            try {
              if (majorModalMode === "create") {
                await createMajor(data);
              } else if (majorModalMode === "update" && selectedMajor) {
                await majorService.updateMajor(selectedMajor.id, data);
                await fetchMajors(); // Refresh the list
              }
            } finally {
              setIsMajorSubmitting(false);
            }
          }}
        />

        <MajorGroupModal
          isOpen={isMajorGroupModalOpen}
          isSubmitting={isMajorGroupSubmitting}
          mode={majorGroupModalMode}
          majorGroup={selectedMajorGroup}
          onOpenChange={onMajorGroupModalChange}
          onSubmit={async (data) => {
            setIsMajorGroupSubmitting(true);
            try {
              if (majorGroupModalMode === "create") {
                if (
                  data.name &&
                  data.isActive !== undefined &&
                  data.departmentId
                ) {
                  await createMajorGroup(
                    data as {
                      name: string;
                      isActive: boolean;
                      departmentId: string;
                    }
                  );
                } else {
                  // eslint-disable-next-line no-console
                  console.error("Invalid data: Missing required fields.");
                }
              } else if (majorGroupModalMode === "update" && selectedMajorGroup) {
                await majorGroupService.updateMajorGroup(selectedMajorGroup.id, data);
                await fetchMajorGroups(); // Refresh the list
              }
            } finally {
              setIsMajorGroupSubmitting(false);
            }
          }}
        />

        <DepartmentModal
          isOpen={isDepartmentModalOpen}
          isSubmitting={isDepartmentSubmitting}
          mode={departmentModalMode}
          department={selectedDepartment}
          onOpenChange={onDepartmentModalChange}
          onSubmit={async (data) => {
            setIsDepartmentSubmitting(true);
            try {
              if (departmentModalMode === "create") {
                await createDepartment(data);
              } else if (departmentModalMode === "update" && selectedDepartment) {
                await departmentService.updateDepartment(selectedDepartment.id, data);
                await fetchDepartments(); // Refresh the list
              }
            } finally {
              setIsDepartmentSubmitting(false);
            }
          }}
        />
      </div>
    </DefaultLayout>
  );
}
