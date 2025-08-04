import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Clock, MapPin } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSemesters } from "@/services/semester/semester.hooks";
import { useStudentExams } from "@/services/exam/exam.hooks";
import { Semester } from "@/services/semester/semester.schema";
import { Exam } from "@/services/exam/exam.schema";
import DefaultLayout from "@/layouts/default";

const examTypeMap: Record<number, string> = {
  1: "Midterm",
  2: "Final",
  3: "Quiz",
  4: "Lab",
  5: "Practical",
};

function formatDateTime(dateTime: string | Date) {
  return new Date(dateTime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }

  return `${mins}m`;
}

const StudentExamTable: React.FC<{ exams: Exam[]; isLoading: boolean }> = ({
  exams,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Table aria-label="Student Exam Schedule" className="min-w-full">
      <TableHeader>
        <TableColumn className="font-semibold w-48">
          Exam Date & Time
        </TableColumn>
        <TableColumn className="font-semibold w-28">Type</TableColumn>
        <TableColumn className="font-semibold w-24">Group</TableColumn>
        <TableColumn className="font-semibold w-28">Duration</TableColumn>
        <TableColumn className="font-semibold w-40">Class</TableColumn>
        <TableColumn className="font-semibold w-40">Room</TableColumn>
        {/* <TableColumn className="font-semibold w-32">Enrolled</TableColumn> */}
      </TableHeader>
      <TableBody>
        {exams.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <div className="text-center py-8 text-gray-500">
                No exams found
              </div>
            </TableCell>
          </TableRow>
        ) : (
          exams.map((exam: Exam) => (
            <TableRow key={exam.id} className="hover:bg-blue-50 cursor-default">
              <TableCell>
                <div className="font-medium">
                  {formatDateTime(exam.examTime)}
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {examTypeMap[exam.type] || `Type ${exam.type}`}
                </span>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Group {exam.group}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatDuration(exam.duration)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">
                    {exam.academicClass?.name || "N/A"}
                  </div>
                  {exam.academicClass?.groupNumber && (
                    <div className="text-gray-500 text-xs">
                      Group {exam.academicClass.groupNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin size={14} />
                  <div>
                    <div className="font-medium">
                      {exam.room?.name || "N/A"}
                    </div>
                    {exam.room?.availableSeats && (
                      <div className="text-gray-500 text-xs">
                        {exam.room.availableSeats} seats
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              {/* <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Users size={12} />
                  <span className="text-xs">
                    {exam.totalEnrollment || 0} enrolled
                  </span>
                </div>
              </TableCell> */}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const ExamSchedulePage = () => {
  const { user, studentInfo, isLoading: authLoading } = useAuth();

  // Fetch all semesters (first 100 for dropdown)
  const { data: semesterData, isLoading: semestersLoading } = useSemesters({
    pageNumber: 1,
    itemsPerpage: 100,
    isDesc: false,
  });
  const semesters: Semester[] = semesterData?.data?.data || [];

  // Default to active semester if available
  const defaultSemester = useMemo(
    () => semesters.find((s) => s.isActive) || semesters[0],
    [semesters]
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<
    string | undefined
  >(defaultSemester?.id);
  const [search, setSearch] = useState("");

  // Update selected semester when semesters load
  useEffect(() => {
    if (defaultSemester) setSelectedSemesterId(defaultSemester.id);
  }, [defaultSemester]);

  // Sort semesters by year and semesterNumber descending
  const sortedSemesters = useMemo(() => {
    return [...semesters].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;

      return b.semesterNumber - a.semesterNumber;
    });
  }, [semesters]);

  // Filter semesters by search
  const filteredSemesters = useMemo(() => {
    if (!search) return sortedSemesters;

    return sortedSemesters.filter((semester) => {
      const label = `${semester.year} - Semester ${semester.semesterNumber}`;

      return label.toLowerCase().includes(search.toLowerCase());
    });
  }, [sortedSemesters, search]);

  // Fetch student exams using the new hook
  const {
    data: exams = [],
    isLoading,
    error,
  } = useStudentExams(
    user?.role === "Student" && studentInfo?.id ? studentInfo.id : ""
  );

  // Find selected semester object
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);

  // Filter exams by selected semester's start and end date
  const filteredExams = useMemo(() => {
    if (!selectedSemester) return exams;
    const start = new Date(selectedSemester.startDate).getTime();
    const end = new Date(selectedSemester.endDate).getTime();

    return exams.filter((exam: Exam) => {
      const examTime = new Date(exam.examTime).getTime();

      return examTime >= start && examTime <= end;
    });
  }, [exams, selectedSemester]);

  if (authLoading || semestersLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );

  return (
    <DefaultLayout>
      <div className="mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Exam Schedule</h1>
        <div className="mb-6 max-w-xs">
          <label
            className="block mb-1 font-medium"
            htmlFor="semester-autocomplete"
          >
            Semester
          </label>
          <Autocomplete
            allowsCustomValue={false}
            className="w-full"
            defaultItems={filteredSemesters}
            id="semester-autocomplete"
            inputValue={search}
            placeholder="Search and select semester"
            selectedKey={selectedSemesterId || null}
            onInputChange={setSearch}
            onSelectionChange={(key) => {
              setSelectedSemesterId(key?.toString() || undefined);
            }}
          >
            {(semester) => (
              <AutocompleteItem
                key={semester.id}
                textValue={`${semester.year} - Semester ${semester.semesterNumber}`}
              >
                <div className="flex items-center">
                  <span>
                    {semester.year} - Semester {semester.semesterNumber}
                  </span>
                  {semester.isActive && (
                    <span className="ml-2 text-xs text-green-600">
                      (Active)
                    </span>
                  )}
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        {error && (
          <p className="text-red-600 mb-4">
            {typeof error === "string"
              ? error
              : error?.message || "An error occurred"}
          </p>
        )}
        <StudentExamTable exams={filteredExams} isLoading={isLoading} />
      </div>
    </DefaultLayout>
  );
};

export default ExamSchedulePage;
