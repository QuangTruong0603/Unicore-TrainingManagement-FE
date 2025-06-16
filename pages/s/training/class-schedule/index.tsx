import React, { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@heroui/react";

import DefaultLayout from "../../../../layouts/default";
import { useAuth } from "../../../../hooks/useAuth";
import { useActiveStudentEnrollments } from "../../../../services/enrollment/enrollment.hooks";
import { useSemesters } from "../../../../services/semester/semester.hooks";
import { useAllShifts } from "../../../../services/shift/shift.hooks";
import { EnrolledClass } from "../../../../components/s/enrollment";
import { Enrollment } from "../../../../services/enrollment/enrollment.schema";
import { Shift } from "../../../../services/shift/shift.schema";
import "./index.scss";

const ClassSchedulePage: React.FC = () => {
  const { studentInfo } = useAuth();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Fetch semesters
  const { data: semestersData, isLoading: isLoadingSemesters } = useSemesters({
    pageNumber: 1,
    itemsPerpage: 100,
    isDesc: false,
  });

  // Fetch shifts
  const { data: shiftsData } = useAllShifts();

  // Fetch student enrollments for the selected semester, excluding rejected ones
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } =
    useActiveStudentEnrollments(studentInfo?.id || "", selectedSemesterId);

  const semesters = semestersData?.data?.data || [];
  const enrollments = enrollmentsData?.data || [];
  const shifts: Shift[] = shiftsData?.data || []; // Get the selected semester to show number of weeks
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);
  const numberOfWeeks = selectedSemester?.numberOfWeeks || 0;

  // Auto-detect current semester and week based on current date
  const getCurrentSemesterAndWeek = () => {
    const currentDate = new Date();
    let currentSemester = null;
    let currentWeek = 1;

    // Find the semester that contains the current date
    for (const semester of semesters) {
      const startDate = new Date(semester.startDate);
      const endDate = new Date(semester.endDate);

      if (currentDate >= startDate && currentDate <= endDate) {
        currentSemester = semester;
        // Calculate which week we're in
        // Calculate the start of the first week (Monday of the first week)
        const firstWeekStart = new Date(startDate);
        const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        firstWeekStart.setDate(startDate.getDate() + daysToMonday);

        // Calculate which week the current date falls into
        const weekTimeDiff = currentDate.getTime() - firstWeekStart.getTime();
        const weekDaysDiff = Math.floor(weekTimeDiff / (1000 * 3600 * 24));

        currentWeek = Math.max(1, Math.floor(weekDaysDiff / 7) + 1);

        // Ensure week doesn't exceed semester's total weeks
        currentWeek = Math.min(currentWeek, semester.numberOfWeeks || 1);

        break;
      }
    }

    // If no current semester found, try to find the next upcoming semester
    if (!currentSemester) {
      const upcomingSemesters = semesters
        .filter((semester) => new Date(semester.startDate) > currentDate)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

      if (upcomingSemesters.length > 0) {
        currentSemester = upcomingSemesters[0];
        currentWeek = 1;
      }
    }

    // If still no semester found, use the most recent semester
    if (!currentSemester && semesters.length > 0) {
      const sortedSemesters = [...semesters].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      currentSemester = sortedSemesters[0];
      currentWeek = 1;
    }

    return { currentSemester, currentWeek };
  };

  // Auto-set semester and week when semesters data is loaded
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const { currentSemester, currentWeek } = getCurrentSemesterAndWeek();

      if (currentSemester) {
        setSelectedSemesterId(currentSemester.id);
        setSelectedWeek(currentWeek);
      }
    }
  }, [semesters, selectedSemesterId]);

  // Filter enrollments to show only classes that are scheduled for the selected week
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const academicClass = enrollment.academicClass;

      if (
        !academicClass?.listOfWeeks ||
        academicClass.listOfWeeks.length === 0
      ) {
        return true; // Show classes without week restrictions for all weeks
      }

      return academicClass.listOfWeeks.includes(selectedWeek);
    });
  }, [enrollments, selectedWeek]);

  // Convert enrollments to the format expected by ScheduleViewer
  const enrolledClasses: EnrolledClass[] = useMemo(() => {
    const classes: EnrolledClass[] = [];

    filteredEnrollments.forEach((enrollment: Enrollment) => {
      const academicClass = enrollment.academicClass;

      if (!academicClass?.scheduleInDays) return;

      academicClass.scheduleInDays.forEach((schedule) => {
        if (!schedule.dayOfWeek || !schedule.shiftId) return;

        // Convert day of week from string to number (0 = Monday, 6 = Sunday)
        const dayOfWeekMap: { [key: string]: number } = {
          Monday: 0,
          Tuesday: 1,
          Wednesday: 2,
          Thursday: 3,
          Friday: 4,
          Saturday: 5,
          Sunday: 6,
        };

        const dayOfWeek = dayOfWeekMap[schedule.dayOfWeek] ?? 0;

        // Find instructor from course information if available
        const instructor = academicClass.course?.name || "TBA";

        classes.push({
          id: enrollment.id,
          name: academicClass.name || "Unknown Class",
          dayOfWeek: dayOfWeek,
          shiftId: schedule.shiftId,
          room: schedule.room?.name || "TBA",
          instructor: instructor,
          listOfWeeks: academicClass.listOfWeeks || [],
        });
      });
    });

    return classes;
  }, [filteredEnrollments]);

  // Get unique weeks from all enrolled classes to show in the week selector
  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>();

    enrollments.forEach((enrollment) => {
      const academicClass = enrollment.academicClass;

      if (academicClass?.listOfWeeks && academicClass.listOfWeeks.length > 0) {
        academicClass.listOfWeeks.forEach((week) => weeks.add(week));
      } else {
        // If no specific weeks, add all weeks from 1 to numberOfWeeks
        for (let i = 1; i <= numberOfWeeks; i++) {
          weeks.add(i);
        }
      }
    });

    return Array.from(weeks).sort((a, b) => a - b);
  }, [enrollments, numberOfWeeks]);

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
    setSelectedWeek(1); // Reset to week 1 when semester changes
  };

  const handleWeekChange = (value: string) => {
    setSelectedWeek(parseInt(value));
  };

  // Calculate week date ranges based on semester start date
  const getWeekDateRange = (weekNumber: number): string => {
    if (!selectedSemester) return "";

    // Parse the semester start date
    const startDate = new Date(selectedSemester.startDate);

    // Calculate the start of the first week (Monday of the first week)
    const firstWeekStart = new Date(startDate);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate days to previous/next Monday

    firstWeekStart.setDate(startDate.getDate() + daysToMonday);

    // Calculate the start of the specified week
    const weekStartDate = new Date(firstWeekStart);

    weekStartDate.setDate(firstWeekStart.getDate() + (weekNumber - 1) * 7);

    // Calculate the end of the week (Sunday)
    const weekEndDate = new Date(weekStartDate);

    weekEndDate.setDate(weekStartDate.getDate() + 6);

    // Format dates
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;
  };

  if (!studentInfo) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Card>
            <CardBody>
              <p className="text-center text-gray-600">
                Please log in to view your class schedule.
              </p>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          {" "}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {" "}
            Class Schedule
          </h1>
          <p className="text-gray-600">
            {" "}
            View your enrolled classes schedule by semester and week
          </p>
        </div>
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            {" "}
            <h2 className="text-xl font-semibold">Filters</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester Selector */}
              <div>
                <Select
                  isLoading={isLoadingSemesters}
                  label="Select Semester"
                  placeholder="Choose a semester"
                  selectedKeys={
                    selectedSemesterId
                      ? new Set([selectedSemesterId])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleSemesterChange(selectedKey);
                  }}
                >
                  {semesters.map((semester) => {
                    const displayText = `Semester ${semester.semesterNumber} - ${semester.year}${semester.isActive ? " (Active)" : ""}`;

                    return (
                      <SelectItem key={semester.id} textValue={displayText}>
                        Semester {semester.semesterNumber} - {semester.year}
                        {semester.isActive && " (Active)"}
                      </SelectItem>
                    );
                  })}
                </Select>
              </div>
              {/* Week Selector */}
              <div>
                <Select
                  isDisabled={
                    !selectedSemesterId || availableWeeks.length === 0
                  }
                  label="Select Week"
                  placeholder="Choose a week"
                  selectedKeys={
                    selectedWeek
                      ? new Set([selectedWeek.toString()])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleWeekChange(selectedKey);
                  }}
                >
                  {availableWeeks.map((week) => {
                    const dateRange = getWeekDateRange(week);
                    const displayText = `Week ${week} (${dateRange})`;

                    return (
                      <SelectItem key={week.toString()} textValue={displayText}>
                        Week {week} ({dateRange})
                      </SelectItem>
                    );
                  })}
                </Select>
              </div>
            </div>
            {selectedSemester && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Selected Semester:</strong> Semester{" "}
                  {selectedSemester.semesterNumber} - {selectedSemester.year}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Duration:</strong>{" "}
                  {new Date(selectedSemester.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedSemester.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Total Weeks:</strong> {selectedSemester.numberOfWeeks}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Current Week:</strong> {selectedWeek}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Week Dates:</strong> {getWeekDateRange(selectedWeek)}
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Schedule Display */}
        {selectedSemesterId ? (
          <Card>
            {" "}
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-semibold">
                  Schedule for Week {selectedWeek}
                  {selectedSemester && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({getWeekDateRange(selectedWeek)})
                    </span>
                  )}
                </h2>
                <div className="text-sm text-gray-600">
                  {filteredEnrollments.length} classes enrolled
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {isLoadingEnrollments ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-3">Loading schedule...</span>
                </div>
              ) : enrolledClasses.length > 0 ? (
                <div className="relative">
                  {/* Custom Schedule Display */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-medium">
                            Time
                          </th>
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <th
                              key={day}
                              className="border border-gray-300 p-3 bg-gray-100 text-sm font-medium"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Helper functions based on ScheduleViewer.tsx
                          const isFullShift = (shiftName: string) => {
                            const lowerName = shiftName.toLowerCase();

                            return (
                              lowerName.includes("morning full") ||
                              lowerName.includes("afternoon full") ||
                              lowerName.includes("full morning") ||
                              lowerName.includes("full afternoon")
                            );
                          };

                          const isMorningShift = (shift: Shift) => {
                            const lowerName = shift.name?.toLowerCase() || "";

                            return (
                              lowerName.includes("morning") ||
                              lowerName.includes("sáng") ||
                              (shift.startTime && shift.startTime < "12:00")
                            );
                          };

                          const isAfternoonShift = (shift: Shift) => {
                            const lowerName = shift.name?.toLowerCase() || "";

                            return (
                              lowerName.includes("afternoon") ||
                              lowerName.includes("chiều") ||
                              (shift.startTime &&
                                shift.startTime >= "12:00" &&
                                shift.startTime < "18:00")
                            );
                          };

                          // Process shifts similar to ScheduleViewer.tsx
                          const processShifts = () => {
                            const morningShifts = shifts.filter(
                              (shift) =>
                                isMorningShift(shift) &&
                                !isFullShift(shift.name || "")
                            );
                            const afternoonShifts = shifts.filter(
                              (shift) =>
                                isAfternoonShift(shift) &&
                                !isFullShift(shift.name || "")
                            );
                            const morningFullShifts = shifts.filter(
                              (shift) =>
                                isMorningShift(shift) &&
                                isFullShift(shift.name || "")
                            );
                            const afternoonFullShifts = shifts.filter(
                              (shift) =>
                                isAfternoonShift(shift) &&
                                isFullShift(shift.name || "")
                            );

                            return {
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

                          const getClassesForSlot = (
                            dayIndex: number,
                            shiftId: string
                          ): EnrolledClass[] => {
                            return enrolledClasses.filter(
                              (cls) =>
                                cls.dayOfWeek === dayIndex &&
                                cls.shiftId === shiftId
                            );
                          };

                          // Component to render a schedule cell
                          const ScheduleCell: React.FC<{
                            classes: EnrolledClass[];
                          }> = ({ classes }) => {
                            const hasClasses = classes.length > 0;

                            return (
                              <td
                                className={`border border-gray-300 p-2 text-sm min-h-[80px] ${
                                  hasClasses
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-white"
                                }`}
                              >
                                {hasClasses && (
                                  <div className="space-y-2">
                                    {classes.map((enrolledClass, index) => (
                                      <div
                                        key={enrolledClass.id}
                                        className={`${
                                          index > 0
                                            ? "border-t border-blue-200 pt-2"
                                            : ""
                                        }`}
                                      >
                                        <div className="font-semibold text-blue-800 text-xs">
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
                                        {enrolledClass.listOfWeeks &&
                                          enrolledClass.listOfWeeks.length >
                                            0 && (
                                            <div className="text-xs text-purple-600 font-medium">
                                              Weeks:{" "}
                                              {enrolledClass.listOfWeeks.join(
                                                ", "
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          };

                          return (
                            <>
                              {/* Morning 1 row */}
                              <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                                  <div>Morning 1</div>
                                  <div className="text-xs text-gray-600">
                                    06:50 - 09:20
                                  </div>
                                </td>
                                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                                  // Check if there's a full morning class
                                  const morningFullClass = enrolledClasses.find(
                                    (cls) =>
                                      cls.dayOfWeek === dayIndex &&
                                      morningFullShifts.some(
                                        (s) => s.id === cls.shiftId
                                      )
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
                                          {morningFullClass.listOfWeeks &&
                                            morningFullClass.listOfWeeks
                                              .length > 0 && (
                                              <div className="text-xs text-purple-600 font-medium">
                                                Weeks:{" "}
                                                {morningFullClass.listOfWeeks.join(
                                                  ", "
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </td>
                                    );
                                  }

                                  // Otherwise, render a regular morning 1 cell
                                  const morning1Shift = morningShifts.find(
                                    (s) =>
                                      s.name
                                        ?.toLowerCase()
                                        .includes("morning 1") ||
                                      s.name
                                        ?.toLowerCase()
                                        .includes("morning1") ||
                                      (s.startTime &&
                                        s.startTime.startsWith("06:")) ||
                                      (s.startTime &&
                                        s.startTime.startsWith("07:"))
                                  );

                                  const classesForSlot = morning1Shift
                                    ? getClassesForSlot(
                                        dayIndex,
                                        morning1Shift.id
                                      )
                                    : [];

                                  return (
                                    <ScheduleCell
                                      key={dayIndex}
                                      classes={classesForSlot}
                                    />
                                  );
                                })}
                              </tr>

                              {/* Morning 2 row */}
                              <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                                  <div>Morning 2</div>
                                  <div className="text-xs text-gray-600">
                                    09:30 - 12:00
                                  </div>
                                </td>
                                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                                  // Skip if there's a full morning class (already rendered with rowSpan)
                                  const morningFullClass = enrolledClasses.find(
                                    (cls) =>
                                      cls.dayOfWeek === dayIndex &&
                                      morningFullShifts.some(
                                        (s) => s.id === cls.shiftId
                                      )
                                  );

                                  if (morningFullClass) {
                                    return null; // Skip this cell
                                  }

                                  // Otherwise, render a regular morning 2 cell
                                  const morning2Shift = morningShifts.find(
                                    (s) =>
                                      s.name
                                        ?.toLowerCase()
                                        .includes("morning 2") ||
                                      s.name
                                        ?.toLowerCase()
                                        .includes("morning2") ||
                                      (s.startTime &&
                                        (s.startTime.startsWith("09:") ||
                                          s.startTime.startsWith("10:")))
                                  );

                                  const classesForSlot = morning2Shift
                                    ? getClassesForSlot(
                                        dayIndex,
                                        morning2Shift.id
                                      )
                                    : [];

                                  return (
                                    <ScheduleCell
                                      key={dayIndex}
                                      classes={classesForSlot}
                                    />
                                  );
                                })}
                              </tr>

                              {/* Afternoon 1 row */}
                              <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                                  <div>Afternoon 1</div>
                                  <div className="text-xs text-gray-600">
                                    12:50 - 15:20
                                  </div>
                                </td>
                                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                                  // Check if there's a full afternoon class
                                  const afternoonFullClass =
                                    enrolledClasses.find(
                                      (cls) =>
                                        cls.dayOfWeek === dayIndex &&
                                        afternoonFullShifts.some(
                                          (s) => s.id === cls.shiftId
                                        )
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
                                          {afternoonFullClass.listOfWeeks &&
                                            afternoonFullClass.listOfWeeks
                                              .length > 0 && (
                                              <div className="text-xs text-purple-600 font-medium">
                                                Weeks:{" "}
                                                {afternoonFullClass.listOfWeeks.join(
                                                  ", "
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </td>
                                    );
                                  }

                                  // Otherwise, render a regular afternoon 1 cell
                                  const afternoon1Shift = afternoonShifts.find(
                                    (s) =>
                                      s.name
                                        ?.toLowerCase()
                                        .includes("afternoon 1") ||
                                      s.name
                                        ?.toLowerCase()
                                        .includes("afternoon1") ||
                                      (s.startTime &&
                                        (s.startTime.startsWith("12:") ||
                                          s.startTime.startsWith("13:")))
                                  );

                                  const classesForSlot = afternoon1Shift
                                    ? getClassesForSlot(
                                        dayIndex,
                                        afternoon1Shift.id
                                      )
                                    : [];

                                  return (
                                    <ScheduleCell
                                      key={dayIndex}
                                      classes={classesForSlot}
                                    />
                                  );
                                })}
                              </tr>

                              {/* Afternoon 2 row */}
                              <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-center">
                                  <div>Afternoon 2</div>
                                  <div className="text-xs text-gray-600">
                                    15:30 - 18:00
                                  </div>
                                </td>
                                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                                  // Skip if there's a full afternoon class (already rendered with rowSpan)
                                  const afternoonFullClass =
                                    enrolledClasses.find(
                                      (cls) =>
                                        cls.dayOfWeek === dayIndex &&
                                        afternoonFullShifts.some(
                                          (s) => s.id === cls.shiftId
                                        )
                                    );

                                  if (afternoonFullClass) {
                                    return null; // Skip this cell
                                  }

                                  // Otherwise, render a regular afternoon 2 cell
                                  const afternoon2Shift = afternoonShifts.find(
                                    (s) =>
                                      s.name
                                        ?.toLowerCase()
                                        .includes("afternoon 2") ||
                                      s.name
                                        ?.toLowerCase()
                                        .includes("afternoon2") ||
                                      (s.startTime &&
                                        (s.startTime.startsWith("15:") ||
                                          s.startTime.startsWith("16:")))
                                  );

                                  const classesForSlot = afternoon2Shift
                                    ? getClassesForSlot(
                                        dayIndex,
                                        afternoon2Shift.id
                                      )
                                    : [];

                                  return (
                                    <ScheduleCell
                                      key={dayIndex}
                                      classes={classesForSlot}
                                    />
                                  );
                                })}
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium mb-2">
                    No Classes This Week
                  </h3>
                  <p>
                    You do not have any classes scheduled for week
                    {selectedWeek}.
                  </p>
                  {availableWeeks.length > 0 && (
                    <p className="mt-2 text-sm">
                      Try selecting a different week. Available weeks:{" "}
                      {availableWeeks.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-lg font-medium mb-2">Select a Semester</h3>
                <p>Please select a semester to view your class schedule.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ClassSchedulePage;
