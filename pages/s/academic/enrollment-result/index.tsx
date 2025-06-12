import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Button,
} from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";
import { useStudentEnrollments } from "@/services/enrollment/enrollment.hooks";
import { useSemesters } from "@/services/semester/semester.hooks";
import { Enrollment } from "@/services/enrollment/enrollment.schema";
import { SemesterQuery } from "@/services/semester/semester.schema";
import DefaultLayout from "@/layouts/default";
import "./index.scss";

const EnrollmentResultPage = () => {
  const { user, studentInfo } = useAuth();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  // Fetch semesters for dropdown
  const semesterQuery: SemesterQuery = {
    pageNumber: 1,
    itemsPerpage: 100, // Get all semesters
    isDesc: true,
    orderBy: "year",
  };

  const { data: semestersResponse, isLoading: isLoadingSemesters } =
    useSemesters(semesterQuery);

  // Fetch student enrollments
  const {
    data: enrollmentsResponse,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useStudentEnrollments(
    studentInfo?.id || "",
    selectedSemesterId || undefined
  );

  // Set default semester (current active semester)
  useEffect(() => {
    if (semestersResponse?.data?.data && !selectedSemesterId) {
      const activeSemester = semestersResponse.data.data.find(
        (semester) => semester.isActive
      );

      if (activeSemester) {
        setSelectedSemesterId(activeSemester.id);
      }
    }
  }, [semestersResponse, selectedSemesterId]);

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
  };

  const handleRefresh = () => {
    refetchEnrollments();
  };

  const getEnrollmentStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "warning";
      case 3:
        return "success";
      case 2:
        return "secondary";
      case 4:
        return "danger";
      default:
        return "default";
    }
  };

  const getEnrollmentStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Started";
      case 3:
        return "Passed";
      case 4:
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSchedule = (scheduleInDays: any[]) => {
    if (!scheduleInDays || scheduleInDays.length === 0) return "No schedule";

    return scheduleInDays
      .map((schedule) => {
        const day = schedule.dayOfWeek;
        const shift = schedule.shift?.name || "N/A";
        const room = schedule.room?.name || "N/A";

        return `${day} (${shift}) - ${room}`;
      })
      .join(", ");
  };

  if (!user || !studentInfo) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <p>Please login to view enrollment results</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Enrollment Results</h1>
              <p className="text-gray-600 mt-1">
                View your enrollment status for each semester
              </p>
            </div>
          </div>

          <Select
            isLoading={isLoadingSemesters}
            label="Select Semester"
            placeholder="Choose a semester"
            selectedKeys={selectedSemesterId ? [selectedSemesterId] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;

              handleSemesterChange(selectedKey);
            }}
          >
            {semestersResponse?.data?.data?.map((semester) => (
              <SelectItem key={semester.id}>
                {`Semester ${semester.semesterNumber} - ${semester.year} ${
                  semester.isActive ? "(Active)" : ""
                }`}
              </SelectItem>
            )) || []}
          </Select>

          {/* Enrollment Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold">Enrollment Details</h2>
                {enrollmentsResponse?.data && (
                  <Chip color="primary" variant="flat">
                    {enrollmentsResponse.data.length} enrollments
                  </Chip>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {isLoadingEnrollments ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : enrollmentsError ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Error loading enrollment data</p>
                  <Button
                    className="mt-4"
                    color="primary"
                    variant="ghost"
                    onPress={handleRefresh}
                  >
                    Try Again
                  </Button>
                </div>
              ) : !enrollmentsResponse?.data ||
                enrollmentsResponse.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No enrollment data found for the selected semester
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    isHeaderSticky
                    isStriped
                    aria-label="Enrollment results table"
                  >
                    <TableHeader>
                      <TableColumn>COURSE CODE</TableColumn>
                      <TableColumn>COURSE NAME</TableColumn>
                      <TableColumn>CLASS NAME</TableColumn>
                      <TableColumn>CREDITS</TableColumn>
                      <TableColumn>SCHEDULE</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>ENROLLED DATE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {enrollmentsResponse.data.map(
                        (enrollment: Enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              <div className="font-medium">
                                {enrollment.academicClass?.course?.code ||
                                  "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="font-medium truncate">
                                  {enrollment.academicClass?.course?.name ||
                                    "N/A"}
                                </p>
                                {enrollment.academicClass?.course
                                  ?.description && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {
                                      enrollment.academicClass.course
                                        .description
                                    }
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {enrollment.academicClass?.name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Group{" "}
                                  {enrollment.academicClass?.groupNumber ||
                                    "N/A"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip color="secondary" size="sm" variant="flat">
                                {enrollment.academicClass?.course?.credit || 0}{" "}
                                credits
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-600">
                                  {formatSchedule(
                                    enrollment.academicClass?.scheduleInDays ||
                                      []
                                  )}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={getEnrollmentStatusColor(
                                  enrollment.status
                                )}
                                size="sm"
                                variant="flat"
                              >
                                {getEnrollmentStatusText(enrollment.status)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {formatDate(enrollment.createdAt)}
                              </p>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EnrollmentResultPage;
