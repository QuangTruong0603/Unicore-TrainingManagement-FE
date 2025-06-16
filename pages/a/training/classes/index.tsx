import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  CalendarClock,
  CheckCircle,
  Play,
  XCircle,
} from "lucide-react";
import {
  Button,
  Input,
  Pagination,
  useDisclosure,
  addToast,
} from "@heroui/react";

import { ClassFilter } from "@/components/a/class/class-filter";
import { ClassModal } from "@/components/a/class/class-modal";
import { ClassTable } from "@/components/a/class/class-table";
import { ClassRegistrationModal } from "@/components/a/class/class-registration-modal";
import { MoveEnrollmentsModal } from "@/components/a/class/move-enrollments-modal";
import DefaultLayout from "@/layouts/default";
import { AcademicClass } from "@/services/class/class.schema";
import {
  AcademicClassCreateDto,
  ClassRegistrationScheduleDto,
} from "@/services/class/class.dto";
import { classService } from "@/services/class/class.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Enrollment } from "@/services/enrollment/enrollment.schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setClasses,
  setError,
  setLoading,
  setQuery,
  setTotal,
  setSelectedClass,
} from "@/store/slices/classSlice";
import "./index.scss";
import { useDebounce } from "@/hooks/useDebounce";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Course } from "@/services/course/course.schema";
import { courseService } from "@/services/course/course.service";
import { Semester } from "@/services/semester/semester.schema";
import { semesterService } from "@/services/semester/semester.service";
import { Shift } from "@/services/shift/shift.schema";
import { shiftService } from "@/services/shift/shift.service";

