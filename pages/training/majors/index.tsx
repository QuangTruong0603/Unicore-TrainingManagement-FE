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

import { DepartmentTable } from "@/components/major/department-table";
import { DepartmentModal } from "@/components/major/department-modal";
import { MajorGroupTable } from "@/components/major/major-group-table";
import { MajorGroupModal } from "@/components/major/major-group-modal";
import { MajorTable } from "@/components/major/major-table";
import { MajorModal } from "@/components/major/major-modal";
import DefaultLayout from "@/layouts/default";
import { useDepartments } from "@/services/department/department.hooks";
import { useMajorGroups } from "@/services/major-group/major-group.hooks";
import { useMajors } from "@/services/major/major.hooks";
import { useAppDispatch } from "@/store/hooks";
import { setQuery as setDepartmentQuery } from "@/store/slices/departmentSlice";
import { setQuery as setMajorGroupQuery } from "@/store/slices/majorGroupSlice";
import { setQuery as setMajorQuery } from "@/store/slices/majorSlice";

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

  const {
    isOpen: isMajorGroupModalOpen,
    onOpen: onMajorGroupModalOpen,
    onOpenChange: onMajorGroupModalChange,
  } = useDisclosure();
  const [isMajorGroupSubmitting, setIsMajorGroupSubmitting] = useState(false);

  const {
    isOpen: isDepartmentModalOpen,
    onOpen: onDepartmentModalOpen,
    onOpenChange: onDepartmentModalChange,
  } = useDisclosure();
  const [isDepartmentSubmitting, setIsDepartmentSubmitting] = useState(false);

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
        onMajorModalOpen();
        break;
      case "majorGroups":
        onMajorGroupModalOpen();
        break;
      case "departments":
        onDepartmentModalOpen();
        break;
    }
  }; // Major state and hooks
  const {
    majors,
    query: majorQuery,
    total: majorTotal,
    isLoading: isMajorLoading,
    fetchMajors,
    createMajor,
    activateMajor,
    deactivateMajor,
    updateMajor,
  } = useMajors();

  const [majorSearchInput, setMajorSearchInput] = useState(
    () => majorQuery.searchQuery || ""
  );
  const debouncedMajorSearch = useDebounce<string>(majorSearchInput, 600); // MajorGroup state and hooks
  const {
    majorGroups,
    query: majorGroupQuery,
    total: majorGroupTotal,
    isLoading: isMajorGroupLoading,
    fetchMajorGroups,
    createMajorGroup,
    activateMajorGroup,
    deactivateMajorGroup,
    updateMajorGroup,
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
    updateDepartment,
    activateDepartment,
    deactivateDepartment,
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
  // No helper function needed

  return (
    <DefaultLayout>
      <div className="p-6">
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
              {" "}
              <MajorTable
                isLoading={isMajorLoading}
                majors={majors}
                sortDirection={majorQuery.isDesc ? "desc" : "asc"}
                sortKey={majorQuery.orderBy}
                onActiveToggle={(major) =>
                  major.isActive
                    ? deactivateMajor(major.id)
                    : activateMajor(major.id)
                }
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
              {" "}
              <MajorGroupTable
                isLoading={isMajorGroupLoading}
                majorGroups={majorGroups}
                sortDirection={majorGroupQuery.isDesc ? "desc" : "asc"}
                sortKey={majorGroupQuery.orderBy}
                onActiveToggle={(majorGroup) =>
                  majorGroup.isActive
                    ? deactivateMajorGroup(majorGroup.id)
                    : activateMajorGroup(majorGroup.id)
                }
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
                  />
                  <Search
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
                onActiveToggle={(department) =>
                  department.isActive
                    ? deactivateDepartment(department.id)
                    : activateDepartment(department.id)
                }
                onCreateDepartment={createDepartment}
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
          mode="create"
          onOpenChange={onMajorModalChange}
          onSubmit={async (data) => {
            setIsMajorSubmitting(true);
            try {
              await createMajor(data);
            } finally {
              setIsMajorSubmitting(false);
            }
          }}
        />

        <MajorGroupModal
          isOpen={isMajorGroupModalOpen}
          isSubmitting={isMajorGroupSubmitting}
          mode="create"
          onOpenChange={onMajorGroupModalChange}
          onSubmit={async (data) => {
            setIsMajorGroupSubmitting(true);
            try {
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
                console.error("Invalid data: Missing required fields.");
              }
            } finally {
              setIsMajorGroupSubmitting(false);
            }
          }}
        />

        <DepartmentModal
          isOpen={isDepartmentModalOpen}
          isSubmitting={isDepartmentSubmitting}
          mode="create"
          onOpenChange={onDepartmentModalChange}
          onSubmit={async (data) => {
            setIsDepartmentSubmitting(true);
            try {
              await createDepartment(data);
            } finally {
              setIsDepartmentSubmitting(false);
            }
          }}
        />
      </div>
    </DefaultLayout>
  );
}
