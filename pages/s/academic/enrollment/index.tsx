import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChevronDown, ChevronRight, X, RefreshCw } from "lucide-react";
import { addToast } from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";
import { classService } from "@/services/class/class.service";
import { AcademicClass } from "@/services/class/class.schema";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import DefaultLayout from "@/layouts/default";
import {
  ScheduleViewer,
  EnrolledClass as ScheduleEnrolledClass,
} from "@/components/s/enrollment";

import "./index.scss";

interface ScheduleInDay {
  dayOfWeek: string;
  shift?: {
    id: string;
    name: string;
  };
  room?: {
    name: string;
  };
}

interface EnrolledClass {
  id: string;
  name: string;
  course: {
    id: string;
    name: string;
    code?: string;
  };
  scheduleInDays: ScheduleInDay[];
}

// Define days of week for mapping
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EnrollmentPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, studentInfo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<Set<string>>(
    new Set()
  ); // Track API-based enrollment status
  const [showSchedule, setShowSchedule] = useState(false);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
    new Set()
  );

  const [activeTab, setActiveTab] = useState<"forMajor" | "openForAll">(
    "forMajor"
  );

  // Search state for filtering classes by name
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;

    if (!user?.email) {
      router.push("/login");

      return;
    }

    // If studentInfo is available, fetch academic classes
    if (studentInfo?.majorId && studentInfo?.batchId) {
      fetchAcademicClasses(studentInfo.majorId, studentInfo.batchId);
    }
  }, [user, router, authLoading, studentInfo]);
  const fetchAcademicClasses = async (majorId: string, batchId: string) => {
    try {
      setLoadingClasses(true);
      const response = await classService.getClassesByMajorAndBatch(
        majorId,
        batchId
      );

      if (response.data) {
        setAcademicClasses(response.data);
        // Check enrollment status for all classes
        await checkEnrollmentStatus(response.data);
      }
    } catch {
      setError("Failed to fetch available classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  const checkEnrollmentStatus = async (classes: AcademicClass[]) => {
    if (!studentInfo?.id) return;

    try {
      // Get all class IDs (including both theory and practice classes)
      const allClassIds: string[] = [];

      classes.forEach((cls) => {
        allClassIds.push(cls.id);
      });

      // Batch check enrollment status
      const enrollmentResponse =
        await enrollmentService.checkMultipleEnrollments(
          studentInfo.id,
          allClassIds
        );

      // Update enrolled class IDs set
      const enrolledIds = new Set<string>();

      // Handle the new API response format: { success: true, data: { results: [...] } }
      if (enrollmentResponse.data?.results) {
        enrollmentResponse.data.results.forEach(
          ({ academicClassId, exists }) => {
            if (exists) {
              enrolledIds.add(academicClassId);
            }
          }
        );
      }

      setEnrolledClassIds(enrolledIds);
    } catch {
      // Don't show error to user as this is supplementary data
      // Failed to check enrollment status - will fall back to local state
    }
  };
  const handleRefresh = async () => {
    if (!studentInfo?.majorId || !studentInfo?.batchId) return;

    try {
      setIsRefreshing(true);
      setError(null); // Clear any previous errors
      const response = await classService.getClassesByMajorAndBatch(
        studentInfo.majorId,
        studentInfo.batchId
      );

      if (response.data) {
        setAcademicClasses(response.data);
        // Check enrollment status for all classes
        await checkEnrollmentStatus(response.data);
        addToast({
          title: "Refreshed Successfully",
          description: "Class list has been updated.",
          color: "success",
        });
      }
    } catch {
      setError("Failed to refresh class list");
      addToast({
        title: "Refresh Failed",
        description: "Unable to refresh the class list. Please try again.",
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to check if a class is a practice class
  const isPracticeClass = (classId: string): boolean => {
    const academicClass = academicClasses.find((cls) => cls.id === classId);

    return !!academicClass?.parentTheoryAcademicClassId;
  };

  // Function to get the parent theory class of a practice class
  const getParentTheoryClass = (
    practiceClassId: string
  ): AcademicClass | undefined => {
    const practiceClass = academicClasses.find(
      (cls) => cls.id === practiceClassId
    );

    if (practiceClass?.parentTheoryAcademicClassId) {
      return academicClasses.find(
        (cls) => cls.id === practiceClass.parentTheoryAcademicClassId
      );
    }

    return undefined;
  };

  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }

      return newSet;
    });
  };
  // Filter to show only theory classes (classes without parentTheoryAcademicClassId)
  const theoryClasses = academicClasses.filter(
    (academicClass) => !academicClass.parentTheoryAcademicClassId
  ); // Filter classes by tab, search term, and sort by name
  const getFilteredAndSortedClasses = () => {
    const filtered = theoryClasses.filter((academicClass) => {
      // First filter by tab (Major or Open for All)
      const tabMatch =
        activeTab === "forMajor"
          ? !academicClass.course?.isOpenForAll // For Major tab: show courses where isOpenForAll is false
          : academicClass.course?.isOpenForAll; // Open for All Students tab: show courses where isOpenForAll is true

      // Then filter by search term if one exists
      const searchMatch =
        searchTerm.trim() === "" ||
        academicClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        academicClass.course?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return tabMatch && searchMatch;
    });

    // Sort by class name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const displayedClasses = getFilteredAndSortedClasses();
  const renderClassCard = (
    academicClass: AcademicClass,
    isPractice = false
  ) => {
    const hasChildPracticeClasses =
      academicClass.childPracticeAcademicClasses?.length > 0;
    const isExpanded = expandedClasses.has(academicClass.id);

    return (
      <div
        key={academicClass.id}
        className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow class-card ${
          isPractice ? "ml-8 bg-gray-50 practice-class" : "theory-class"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {academicClass.name}
                {isPractice && (
                  <span className="ml-2 text-sm class-type-badge practice px-2 py-1 rounded">
                    Practice
                  </span>
                )}
                {!isPractice && (
                  <span className="ml-2 text-sm class-type-badge theory px-2 py-1 rounded">
                    Theory
                  </span>
                )}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Group:</span>{" "}
                {academicClass.groupNumber}
              </div>
              <div>
                <span className="font-medium">Capacity:</span>{" "}
                {academicClass.capacity}
              </div>
              <div>
                <span className="font-medium">Enrolled:</span>{" "}
                {academicClass.enrollmentCount || 0}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-1 px-2 py-1 rounded text-xs ${
                    academicClass.isRegistrable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {academicClass.isRegistrable ? "Open" : "Closed"}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Weeks:</span>{" "}
              {academicClass.listOfWeeks && academicClass.listOfWeeks.length > 0
                ? academicClass.listOfWeeks.join(", ")
                : "Not specified"}
            </div>
            {academicClass.course && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Course:</span>{" "}
                {academicClass.course.name}
                {academicClass.course.code && (
                  <span className="ml-2">({academicClass.course.code})</span>
                )}
              </div>
            )}{" "}
            {academicClass.scheduleInDays &&
              academicClass.scheduleInDays.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Schedule:</span>
                  <div className="mt-1">
                    {academicClass.scheduleInDays.map(
                      (schedule: ScheduleInDay, index: number) => (
                        <div key={index} className="ml-2">
                          {schedule.dayOfWeek} - {schedule.shift?.name}
                          {schedule.room && ` (Room: ${schedule.room.name})`}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
          <div className="ml-4">
            <button
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isClassActuallyEnrolled(academicClass.id)
                  ? "bg-green-100 text-green-700 cursor-not-allowed"
                  : isClassTemporarilyAdded(academicClass.id)
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : academicClass.isRegistrable &&
                        (!isPractice &&
                        academicClass.childPracticeAcademicClasses?.length > 0
                          ? false
                          : true)
                      ? "bg-primary text-white hover:bg-priamry"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={
                isClassActuallyEnrolled(academicClass.id) ||
                !academicClass.isRegistrable ||
                (!isPractice &&
                  academicClass.childPracticeAcademicClasses?.length > 0)
              }
              onClick={() => handleEnrollment(academicClass.id)}
            >
              {isClassActuallyEnrolled(academicClass.id)
                ? "Enrolled"
                : isClassTemporarilyAdded(academicClass.id)
                  ? "Remove"
                  : !academicClass.isRegistrable
                    ? "Not Available"
                    : !isPractice &&
                        academicClass.childPracticeAcademicClasses?.length > 0
                      ? "Requires Practice"
                      : "Add"}
            </button>
          </div>
        </div>
        {/* Expand button for theory classes with practice classes */}
        {!isPractice && hasChildPracticeClasses && (
          <div className="flex justify-center mt-4 pt-3 border-t border-gray-200">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors expand-button"
              onClick={() => toggleClassExpansion(academicClass.id)}
            >
              {isExpanded ? (
                <>
                  <ChevronDown size={16} />
                  Hide Practice Classes
                </>
              ) : (
                <>
                  <ChevronRight size={16} />
                  View Practice Classes
                </>
              )}
            </button>
          </div>
        )}
        {/* Render child practice classes when expanded */}
        {!isPractice && isExpanded && hasChildPracticeClasses && (
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700 border-t pt-3">
              Practice Classes:
            </div>
            {academicClass.childPracticeAcademicClasses.map(
              (practiceClass: AcademicClass) =>
                renderClassCard(practiceClass, true)
            )}
          </div>
        )}{" "}
      </div>
    );
  }; // Function to get shift type (morning1, morning2, morning-full, etc)
  const getShiftType = (shiftName: string): string => {
    const name = shiftName.toLowerCase();

    // Check for full shifts first
    if (name.includes("morning full") || name.includes("morning-full")) {
      return "morning-full";
    }
    if (name.includes("afternoon full") || name.includes("afternoon-full")) {
      return "afternoon-full";
    }

    // Check for specific shifts
    if (name.includes("morning 1") || name.includes("morning1")) {
      return "morning1";
    }
    if (name.includes("morning 2") || name.includes("morning2")) {
      return "morning2";
    }
    if (name.includes("afternoon 1") || name.includes("afternoon1")) {
      return "afternoon1";
    }
    if (name.includes("afternoon 2") || name.includes("afternoon2")) {
      return "afternoon2";
    }

    // Generic morning/afternoon
    if (name.includes("morning")) {
      return "morning";
    }
    if (name.includes("afternoon")) {
      return "afternoon";
    }

    return "other";
  };

  // Check if two shift types conflict
  const doShiftsConflict = (type1: string, type2: string): boolean => {
    // Exact match is obvious conflict
    if (type1 === type2) return true;

    // Full shift conflicts with any shift in the same period
    if (
      type1 === "morning-full" &&
      (type2 === "morning1" || type2 === "morning2" || type2 === "morning")
    )
      return true;

    if (
      type2 === "morning-full" &&
      (type1 === "morning1" || type1 === "morning2" || type1 === "morning")
    )
      return true;

    if (
      type1 === "afternoon-full" &&
      (type2 === "afternoon1" ||
        type2 === "afternoon2" ||
        type2 === "afternoon")
    )
      return true;

    if (
      type2 === "afternoon-full" &&
      (type1 === "afternoon1" ||
        type1 === "afternoon2" ||
        type1 === "afternoon")
    )
      return true;

    return false;
  };

  // Function to check for schedule conflicts
  const checkScheduleConflicts = (
    academicClass: AcademicClass
  ): {
    hasConflict: boolean;
    conflictMessage: string;
  } => {
    if (
      !academicClass.scheduleInDays ||
      academicClass.scheduleInDays.length === 0
    ) {
      return { hasConflict: false, conflictMessage: "" };
    }

    // Get all existing time slots from enrolled classes
    const existingSlots: Array<{
      dayOfWeek: string;
      shiftId: string;
      shiftName: string;
      shiftType: string;
      className: string;
    }> = [];

    enrolledClasses.forEach((enrolledClass) => {
      enrolledClass.scheduleInDays.forEach((schedule) => {
        if (schedule.shift?.id && schedule.shift?.name) {
          existingSlots.push({
            dayOfWeek: schedule.dayOfWeek,
            shiftId: schedule.shift.id,
            shiftName: schedule.shift.name,
            shiftType: getShiftType(schedule.shift.name),
            className: enrolledClass.name,
          });
        }
      });
    });

    // Check new class against existing slots
    let hasConflict = false;
    let conflictMessage = "";

    for (const schedule of academicClass.scheduleInDays || []) {
      if (!schedule.shift?.id || !schedule.shift?.name) continue;

      const newShiftType = getShiftType(schedule.shift.name);

      // Check against existing slots
      for (const existingSlot of existingSlots) {
        if (existingSlot.dayOfWeek === schedule.dayOfWeek) {
          // Same day, check for time conflicts
          if (doShiftsConflict(newShiftType, existingSlot.shiftType)) {
            hasConflict = true;
            conflictMessage = `Schedule conflict with ${existingSlot.className} on ${schedule.dayOfWeek}. 
              You cannot have ${schedule.shift.name} when you already have ${existingSlot.shiftName} scheduled.`;
            break;
          }
        }
      }

      if (hasConflict) break;
    }

    return { hasConflict, conflictMessage };
  };
  const handleEnrollment = async (classId: string) => {
    const academicClass = academicClasses.find((cls) => cls.id === classId);

    if (!academicClass) return;

    const isPractice = isPracticeClass(classId);
    let parentTheoryClass;

    if (isPractice) {
      parentTheoryClass = getParentTheoryClass(classId);
      if (!parentTheoryClass) {
        addToast({
          title: "Enrollment Failed",
          description:
            "Could not find the theory class for this practice class.",
          color: "danger",
        });

        return;
      }
    }

    // Check if already enrolled
    const isActuallyEnrolled = isClassActuallyEnrolled(classId);
    const isTemporarilyAdded = isClassTemporarilyAdded(classId);

    if (isActuallyEnrolled) {
      // Actually enrolled classes cannot be removed
      addToast({
        title: "Already Enrolled",
        description:
          "You are already enrolled in this class. This enrollment is confirmed and cannot be changed here.",
        color: "warning",
      });

      return;
    } else if (isTemporarilyAdded) {
      // Remove from temporary enrollment
      if (isPractice) {
        // When removing a practice class, also remove its parent theory class
        const parentTheoryClass = getParentTheoryClass(classId);
        const idsToRemove = [classId];

        if (parentTheoryClass) {
          idsToRemove.push(parentTheoryClass.id);
        }

        setEnrolledClasses((prev) =>
          prev.filter((cls) => !idsToRemove.includes(cls.id))
        );

        addToast({
          title: "Classes Removed",
          description:
            "Practice class and its theory class have been removed from your enrollment list.",
          color: "success",
        });
      } else {
        // Regular class removal - check if it's a theory class with associated practice classes
        const idsToRemove = [classId];

        // If this is a theory class, also remove any associated practice classes
        const associatedPracticeClasses = enrolledClasses.filter(
          (enrolledClass) => {
            const practiceClass = academicClasses.find(
              (cls) => cls.id === enrolledClass.id
            );

            return practiceClass?.parentTheoryAcademicClassId === classId;
          }
        );

        if (associatedPracticeClasses.length > 0) {
          associatedPracticeClasses.forEach((practiceClass) => {
            idsToRemove.push(practiceClass.id);
          });
        }

        setEnrolledClasses((prev) =>
          prev.filter((cls) => !idsToRemove.includes(cls.id))
        );

        const message =
          associatedPracticeClasses.length > 0
            ? "Theory class and its associated practice classes have been removed from your enrollment list."
            : "Class has been removed from your enrollment list.";

        addToast({
          title: "Class Removed",
          description: message,
          color: "success",
        });
      }

      return;
    } else {
      // For adding classes
      if (isPractice) {
        // When adding a practice class, also add its parent theory class
        const classesToEnroll: EnrolledClass[] = [];

        // Check if already enrolled in a class with same course
        const courseId = academicClass.course?.id;
        const parentCourseId = parentTheoryClass?.course?.id;

        // Check if any course is already enrolled
        const isCourseEnrolled = enrolledClasses.some(
          (enrolledClass) =>
            enrolledClass.course.id === courseId ||
            enrolledClass.course.id === parentCourseId
        );

        if (isCourseEnrolled) {
          addToast({
            title: "Enrollment Failed",
            description:
              "You are already enrolled in a class with the same course. You cannot enroll in multiple classes of the same course.",
            color: "danger",
          });

          return;
        }

        // Check for schedule conflicts for both classes
        const practiceConflict = checkScheduleConflicts(academicClass);
        const theoryConflict = parentTheoryClass
          ? checkScheduleConflicts(parentTheoryClass)
          : { hasConflict: false, conflictMessage: "" };

        if (practiceConflict.hasConflict) {
          addToast({
            title: "Enrollment Failed",
            description: practiceConflict.conflictMessage,
            color: "danger",
          });

          return;
        }

        if (theoryConflict.hasConflict) {
          addToast({
            title: "Enrollment Failed",
            description: theoryConflict.conflictMessage,
            color: "danger",
          });

          return;
        }
        // Add practice class
        classesToEnroll.push({
          id: academicClass.id,
          name: academicClass.name,
          course: {
            id: academicClass.course!.id,
            name: academicClass.course!.name,
            code: academicClass.course!.code,
          },
          scheduleInDays: academicClass.scheduleInDays || [],
        });

        // Add parent theory class if not already enrolled
        if (parentTheoryClass && !isClassEnrolled(parentTheoryClass.id)) {
          classesToEnroll.push({
            id: parentTheoryClass.id,
            name: parentTheoryClass.name,
            course: {
              id: parentTheoryClass.course!.id,
              name: parentTheoryClass.course!.name,
              code: parentTheoryClass.course!.code,
            },
            scheduleInDays: parentTheoryClass.scheduleInDays || [],
          });
        }

        setEnrolledClasses((prev) => [...prev, ...classesToEnroll]);
        addToast({
          title: "Classes Added",
          description: `You have successfully enrolled in ${academicClass.name} and its required theory class.`,
          color: "success",
        });
      } else {
        // Regular class enrollment (theory without practice or standalone class)

        // Check if already enrolled in a class with same course
        const courseId = academicClass.course?.id;

        // Check if this course is already enrolled
        const isCourseEnrolled = enrolledClasses.some(
          (enrolledClass) => enrolledClass.course.id === courseId
        );

        if (isCourseEnrolled) {
          addToast({
            title: "Enrollment Failed",
            description:
              "You are already enrolled in a class with the same course. You cannot enroll in multiple classes of the same course.",
            color: "danger",
          });

          return;
        }

        // Check for schedule conflicts
        const { hasConflict, conflictMessage } =
          checkScheduleConflicts(academicClass);

        if (hasConflict) {
          addToast({
            title: "Enrollment Failed",
            description: conflictMessage,
            color: "danger",
          });

          return;
        }
        // Create enrolled class object
        const enrolledClass: EnrolledClass = {
          id: academicClass.id,
          name: academicClass.name,
          course: {
            id: academicClass.course!.id,
            name: academicClass.course!.name,
            code: academicClass.course!.code,
          },
          scheduleInDays: academicClass.scheduleInDays || [],
        };

        setEnrolledClasses((prev) => [...prev, enrolledClass]);
        addToast({
          title: "Class Added",
          description: `You have successfully enrolled in ${academicClass.name}.`,
          color: "success",
        });
      }
    }
  };

  // Convert enrolled classes to format expected by ScheduleViewer
  const convertToScheduleFormat = (
    enrolledClasses: EnrolledClass[]
  ): ScheduleEnrolledClass[] => {
    const scheduleClasses: ScheduleEnrolledClass[] = [];

    enrolledClasses.forEach((enrolledClass) => {
      enrolledClass.scheduleInDays.forEach((schedule) => {
        // Map day names to indices (0 = Monday, 6 = Sunday)
        const dayIndex = DAYS_OF_WEEK.indexOf(schedule.dayOfWeek);

        if (dayIndex !== -1 && schedule.shift?.id) {
          scheduleClasses.push({
            id: `${enrolledClass.id}`,
            name: enrolledClass.name,
            dayOfWeek: dayIndex,
            shiftId: schedule.shift.id,
            room: schedule.room?.name,
            instructor: enrolledClass.course.name,
          });
        }
      });
    });

    return scheduleClasses;
  };

  // Helper function to check if a class is actually enrolled (API-confirmed)
  const isClassActuallyEnrolled = (classId: string): boolean => {
    return enrolledClassIds.has(classId);
  };

  // Helper function to check if a class is temporarily added (local state)
  const isClassTemporarilyAdded = (classId: string): boolean => {
    return enrolledClasses.some((cls) => cls.id === classId);
  };

  // Helper function to check if a class is enrolled (API first, then local state)
  const isClassEnrolled = (classId: string): boolean => {
    // First check API-based enrollment status
    if (enrolledClassIds.has(classId)) {
      return true;
    }

    // Fallback to local state (for temporary enrollments before submission)
    return enrolledClasses.some((cls) => cls.id === classId);
  };

  // Function to refresh enrollment status only (can be called after enrollment)
  const refreshEnrollmentStatus = async () => {
    if (academicClasses.length > 0) {
      await checkEnrollmentStatus(academicClasses);
    }
  };

  if (authLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen" />
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 enrollment-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Course Enrollment
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  className={`tab-button flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "forMajor"
                      ? "active"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={
                    activeTab === "forMajor"
                      ? { backgroundColor: "white", color: "black" }
                      : {}
                  }
                  onClick={() => setActiveTab("forMajor")}
                >
                  For Major
                </button>
                <button
                  className={`tab-button flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "openForAll"
                      ? "active"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={
                    activeTab === "openForAll"
                      ? { backgroundColor: "white", color: "black" }
                      : {}
                  }
                  onClick={() => setActiveTab("openForAll")}
                >
                  Open for All Students
                </button>
              </div>

              {/* Search Input and Refresh Button */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Search classes by name..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  className={`px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary ${
                    isRefreshing ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={isRefreshing}
                  title="Refresh class list"
                  onClick={handleRefresh}
                >
                  <RefreshCw
                    className={isRefreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  <span className="text-sm font-medium">
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loadingClasses ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading available classes...</div>
              </div>
            ) : displayedClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {activeTab === "forMajor"
                    ? "No major-specific classes available for enrollment"
                    : "No open classes available for all students"}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {displayedClasses.map((academicClass) =>
                  renderClassCard(academicClass)
                )}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Modal */}
        {showSchedule && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Class Schedule
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowSchedule(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {enrolledClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No schedule available. Enroll in a class to see the schedule.
                </div>
              ) : (
                <div>
                  {enrolledClasses.map((academicClass) => (
                    <div
                      key={academicClass.id}
                      className="border-t border-gray-200 pt-4 mt-4"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        {academicClass.name}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                        <div>
                          <span className="font-medium">Course:</span>{" "}
                          {academicClass.course.name}
                          {academicClass.course.code && (
                            <span className="ml-2">
                              ({academicClass.course.code})
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Weeks:</span>{" "}
                          {academicClass.scheduleInDays
                            .map((schedule) => schedule.dayOfWeek)
                            .join(", ")}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="font-medium">Schedule:</span>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-1">
                          {academicClass.scheduleInDays.map(
                            (schedule, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-1/2">
                                  {schedule.dayOfWeek} - {schedule.shift?.name}
                                </div>
                                <div className="w-1/2 text-right">
                                  {schedule.room &&
                                    `Room: ${schedule.room.name}`}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Viewer Component */}
        <ScheduleViewer
          enrolledClasses={convertToScheduleFormat(enrolledClasses)}
          onCompleteEnrollment={async () => {
            // Clear enrolled classes from state
            setEnrolledClasses([]);

            // Refresh enrollment status first
            await refreshEnrollmentStatus();

            // Refresh the academic classes list to get updated enrollment counts
            if (studentInfo?.majorId && studentInfo?.batchId) {
              await handleRefresh();
            }
          }}
        />
      </div>
    </DefaultLayout>
  );
};

export default EnrollmentPage;
