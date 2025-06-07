import React, { useState } from "react";

import { useAllShifts } from "../../../services/shift/shift.hooks";
import { Shift } from "../../../services/shift/shift.schema";
import { useCreateMultipleEnrollments } from "../../../services/enrollment/enrollment.hooks";
import { useAuth } from "../../../hooks/useAuth";

interface EnrolledClass {
  id: string;
  name: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  shiftId: string; // Use shift ID instead of shift time number
  room?: string;
  instructor?: string;
}

interface ScheduleViewerProps {
  enrolledClasses: EnrolledClass[];
  onCompleteEnrollment?: () => void; // Callback after successful enrollment
}

const ScheduleViewer: React.FC<ScheduleViewerProps> = ({
  enrolledClasses,
  onCompleteEnrollment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add local state for submission status
  const { data: shiftsData, isLoading, error } = useAllShifts();
  const { studentInfo } = useAuth();

  const createMultipleEnrollmentsMutation = useCreateMultipleEnrollments();
  // Handle enrollment completion
  const handleCompleteEnrollment = async () => {
    if (!studentInfo?.id) {
      alert("Student information not found. Please log in again.");

      return;
    }

    if (enrolledClasses.length === 0) {
      alert("No classes selected for enrollment.");

      return;
    }

    try {
      setIsSubmitting(true);

      // Extract class IDs from enrolled classes
      const academicClassIds = enrolledClasses.map((cls) => cls.id);

      // Call the enrollment API
      await createMultipleEnrollmentsMutation.mutateAsync({
        studentId: studentInfo.id,
        academicClassIds: academicClassIds,
      });

      // Close the modal
      setIsOpen(false);

      // Call the callback if provided
      if (onCompleteEnrollment) {
        onCompleteEnrollment();
      }

      alert(`Successfully enrolled in ${enrolledClasses.length} classes!`);
    } catch {
      // Error handled with alert only
      alert("Failed to complete enrollment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  // Get shifts from the API response
  const shifts: Shift[] = shiftsData?.data || [];

  // Check if a shift is a full morning or afternoon shift
  const isFullShift = (name: string): boolean => {
    return (
      name.toLowerCase().includes("morning full") ||
      name.toLowerCase().includes("afternoon full") ||
      name.toLowerCase().includes("morning-full") ||
      name.toLowerCase().includes("afternoon-full")
    );
  };

  // Determines if a shift is a morning shift
  const isMorningShift = (shift: Shift): boolean => {
    return (
      shift.startTime.startsWith("07:") ||
      shift.startTime.startsWith("08:") ||
      shift.startTime.startsWith("09:") ||
      shift.name.toLowerCase().includes("morning")
    );
  };

  // Determines if a shift is an afternoon shift
  const isAfternoonShift = (shift: Shift): boolean => {
    return (
      shift.startTime.startsWith("13:") ||
      shift.startTime.startsWith("14:") ||
      shift.startTime.startsWith("15:") ||
      shift.name.toLowerCase().includes("afternoon")
    );
  };

  // Categorize shifts by type (morning, afternoon, etc.)
  interface ShiftGroups {
    regularShifts: Shift[];
    morningShifts: Shift[];
    afternoonShifts: Shift[];
    morningFullShifts: Shift[];
    afternoonFullShifts: Shift[];
  }

  // Process shifts for display
  const processShifts = (): ShiftGroups => {
    // Sort shifts by start time
    const sorted = [...shifts].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    // Separate shifts by category
    const regularShifts: Shift[] = [];
    const morningShifts: Shift[] = [];
    const afternoonShifts: Shift[] = [];
    const morningFullShifts: Shift[] = [];
    const afternoonFullShifts: Shift[] = [];

    sorted.forEach((shift) => {
      if (isFullShift(shift.name)) {
        if (isMorningShift(shift)) {
          morningFullShifts.push(shift);
        } else if (isAfternoonShift(shift)) {
          afternoonFullShifts.push(shift);
        } else {
          regularShifts.push(shift);
        }
      } else if (isMorningShift(shift)) {
        morningShifts.push(shift);
      } else if (isAfternoonShift(shift)) {
        afternoonShifts.push(shift);
      } else {
        regularShifts.push(shift);
      }
    });

    return {
      regularShifts,
      morningShifts,
      afternoonShifts,
      morningFullShifts,
      afternoonFullShifts,
    };
  };

  const {
    morningShifts,
    afternoonShifts,
    morningFullShifts,
    afternoonFullShifts,
  } = processShifts();
  // Check if a given shift is covered by a full shift
  const isShiftCoveredByFullShift = (
    dayIndex: number,
    shiftId: string
  ): EnrolledClass | null => {
    // Get the shift details
    const shift = shifts.find((s) => s.id === shiftId);

    if (!shift) return null;

    // Check if there's a full shift covering this time slot
    return (
      enrolledClasses.find((cls) => {
        // Must be the same day
        if (cls.dayOfWeek !== dayIndex) return false;

        // Get the enrollment's shift
        const enrolledShift = shifts.find((s) => s.id === cls.shiftId);

        if (!enrolledShift) return false;

        // Check if this is a full shift
        if (!isFullShift(enrolledShift.name)) return false;

        // Check if the full shift covers this shift (morning or afternoon)
        if (isMorningShift(enrolledShift) && isMorningShift(shift)) return true;
        if (isAfternoonShift(enrolledShift) && isAfternoonShift(shift))
          return true;

        return false;
      }) || null
    );
  };

  const getClassForSlot = (
    dayIndex: number,
    shiftId: string
  ): EnrolledClass | null => {
    // Check for exact match first
    const exactMatch = enrolledClasses.find(
      (cls) => cls.dayOfWeek === dayIndex && cls.shiftId === shiftId
    );

    if (exactMatch) return exactMatch;

    // Check if there's a full shift covering this time slot
    const fullShiftClass = isShiftCoveredByFullShift(dayIndex, shiftId);

    return fullShiftClass;
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="fixed bottom-6 right-6 z-50 bg-gray-400 text-white px-4 py-2 rounded-full shadow-lg"
      >
        📅 Loading...
      </button>
    );
  }

  if (error) {
    return (
      <button
        disabled
        className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        📅 Error
      </button>
    );
  }

  return (
    <>
      {" "}
      {/* Fixed Schedule Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {enrolledClasses.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {enrolledClasses.length}
          </div>
        )}
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
          onClick={() => setIsOpen(true)}
        >
          📅 View Schedule
        </button>
      </div>
      {/* Schedule Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Schedule</h2>
              <button
                className="text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-300 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                ✕ Close
              </button>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium">
                      Time
                    </th>
                    {daysOfWeek.map((day) => (
                      <th
                        key={day}
                        className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>{" "}
                <tbody>
                  {/* Morning 1 row */}
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                      <div>Morning 1</div>
                      <div className="text-xs text-gray-600">06:50 - 09:20</div>
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      // Check if there's a full morning class
                      const morningFullClass = enrolledClasses.find(
                        (cls) =>
                          cls.dayOfWeek === dayIndex &&
                          morningFullShifts.some((s) => s.id === cls.shiftId)
                      );

                      // If there's a full morning class, render it with rowSpan 2
                      if (morningFullClass) {
                        return (
                          <td
                            key={dayIndex}
                            className="border p-2 text-sm min-h-[80px] bg-blue-100 border-blue-300"
                            rowSpan={2}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {morningFullClass.name}
                              </div>
                              {morningFullClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {morningFullClass.room}
                                </div>
                              )}
                              {morningFullClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {morningFullClass.instructor}
                                </div>
                              )}
                              <div className="text-xs italic text-blue-600">
                                Morning Full
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Otherwise, render a regular morning 1 cell
                      const morning1Shift = morningShifts.find(
                        (s) =>
                          s.name.toLowerCase().includes("morning 1") ||
                          s.name.toLowerCase().includes("morning1")
                      );

                      const enrolledClass = morning1Shift
                        ? getClassForSlot(dayIndex, morning1Shift.id)
                        : null;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-300 p-2 text-sm min-h-[80px] ${
                            enrolledClass
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white"
                          }`}
                        >
                          {enrolledClass && (
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {enrolledClass.name}
                              </div>
                              {enrolledClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {enrolledClass.room}
                                </div>
                              )}
                              {enrolledClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {enrolledClass.instructor}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Morning 2 row */}
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                      <div>Morning 2</div>
                      <div className="text-xs text-gray-600">09:30 - 12:00</div>
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      // Skip if there's a full morning class (already rendered with rowSpan)
                      const morningFullClass = enrolledClasses.find(
                        (cls) =>
                          cls.dayOfWeek === dayIndex &&
                          morningFullShifts.some((s) => s.id === cls.shiftId)
                      );

                      if (morningFullClass) {
                        return null; // Skip this cell
                      }

                      // Otherwise, render a regular morning 2 cell
                      const morning2Shift = morningShifts.find(
                        (s) =>
                          s.name.toLowerCase().includes("morning 2") ||
                          s.name.toLowerCase().includes("morning2")
                      );

                      const enrolledClass = morning2Shift
                        ? getClassForSlot(dayIndex, morning2Shift.id)
                        : null;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-300 p-2 text-sm min-h-[80px] ${
                            enrolledClass
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white"
                          }`}
                        >
                          {enrolledClass && (
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {enrolledClass.name}
                              </div>
                              {enrolledClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {enrolledClass.room}
                                </div>
                              )}
                              {enrolledClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {enrolledClass.instructor}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Afternoon 1 row */}
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                      <div>Afternoon 1</div>
                      <div className="text-xs text-gray-600">12:50 - 15:20</div>
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      // Check if there's a full afternoon class
                      const afternoonFullClass = enrolledClasses.find(
                        (cls) =>
                          cls.dayOfWeek === dayIndex &&
                          afternoonFullShifts.some((s) => s.id === cls.shiftId)
                      );

                      // If there's a full afternoon class, render it with rowSpan 2
                      if (afternoonFullClass) {
                        return (
                          <td
                            key={dayIndex}
                            className="border p-2 text-sm min-h-[80px] bg-blue-100 border-blue-300"
                            rowSpan={2}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {afternoonFullClass.name}
                              </div>
                              {afternoonFullClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {afternoonFullClass.room}
                                </div>
                              )}
                              {afternoonFullClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {afternoonFullClass.instructor}
                                </div>
                              )}
                              <div className="text-xs italic text-blue-600">
                                Afternoon Full
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Otherwise, render a regular afternoon 1 cell
                      const afternoon1Shift = afternoonShifts.find(
                        (s) =>
                          s.name.toLowerCase().includes("afternoon 1") ||
                          s.name.toLowerCase().includes("afternoon1")
                      );

                      const enrolledClass = afternoon1Shift
                        ? getClassForSlot(dayIndex, afternoon1Shift.id)
                        : null;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-300 p-2 text-sm min-h-[80px] ${
                            enrolledClass
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white"
                          }`}
                        >
                          {enrolledClass && (
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {enrolledClass.name}
                              </div>
                              {enrolledClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {enrolledClass.room}
                                </div>
                              )}
                              {enrolledClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {enrolledClass.instructor}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Afternoon 2 row */}
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                      <div>Afternoon 2</div>
                      <div className="text-xs text-gray-600">15:30 - 18:00</div>
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      // Skip if there's a full afternoon class (already rendered with rowSpan)
                      const afternoonFullClass = enrolledClasses.find(
                        (cls) =>
                          cls.dayOfWeek === dayIndex &&
                          afternoonFullShifts.some((s) => s.id === cls.shiftId)
                      );

                      if (afternoonFullClass) {
                        return null; // Skip this cell
                      }

                      // Otherwise, render a regular afternoon 2 cell
                      const afternoon2Shift = afternoonShifts.find(
                        (s) =>
                          s.name.toLowerCase().includes("afternoon 2") ||
                          s.name.toLowerCase().includes("afternoon2")
                      );

                      const enrolledClass = afternoon2Shift
                        ? getClassForSlot(dayIndex, afternoon2Shift.id)
                        : null;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-300 p-2 text-sm min-h-[80px] ${
                            enrolledClass
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white"
                          }`}
                        >
                          {enrolledClass && (
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800">
                                {enrolledClass.name}
                              </div>
                              {enrolledClass.room && (
                                <div className="text-xs text-gray-600">
                                  Room: {enrolledClass.room}
                                </div>
                              )}
                              {enrolledClass.instructor && (
                                <div className="text-xs text-gray-600">
                                  {enrolledClass.instructor}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {enrolledClasses.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                No classes enrolled yet. Start enrolling in classes to see your
                schedule!
              </div>
            )}

            {enrolledClasses.length > 0 && (
              <div className="flex justify-end mt-6">
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md shadow-md transition-colors disabled:bg-gray-400"
                  disabled={isSubmitting}
                  onClick={handleCompleteEnrollment}
                >
                  {isSubmitting ? "Processing..." : "Complete Enroll"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleViewer;
export type { EnrolledClass };
