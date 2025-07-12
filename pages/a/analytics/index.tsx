import { useState, useMemo } from "react";
import {
  Spinner,
  Autocomplete,
  AutocompleteItem,
  Button,
  Pagination,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import React from "react";

import DefaultLayout from "@/layouts/default";
import { useClassAnalytics } from "@/services/class/class.hooks";
import { useSemesters } from "@/services/semester/semester.hooks";
import { useCourses } from "@/services/course/course.hooks";
import { AnalyticsTable } from "@/components/a/analytics/analytics-table";
import "./index.scss";
import { classService } from "@/services/class/class.service";

export default function AnalyticsPage() {
  // Filter state
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Table state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Always 10, do not expose or change

  // Query for classes with pagination
  const classQuery = useMemo(
    () => ({
      pageNumber: currentPage,
      itemsPerpage: itemsPerPage,
      isDesc: sortDirection === "desc",
      filters: {
        ...(selectedSemester && { semesterId: selectedSemester }),
        ...(selectedCourse && { courseId: selectedCourse }),
      },
      sortBy: sortKey || "name",
    }),
    [selectedSemester, selectedCourse, currentPage, sortKey, sortDirection]
  );

  // Fetch data
  const { data: classResponse, isLoading: isLoadingClasses } =
    useClassAnalytics(classQuery);
  const { data: semestersResponse } = useSemesters({
    pageNumber: 1,
    itemsPerpage: 100,
    isDesc: true,
  });

  const { data: coursesResponse, isLoading: isLoadingCourses } = useCourses({
    pageNumber: 1,
    itemsPerpage: 100,
    isDesc: false,
  });

  const [summary, setSummary] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Fetch summary when filters change
  React.useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const filters = {
          ...(selectedSemester && { semesterId: selectedSemester }),
          ...(selectedCourse && { courseId: selectedCourse }),
        };
        const res = await classService.getClassAnalyticsSummary(filters);

        setSummary(res.data);
      } catch (e) {
        setSummary(null);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [selectedSemester, selectedCourse]);

  // Prepare chart data (only first 10 items for chart)
  const chartData = useMemo(() => {
    if (!classResponse?.data?.data) return [];

    const data = classResponse.data.data.slice(0, 10).map((cls: any) => ({
      name: cls.name,
      students: cls.enrollmentCount,
      totalPassed: cls.totalPassed,
      totalFailed: cls.totalFailed,
      averageScore: cls.averageScore,
    }));

    return data;
  }, [classResponse]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!classResponse?.data?.data) return [];

    return classResponse.data.data.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      students: cls.enrollmentCount,
      totalPassed: cls.totalPassed,
      totalFailed: cls.totalFailed,
      averageScore: cls.averageScore,
      passRate:
        cls.enrollmentCount > 0
          ? (cls.totalPassed / cls.enrollmentCount) * 100
          : 0,
      failRate:
        cls.enrollmentCount > 0
          ? (cls.totalFailed / cls.enrollmentCount) * 100
          : 0,
      course: {
        code: cls.course?.code || "N/A",
        name: cls.course?.name || "N/A",
      },
      semester: {
        semesterNumber: cls.semester?.semesterNumber || 0,
        year: cls.semester?.year || 0,
      },
    }));
  }, [classResponse]);

  // Filter courses by selected major if needed
  const filteredCourses = useMemo(() => {
    const courseArr = coursesResponse?.data?.data || [];

    return courseArr;
  }, [coursesResponse]);

  // Pagination info
  const totalItems = classResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Prepare sorted semesters for autocomplete
  const sortedSemesters = useMemo(() => {
    const semesters = semestersResponse?.data?.data || [];

    return semesters.slice().sort((a: any, b: any) => {
      if (b.year !== a.year) return b.year - a.year;

      return (b.semesterNumber || 0) - (a.semesterNumber || 0);
    });
  }, [semestersResponse]);

  // Table handlers
  const handleRowToggle = (classId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear expanded rows when changing page
    setExpandedRows({});
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setExpandedRows({});
  }, [selectedSemester, selectedCourse]);

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="mt-6">
          {/* Analytics Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow">
              <CardHeader className="flex flex-col items-center pb-0">
                <div className="text-gray-500 text-sm mb-1">
                  Total Enrollment
                </div>
              </CardHeader>
              <CardBody className="flex flex-col items-center pt-2">
                <div className="text-2xl font-bold text-orange-500">
                  {isLoadingSummary ? (
                    <Spinner size="sm" />
                  ) : (
                    (summary?.totalEnrollment ?? 0)
                  )}
                </div>
              </CardBody>
            </Card>
            <Card className="shadow">
              <CardHeader className="flex flex-col items-center pb-0">
                <div className="text-gray-500 text-sm mb-1">Total Passed</div>
              </CardHeader>
              <CardBody className="flex flex-col items-center pt-2">
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingSummary ? (
                    <Spinner size="sm" />
                  ) : (
                    (summary?.totalPassed ?? 0)
                  )}
                </div>
              </CardBody>
            </Card>
            <Card className="shadow">
              <CardHeader className="flex flex-col items-center pb-0">
                <div className="text-gray-500 text-sm mb-1">Total Failed</div>
              </CardHeader>
              <CardBody className="flex flex-col items-center pt-2">
                <div className="text-2xl font-bold text-red-500">
                  {isLoadingSummary ? (
                    <Spinner size="sm" />
                  ) : (
                    (summary?.totalFailed ?? 0)
                  )}
                </div>
              </CardBody>
            </Card>
            <Card className="shadow">
              <CardHeader className="flex flex-col items-center pb-0">
                <div className="text-gray-500 text-sm mb-1">Average Score</div>
              </CardHeader>
              <CardBody className="flex flex-col items-center pt-2">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingSummary ? (
                    <Spinner size="sm" />
                  ) : (
                    (summary?.totalAverageScore?.toFixed(2) ?? "0.00")
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                color="primary"
                size="sm"
                variant={viewMode === "chart" ? "solid" : "bordered"}
                onClick={() => setViewMode("chart")}
              >
                Chart View
              </Button>
              <Button
                color="primary"
                size="sm"
                variant={viewMode === "table" ? "solid" : "bordered"}
                onClick={() => setViewMode("table")}
              >
                Table View
              </Button>
            </div>
          </div>

          {/* Filters and Pagination Row */}
          <div className="flex flex-wrap gap-4 mb-6 items-end justify-between">
            <div className="flex gap-4">
              {/* Semester Filter */}
              <Autocomplete
                isClearable
                className="w-64"
                label="Semester"
                placeholder="Select semester"
                selectedKey={selectedSemester || "all"}
                onSelectionChange={(key) => {
                  const selectedKey = key as string;

                  setSelectedSemester(selectedKey === "all" ? "" : selectedKey);
                }}
              >
                <AutocompleteItem key="all">All Semesters</AutocompleteItem>
                <>
                  {sortedSemesters.map((semester: any) => (
                    <AutocompleteItem key={String(semester.id)}>
                      {`Semester ${semester.semesterNumber}/${semester.year}`}
                    </AutocompleteItem>
                  ))}
                </>
              </Autocomplete>
              {/* Course Filter */}
              <Autocomplete
                isClearable
                className="w-64"
                isLoading={isLoadingCourses}
                label="Course"
                placeholder="Select course"
                selectedKey={selectedCourse || "all"}
                onSelectionChange={(key) => {
                  const selectedKey = key as string;

                  setSelectedCourse(selectedKey === "all" ? "" : selectedKey);
                }}
              >
                <AutocompleteItem key="all">All Courses</AutocompleteItem>
                <>
                  {(filteredCourses || []).map((course: any) => (
                    <AutocompleteItem key={String(course.id)}>
                      {course.name}
                    </AutocompleteItem>
                  ))}
                </>
              </Autocomplete>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} results
              </div>
              <Pagination
                showControls
                showShadow
                color="primary"
                page={currentPage}
                size="sm"
                total={totalPages}
                onChange={handlePageChange}
              />
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === "chart" ? (
            <div className="bg-white rounded shadow p-4 min-h-[350px] flex flex-col items-center justify-center">
              {isLoadingClasses ? (
                <Spinner label="Loading class data..." />
              ) : (
                <>
                  <ResponsiveContainer height={400} width="100%">
                    <BarChart
                      data={chartData}
                      margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        angle={45}
                        dataKey="name"
                        height={140}
                        interval={0}
                        textAnchor="start"
                        tick={({ x, y, payload }) => {
                          const label = String(payload.value);
                          const maxLen = 16;
                          const displayLabel =
                            label.length > maxLen
                              ? label.slice(0, maxLen) + "..."
                              : label;

                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                dy={16}
                                fontSize={12}
                                style={{ maxWidth: 80 }}
                                textAnchor="start"
                                transform="rotate(45)"
                                x={0}
                                y={0}
                              >
                                {displayLabel}
                              </text>
                            </g>
                          );
                        }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;

                            return (
                              <div
                                style={{
                                  background: "#fff",
                                  border: "1px solid #ccc",
                                  padding: 8,
                                }}
                              >
                                <div>
                                  <strong>{label}</strong>
                                </div>
                                <div>Students: {data.students}</div>
                                <div>Passed: {data.totalPassed}</div>
                                <div>Failed: {data.totalFailed}</div>
                                <div>
                                  Avg. Score: {data.averageScore?.toFixed(2)}
                                </div>
                              </div>
                            );
                          }

                          return null;
                        }}
                      />
                      <Bar dataKey="students" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded shadow">
              <AnalyticsTable
                allowMultiSelect={true}
                currentPage={currentPage}
                data={tableData}
                expandedRows={expandedRows}
                isLoading={isLoadingClasses}
                itemsPerPage={itemsPerPage}
                selectedClasses={selectedClasses}
                sortDirection={sortDirection}
                sortKey={sortKey}
                totalItems={totalItems}
                totalPages={totalPages}
                // onExportData={handleExportData}
                onPageChange={setCurrentPage}
                onRowToggle={handleRowToggle}
                onSelectedClassesChange={setSelectedClasses}
                onSort={handleSort}
                // onViewDetails={handleViewDetails}
              />
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
