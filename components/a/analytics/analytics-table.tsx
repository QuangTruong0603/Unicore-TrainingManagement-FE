import React from "react";
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./analytics-table.module.scss";

interface AnalyticsData {
  id: string;
  name: string;
  students: number;
  totalPassed: number;
  totalFailed: number;
  averageScore: number;
  passRate: number;
  failRate: number;
  course: {
    code: string;
    name: string;
  };
  semester: {
    semesterNumber: number;
    year: number;
  };
}

interface AnalyticsTableProps {
  data: AnalyticsData[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (classId: string) => void;
  selectedClasses: string[];
  onSelectedClassesChange: (selectedClasses: string[]) => void;
  allowMultiSelect?: boolean;
  onViewDetails?: (data: AnalyticsData) => void;
  onExportData?: (data: AnalyticsData) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

interface Column {
  key: string;
  title: string | React.ReactNode;
  sortable?: boolean;
  render: (data: AnalyticsData) => React.ReactNode;
}

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  data,
  isLoading = false,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  selectedClasses,
  onSelectedClassesChange,
  allowMultiSelect,
  onViewDetails,
  onExportData,
}) => {
  // Safety check: Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  const handleSelectionChange = (classId: string, isChecked: boolean) => {
    if (isChecked) {
      onSelectedClassesChange([...selectedClasses, classId]);
    } else {
      onSelectedClassesChange(selectedClasses.filter((id) => id !== classId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onSelectedClassesChange(safeData.map((c) => c.id));
    } else {
      onSelectedClassesChange([]);
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 80) return "bg-green-100 text-green-800";
    if (passRate >= 60) return "bg-yellow-100 text-yellow-800";

    return "bg-red-100 text-red-800";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "bg-green-100 text-green-800";
    if (score >= 6.5) return "bg-yellow-100 text-yellow-800";

    return "bg-red-100 text-red-800";
  };

  const columns: Column[] = [
    // Selection column (only visible if allowMultiSelect is true)
    ...(allowMultiSelect
      ? [
          {
            key: "select",
            title: (
              <Checkbox
                isIndeterminate={
                  selectedClasses.length > 0 &&
                  selectedClasses.length < safeData.length
                }
                isSelected={
                  selectedClasses.length === safeData.length &&
                  safeData.length > 0
                }
                onValueChange={handleSelectAll}
              />
            ),
            sortable: false,
            render: (data: AnalyticsData) => (
              <Checkbox
                isSelected={selectedClasses.includes(data.id)}
                onValueChange={(isChecked) =>
                  handleSelectionChange(data.id, isChecked)
                }
              />
            ),
          },
        ]
      : []),
    {
      key: "name",
      title: "Class Name",
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis font-semibold text-primary">
          {data.name}
        </div>
      ),
    },
    {
      key: "students",
      title: (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          Students
        </div>
      ),
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="text-center">
          <span className="text-lg font-bold text-blue-600">
            {data.students}
          </span>
        </div>
      ),
    },
    {
      key: "averageScore",
      title: (
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4" />
          Avg Score
        </div>
      ),
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(data.averageScore)}`}
          >
            {data.averageScore?.toFixed(2) || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "totalPassed",
      title: (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Passed
        </div>
      ),
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="text-center">
          <span className="text-lg font-bold text-green-600">
            {data.totalPassed}
          </span>
          <div className="text-xs text-gray-500">
            {data.students > 0
              ? ((data.totalPassed / data.students) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      ),
    },
    {
      key: "totalFailed",
      title: (
        <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-600" />
          Failed
        </div>
      ),
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="text-center">
          <span className="text-lg font-bold text-red-600">
            {data.totalFailed}
          </span>
          <div className="text-xs text-gray-500">
            {data.students > 0
              ? ((data.totalFailed / data.students) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      ),
    },
    {
      key: "passRate",
      title: "Pass Rate",
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPassRateColor(data.passRate)}`}
          >
            {data.passRate?.toFixed(1) || 0}%
          </span>
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${Math.min(data.passRate || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      title: "Course",
      sortable: false,
      render: (data: AnalyticsData) => (
        <div className="max-w-[120px] overflow-hidden">
          <Tooltip content={data.course.name}>
            <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs cursor-help">
              {data.course.code}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "semester",
      title: "Semester",
      sortable: false,
      render: (data: AnalyticsData) => (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {`${data.semester.semesterNumber}/${data.semester.year}`}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      sortable: false,
      render: (data: AnalyticsData) => {
        const handleActionSelection = (key: React.Key) => {
          switch (key) {
            case "viewDetails":
              if (onViewDetails) onViewDetails(data);
              break;
            case "exportData":
              if (onExportData) onExportData(data);
              break;
          }
        };

        return (
          <div className="flex gap-2 justify-end pr-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Analytics Actions"
                onAction={handleActionSelection}
              >
                <DropdownItem
                  key="viewDetails"
                  startContent={<BarChart3 className="w-4 h-4" />}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="exportData"
                  startContent={<TrendingUp className="w-4 h-4" />}
                >
                  Export Data
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Tooltip content="Toggle details">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowToggle(data.id);
                }}
              >
                {expandedRows[data.id] ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Remove handleSort or make it a no-op
  const handleSort = (_key: string) => {};

  // Expanded detail view for analytics data
  const renderExpandedDetails = (data: AnalyticsData) => {
    return (
      <div className="p-4 bg-gray-50 border-t">
        <h3 className="font-medium mb-2">Analytics Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Performance Metrics
            </h4>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Students:</span>
                <span className="text-sm font-medium">{data.students}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Score:</span>
                <span
                  className={`text-sm font-medium ${getScoreColor(data.averageScore)}`}
                >
                  {data.averageScore?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pass Rate:</span>
                <span
                  className={`text-sm font-medium ${getPassRateColor(data.passRate)}`}
                >
                  {data.passRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Results Breakdown
            </h4>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Passed:</span>
                <span className="text-sm font-medium text-green-600">
                  {data.totalPassed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Failed:</span>
                <span className="text-sm font-medium text-red-600">
                  {data.totalFailed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pass Percentage:</span>
                <span className="text-sm font-medium">
                  {data.students > 0
                    ? ((data.totalPassed / data.students) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Course Information
            </h4>
            <div className="space-y-2 mt-2">
              <div>
                <span className="text-sm font-medium">Course:</span>
                <p className="text-sm text-gray-600">{data.course.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Code:</span>
                <p className="text-sm text-gray-600">{data.course.code}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Semester:</span>
                <p className="text-sm text-gray-600">
                  {`${data.semester.semesterNumber}/${data.semester.year}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.tableWrapper}>
      <Table
        isHeaderSticky
        isStriped
        aria-label="Analytics table"
        classNames={{
          base: "min-h-[400px]",
          table: "min-w-[1000px]", // Reduced minimum width
        }}
        selectionMode="none"
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? "cursor-pointer" : ""} ${column.sortable && sortKey === column.key ? "text-primary" : ""}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center">
                {column.title}
                {column.sortable && renderSortIcon(column.key)}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          emptyContent={"No analytics data found"}
          isLoading={isLoading}
          loadingContent={"Loading analytics data..."}
        >
          {safeData.map((data) => (
            <React.Fragment key={data.id}>
              <TableRow key={data.id}>
                {columns.map((column) => (
                  <TableCell key={`${data.id}-${column.key}`}>
                    {column.render(data)}
                  </TableCell>
                ))}
              </TableRow>
              {expandedRows[data.id] && (
                <TableRow>
                  <TableCell className="p-0" colSpan={columns.length}>
                    {renderExpandedDetails(data)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