interface FilterChip {
  id: string;
  label: string;
}

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classes, query, total, isLoading, selectedClass } = useAppSelector(
    (state) => state.class
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    query.filters?.name || ""
  );
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const debouncedSearchValue = useDebounce(searchInputValue, 600);
  // Track expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Create modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  // Update modal
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onOpenChange: onUpdateOpenChange,
  } = useDisclosure();

  // Registration schedule modal
  const {
    isOpen: isRegistrationOpen,
    onOpen: onRegistrationOpen,
    onOpenChange: onRegistrationOpenChange,
  } = useDisclosure();

  // Move enrollments modal
  const {
    isOpen: isMoveEnrollmentsOpen,
    onOpen: onMoveEnrollmentsOpen,
    onOpenChange: onMoveEnrollmentsOpenChange,
  } = useDisclosure();

  // State for move enrollments
  const [selectedSourceClass, setSelectedSourceClass] =
    useState<AcademicClass | null>(null);
  const [enrollmentsToMove, setEnrollmentsToMove] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const { confirmDialog } = useConfirmDialog();

  // Effect for handling debounced search
  useEffect(() => {
    // Only update if the search value has actually changed
    const currentSearchValue = query.filters?.name || "";

    if (currentSearchValue === debouncedSearchValue) {
      return;
    }

    // Create a new filters object only if needed
    const newFilters = query.filters ? { ...query.filters } : {};

    if (debouncedSearchValue) {
      newFilters.name = debouncedSearchValue;
    } else {
      delete newFilters.name;
    }

    dispatch(
      setQuery({
        ...query,
        filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
        pageNumber: 1,
      })
    );
  }, [debouncedSearchValue]);
  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        dispatch(setLoading(true));
        const response = await classService.getClasses(query);

        dispatch(setClasses(response.data.data || []));
        dispatch(setTotal(response.data.total || 0));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchClasses();

    // Update filter chips whenever query changes
    updateFilterChipsFromQuery();
  }, [query, dispatch]);

  // Fetch courses, semesters, and shifts for filter display
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await courseService.getCourses({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "name",
          isDesc: false,
        });

        setCourses(coursesResponse.data.data);

        // Fetch semesters
        const semestersResponse = await semesterService.getSemesters({
          pageNumber: 1,
          itemsPerpage: 100,
          orderBy: "year",
          isDesc: true,
        });

        setSemesters(semestersResponse.data.data);

        // Fetch shifts
        const shiftsResponse = await shiftService.getAllShifts();

        setShifts(shiftsResponse.data);
      } catch {
        // Silent error handling
      }
    };

    fetchFilterData();
  }, []);

  // Update filter chips based on current query
  const updateFilterChipsFromQuery = () => {
    if (!query.filters) {
      setFilterChips([]);

      return;
    }

    const newChips: FilterChip[] = [];

    // Name search filter
    if (query.filters.name) {
      newChips.push({
        id: "name",
        label: `Name: ${query.filters.name}`,
      });
    }

    // Group name filter
    if (query.filters.groupNumber) {
      newChips.push({
        id: "groupNumber",
        label: `Group: ${query.filters.groupNumber}`,
      });
    }

    // Capacity range filter
    if (query.filters.minCapacity) {
      newChips.push({
        id: "minCapacity",
        label: `Min Capacity: ${query.filters.minCapacity}`,
      });
    }

    if (query.filters.maxCapacity) {
      newChips.push({
        id: "maxCapacity",
        label: `Max Capacity: ${query.filters.maxCapacity}`,
      });
    }

    // Registration status filter
    if (
      query.filters.isRegistrable !== undefined &&
      query.filters.isRegistrable !== null
    ) {
      newChips.push({
        id: "isRegistrable",
        label: `Registration: ${query.filters.isRegistrable ? "Open" : "Closed"}`,
      });
    } // Course filter
    if (query.filters.courseId) {
      const course = courses.find(
        (course) => course.id === query.filters!.courseId
      );

      newChips.push({
        id: "courseId",
        label: `Course: ${course ? `${course.code} - ${course.name}` : "Unknown"}`,
      });
    } // Semester filter
    if (query.filters.semesterId) {
      const semester = semesters.find(
        (semester) => semester.id === query.filters!.semesterId
      );

      newChips.push({
        id: "semesterId",
        label: `Semester: ${semester ? `${semester.semesterNumber}/${semester.year}` : "Unknown"}`,
      });
    }

    // Shift filter
    if (query.filters.shiftId) {
      const shift = shifts.find((shift) => shift.id === query.filters!.shiftId);

      newChips.push({
        id: "shiftId",
        label: `Shift: ${shift ? shift.name : "Unknown"}`,
      });
    }

    setFilterChips(newChips);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    dispatch(
      setQuery({
        ...query,
        orderBy: key,
        isDesc: query.orderBy === key ? !query.isDesc : false,
      })
    );
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    dispatch(
      setQuery({
        ...query,
        pageNumber: page,
      })
    );
  };

  // Handle filter change
  const handleFilterChange = (newQuery: any) => {
    dispatch(setQuery(newQuery));
  };

  // Clear filters
  const handleFilterClear = () => {
    dispatch(
      setQuery({
        ...query,
        pageNumber: 1,
        filters: undefined,
      })
    );
    setSearchInputValue("");
  };

  // Toggle expanded row
  const toggleRow = (classId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  // Handle registration status toggle
  const handleRegistrationToggle = async (academicClass: AcademicClass) => {
    try {
      if (academicClass.isRegistrable) {
        await classService.disableRegistration(academicClass.id);
      } else {
        await classService.enableRegistration(academicClass.id);
      }

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));
    } catch {
      dispatch(setError("Failed to update registration status"));
    }
  };

  // Handle registration schedule creation
  const handleCreateRegistrationSchedule = async (
    data: ClassRegistrationScheduleDto
  ) => {
    try {
      setIsSubmitting(true);
      await classService.createClassRegistrationSchedule(data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));

      // Reset selection
      setSelectedClasses([]);
      onRegistrationOpenChange();
    } catch {
      dispatch(setError("Failed to set registration schedule"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create class
  const handleCreateClass = async (data: AcademicClassCreateDto) => {
    try {
      setIsSubmitting(true);
      await classService.createClass(data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));
      dispatch(setTotal(response.data.total));

      onCreateOpenChange();
    } catch {
      dispatch(setError("Failed to create class"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update class
  const handleUpdateClass = async (data: AcademicClassCreateDto) => {
    try {
      if (!selectedClass) return;

      setIsSubmitting(true);
      await classService.updateClass(selectedClass.id, data);

      // Refresh data
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));

      onUpdateOpenChange();
      dispatch(setSelectedClass(null));
    } catch {
      dispatch(setError("Failed to update class"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = (academicClass: AcademicClass) => {
    confirmDialog(
      async () => {
        try {
          dispatch(setLoading(true));
          await classService.deleteClass(academicClass.id);

          // Refresh the classes list after successful deletion
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          dispatch(setError("Failed to delete class"));
          // eslint-disable-next-line no-console
          console.error("Error deleting class:", error);
        } finally {
          dispatch(setLoading(false));
        }
      },
      {
        title: "Confirm Delete",
        message: `Are you sure you want to delete the class "${academicClass.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      }
    );
  };

  const handleApproveAllEnrollments = (academicClass: AcademicClass) => {
    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          await enrollmentService.approveAllEnrollmentsByClass(
            academicClass.id
          );

          addToast({
            title: "Success",
            description: `All enrollments for class "${academicClass.name}" have been approved successfully.`,
            color: "success",
          });

          // Refresh the classes list after successful approval
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to approve enrollments. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error approving enrollments:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Approval",
        message: `Are you sure you want to approve all enrollments for class "${academicClass.name}"? This will change the status of all pending enrollments from Pending (1) to Approved (2).`,
        confirmText: "Approve All",
        cancelText: "Cancel",
      }
    );
  };
  const handleRejectAllEnrollments = (academicClass: AcademicClass) => {
    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          await enrollmentService.rejectAllEnrollmentsByClass(academicClass.id);

          addToast({
            title: "Success",
            description: `All enrollments for class "${academicClass.name}" have been rejected successfully.`,
            color: "success",
          });

          // Refresh the classes list after successful rejection
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to reject enrollments. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error rejecting enrollments:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Rejection",
        message: `Are you sure you want to reject all enrollments for class "${academicClass.name}"? This will change the status of all pending enrollments from Pending (1) to Rejected (3).`,
        confirmText: "Reject All",
        cancelText: "Cancel",
      }
    );
  };
  const handleUpdateClassFromTable = (academicClass: AcademicClass) => {
    dispatch(setSelectedClass(academicClass));
    onUpdateOpenChange();
  };

  const handleToggleActivation = (academicClass: AcademicClass) => {
    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          // Note: You might need to implement this method in classService
          // await classService.toggleClassActivation(academicClass.id);

          addToast({
            title: "Success",
            description: `Class "${academicClass.name}" has been ${academicClass.isActive ? "deactivated" : "activated"} successfully.`,
            color: "success",
          });

          // Refresh the classes list
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to toggle class activation. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error toggling class activation:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Action",
        message: `Are you sure you want to ${academicClass.isActive ? "deactivate" : "activate"} the class "${academicClass.name}"?`,
        confirmText: academicClass.isActive ? "Deactivate" : "Activate",
        cancelText: "Cancel",
      }
    );
  };

  // Move enrollments handlers
  const handleMoveEnrollments = async (academicClass: AcademicClass) => {
    try {
      setIsLoadingEnrollments(true);
      setSelectedSourceClass(academicClass);

      // Fetch enrollments for this class
      const response = await enrollmentService.getEnrollmentsByClassId(
        academicClass.id
      );

      setEnrollmentsToMove(response.data || []);
      onMoveEnrollmentsOpen();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to load enrollments. Please try again.",
        color: "danger",
      });
      // eslint-disable-next-line no-console
      console.error("Error loading enrollments:", error);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const handleMoveEnrollmentsSubmit = async (data: {
    toClassId: string;
    enrollmentIds: string[];
  }) => {
    try {
      setIsSubmitting(true);

      await enrollmentService.moveEnrollmentsToNewClass({
        toClassId: data.toClassId,
        enrollmentIds: data.enrollmentIds,
      });

      addToast({
        title: "Success",
        description: `Successfully moved ${data.enrollmentIds.length} enrollment${
          data.enrollmentIds.length !== 1 ? "s" : ""
        } to the new class.`,
        color: "success",
      });

      // Refresh the classes list to update enrollment counts
      const response = await classService.getClasses(query);

      dispatch(setClasses(response.data.data));
      dispatch(setTotal(response.data.total));

      onMoveEnrollmentsOpenChange();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to move enrollments. Please try again.",
        color: "danger",
      });
      // eslint-disable-next-line no-console
      console.error("Error moving enrollments:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk enrollment status change handlers
  const handleBulkApproveEnrollments = () => {
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // Check if all selected classes are closed and have pending enrollments
    const hasInvalidClasses = selectedClassesData.some(
      (cls) => cls.isRegistrable || cls.enrollmentStatus !== 1
    );

    if (hasInvalidClasses) {
      addToast({
        title: "Invalid Operation",
        description:
          "All selected classes must be closed (registration disabled) and have pending enrollments to approve.",
        color: "danger",
      });

      return;
    }

    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          await enrollmentService.bulkChangeEnrollmentStatus(
            selectedClasses,
            2
          );

          addToast({
            title: "Success",
            description: `All enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""} have been approved successfully.`,
            color: "success",
          });

          // Refresh the classes list
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));

          // Clear selection
          setSelectedClasses([]);
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to approve enrollments. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error approving enrollments:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Bulk Approval",
        message: `Are you sure you want to approve all enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""}? This will change the status from Pending to Approved.`,
        confirmText: "Approve All",
        cancelText: "Cancel",
      }
    );
  };
  const handleBulkStartEnrollments = () => {
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // Check if all selected classes are closed and have approved enrollments
    const hasInvalidClasses = selectedClassesData.some(
      (cls) => cls.isRegistrable || cls.enrollmentStatus !== 2
    );

    if (hasInvalidClasses) {
      addToast({
        title: "Invalid Operation",
        description:
          "All selected classes must be closed (registration disabled) and have approved enrollments to start.",
        color: "danger",
      });

      return;
    }

    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          await enrollmentService.bulkChangeEnrollmentStatus(
            selectedClasses,
            3
          );

          addToast({
            title: "Success",
            description: `All enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""} have been started successfully.`,
            color: "success",
          });

          // Refresh the classes list
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));

          // Clear selection
          setSelectedClasses([]);
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to start enrollments. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error starting enrollments:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Bulk Start",
        message: `Are you sure you want to start all enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""}? This will change the status from Approved to Started.`,
        confirmText: "Start All",
        cancelText: "Cancel",
      }
    );
  };
  const handleBulkRejectEnrollments = () => {
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // Check if all selected classes are closed and have pending enrollments
    const hasInvalidClasses = selectedClassesData.some(
      (cls) => cls.isRegistrable || cls.enrollmentStatus !== 1
    );

    if (hasInvalidClasses) {
      addToast({
        title: "Invalid Operation",
        description:
          "All selected classes must be closed (registration disabled) and have pending enrollments to reject.",
        color: "danger",
      });

      return;
    }

    confirmDialog(
      async () => {
        try {
          setIsSubmitting(true);
          await enrollmentService.bulkChangeEnrollmentStatus(
            selectedClasses,
            6
          );

          addToast({
            title: "Success",
            description: `All enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""} have been rejected successfully.`,
            color: "success",
          });

          // Refresh the classes list
          const response = await classService.getClasses(query);

          dispatch(setClasses(response.data.data));
          dispatch(setTotal(response.data.total));

          // Clear selection
          setSelectedClasses([]);
        } catch (error) {
          addToast({
            title: "Error",
            description: "Failed to reject enrollments. Please try again.",
            color: "danger",
          });
          // eslint-disable-next-line no-console
          console.error("Error rejecting enrollments:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Confirm Bulk Rejection",
        message: `Are you sure you want to reject all enrollments for ${selectedClasses.length} selected class${selectedClasses.length !== 1 ? "es" : ""}? This will change the status from Pending to Rejected.`,
        confirmText: "Reject All",
        cancelText: "Cancel",
      }
    );
  };
  // Helper functions to check if bulk actions are available
  const canApproveSelected = () => {
    if (selectedClasses.length === 0) return false;
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // All selected classes must be closed (not registrable) and have pending enrollments
    return selectedClassesData.every(
      (cls) => !cls.isRegistrable && cls.enrollmentStatus === 1
    );
  };

  const canStartSelected = () => {
    if (selectedClasses.length === 0) return false;
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // All selected classes must be closed (not registrable) and have approved enrollments
    return selectedClassesData.every(
      (cls) => !cls.isRegistrable && cls.enrollmentStatus === 2
    );
  };

  const canRejectSelected = () => {
    if (selectedClasses.length === 0) return false;
    const selectedClassesData = classes.filter((cls) =>
      selectedClasses.includes(cls.id)
    );

    // All selected classes must be closed (not registrable) and have pending enrollments
    return selectedClassesData.every(
      (cls) => !cls.isRegistrable && cls.enrollmentStatus === 1
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Classes Management</h1>
          <div className="flex items-center gap-3">
            {selectedClasses.length > 0 && (
              <>
                {canApproveSelected() && (
                  <Button
                    color="success"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onClick={handleBulkApproveEnrollments}
                  >
                    Approve ({selectedClasses.length})
                  </Button>
                )}
                {canStartSelected() && (
                  <Button
                    color="primary"
                    startContent={<Play className="w-4 h-4" />}
                    onClick={handleBulkStartEnrollments}
                  >
                    Start ({selectedClasses.length})
                  </Button>
                )}
                {canRejectSelected() && (
                  <Button
                    color="danger"
                    startContent={<XCircle className="w-4 h-4" />}
                    onClick={handleBulkRejectEnrollments}
                  >
                    Reject ({selectedClasses.length})
                  </Button>
                )}
                <Button
                  color="secondary"
                  startContent={<CalendarClock className="w-4 h-4" />}
                  onClick={onRegistrationOpen}
                >
                  Set Registration Schedule ({selectedClasses.length})
                </Button>
              </>
            )}
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onClick={onCreateOpen}
            >
              Create Class
            </Button>
          </div>
        </div>
        {/* Search and Filter Section */}
        <div className="mb-6">
          {/* Search and filter row */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-1">
              <Input
                className="w-full rounded-xl"
                placeholder="Search classes..."
                startContent={<Search className="text-gray-400" />}
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onClear={() => setSearchInputValue("")}
              />
              {searchInputValue !== debouncedSearchValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <ClassFilter
              query={query}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
            />
          </div>

          {/* Filter chips display - increased margin-top */}
          {filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filterChips.map((chip) => (
                <div
                  key={chip.id}
                  className="bg-orange-100 text-primary px-3 py-1 rounded-full text-xs"
                >
                  {chip.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow">
          <ClassTable
            allowMultiSelect={true}
            classes={classes}
            expandedRows={expandedRows}
            isLoading={isLoading}
            selectedClasses={selectedClasses}
            sortDirection={query.isDesc ? "desc" : "asc"}
            sortKey={query.orderBy}
            onApproveAllEnrollments={handleApproveAllEnrollments}
            onDeleteClass={handleDeleteClass}
            onMoveEnrollments={handleMoveEnrollments}
            onRegistrationToggle={handleRegistrationToggle}
            onRejectAllEnrollments={handleRejectAllEnrollments}
            onRowToggle={toggleRow}
            onSelectedClassesChange={setSelectedClasses}
            onSort={handleSort}
            onToggleActivation={handleToggleActivation}
            onUpdateClass={handleUpdateClassFromTable}
          />
          {/* Pagination */}
          <div className="px-4 py-3 border-t flex justify-end">
            <Pagination
              initialPage={query.pageNumber}
              page={query.pageNumber}
              total={Math.ceil(total / query.itemsPerpage)}
              onChange={handlePageChange}
            />
          </div>
        </div>
        {/* Create Modal */}
        <ClassModal
          isOpen={isCreateOpen}
          isSubmitting={isSubmitting}
          mode="create"
          onOpenChange={onCreateOpenChange}
          onSubmit={handleCreateClass}
        />
        {/* Update Modal */}
        <ClassModal
          academicClass={selectedClass}
          isOpen={isUpdateOpen}
          isSubmitting={isSubmitting}
          mode="update"
          onOpenChange={onUpdateOpenChange}
          onSubmit={handleUpdateClass}
        />
        {/* Registration Schedule Modal */}
        <ClassRegistrationModal
          classes={classes}
          isOpen={isRegistrationOpen}
          isSubmitting={isSubmitting}
          selectedClasses={selectedClasses}
          onOpenChange={onRegistrationOpenChange}
          onSubmit={handleCreateRegistrationSchedule}
        />
        {/* Move Enrollments Modal */}
        <MoveEnrollmentsModal
          enrollments={enrollmentsToMove}
          isLoadingEnrollments={isLoadingEnrollments}
          isOpen={isMoveEnrollmentsOpen}
          isSubmitting={isSubmitting}
          sourceClass={selectedSourceClass}
          onOpenChange={onMoveEnrollmentsOpenChange}
          onSubmit={handleMoveEnrollmentsSubmit}
        />
      </div>
    </DefaultLayout>
  );
}
