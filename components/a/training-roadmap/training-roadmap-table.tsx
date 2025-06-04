import React from "react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Table as HeroTable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./training-roadmap-table.module.scss";

import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";

interface TrainingRoadmapTableProps {
  roadmaps: TrainingRoadmap[];
  isLoading?: boolean;
  expandedRows: Record<string, boolean>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowToggle: (roadmapId: string) => void;
  onEdit: (roadmap: TrainingRoadmap) => void;
  onDelete: (roadmap: TrainingRoadmap) => void;
  onActiveToggle: (roadmap: TrainingRoadmap) => void;
}

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render: (roadmap: TrainingRoadmap) => React.ReactNode;
}

export const TrainingRoadmapTable: React.FC<TrainingRoadmapTableProps> = ({
  roadmaps,
  isLoading = false,
  expandedRows,
  sortKey,
  sortDirection,
  onSort,
  onRowToggle,
  onEdit,
  onDelete,
  onActiveToggle,
}) => {
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };
  const columns: Column[] = [
    {
      key: "code",
      title: "Code",
      sortable: true,
      render: (roadmap: TrainingRoadmap) => roadmap.code,
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (roadmap: TrainingRoadmap) => (
        <div
          className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
          title={roadmap.name}
        >
          <Link
            className="text-inherit hover:text-primary cursor-pointer"
            href={`/a/academic/training-roadmap/${roadmap.id}`}
          >
            {roadmap.name}
          </Link>
        </div>
      ),
    },
    {
      key: "startYear",
      title: "Start Year",
      sortable: true,
      render: (roadmap: TrainingRoadmap) => roadmap.startYear,
    },
    {
      key: "major",
      title: "Major",
      sortable: true,
      render: (roadmap: TrainingRoadmap) => (
        <div className="max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis text-sm">
          {roadmap.majorData ? (
            <span title={roadmap.majorData.name}>{roadmap.majorData.name}</span>
          ) : (
            roadmap.majorId
          )}
        </div>
      ),
    },
    {
      key: "batches",
      title: "Batches",
      render: (roadmap: TrainingRoadmap) => (
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {roadmap.batchDatas && roadmap.batchDatas.length > 0 ? (
            roadmap.batchDatas.slice(0, 3).map((batch) => (
              <Chip
                key={batch.id}
                className="text-xs"
                color="primary"
                size="sm"
                variant="flat"
              >
                {batch.title} ({batch.startYear})
              </Chip>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No batches</span>
          )}
          {roadmap.batchDatas && roadmap.batchDatas.length > 3 && (
            <Chip className="text-xs" color="default" size="sm" variant="flat">
              +{roadmap.batchDatas.length - 3}
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (roadmap: TrainingRoadmap) => (
        <Chip
          className="text-xs"
          color={roadmap.isActive ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {roadmap.isActive ? "Active" : "Inactive"}
        </Chip>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (roadmap: TrainingRoadmap) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              className="h-8 w-8 min-w-0"
              size="sm"
              variant="light"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Actions">
            <DropdownItem
              key="edit"
              startContent={<Edit size={16} />}
              onPress={() => {
                console.log("Edit roadmap:", roadmap);
                onEdit(roadmap);
              }}
            >
              Update
            </DropdownItem>
            <DropdownItem
              key="toggle-status"
              startContent={
                roadmap.isActive ? <PowerOff size={16} /> : <Power size={16} />
              }
              onPress={() => {
                console.log(
                  `${roadmap.isActive ? "Deactivate" : "Activate"} roadmap:`,
                  roadmap
                );
                onActiveToggle(roadmap);
              }}
            >
              {roadmap.isActive ? "Deactivate" : "Activate"}
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash2 size={16} />}
              onPress={() => {
                console.log("Delete roadmap:", roadmap);
                onDelete(roadmap);
              }}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
    {
      key: "expand",
      title: "",
      render: (roadmap: TrainingRoadmap) => (
        <div className="flex justify-end">
          <Button
            isIconOnly
            className="h-8 w-8 min-w-0 p-0 flex justify-center items-center"
            color="default"
            size="sm"
            variant="light"
            onPress={() => onRowToggle(roadmap.id)}
          >
            {expandedRows[roadmap.id] ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </Button>
        </div>
      ),
    },
  ];

  const renderExpandedContent = (roadmap: TrainingRoadmap) => {
    return (
      <div className={styles.expandedContent}>
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 border-t">
          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">
              {roadmap.description || "No description available"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }
  // Create a flattened array that includes both rows and expanded rows
  const flattenedRows = (
    Array.isArray(roadmaps) && roadmaps.length > 0 ? roadmaps : []
  ).flatMap((roadmap) => {
    const mainRow = {
      key: `row-${roadmap.id}`,
      content: (
        <TableRow key={`row-${roadmap.id}`}>
          {columns.map((column) => (
            <TableCell key={`${roadmap.id}-${column.key}`}>
              {column.render(roadmap)}
            </TableCell>
          ))}
        </TableRow>
      ),
    };

    if (expandedRows[roadmap.id]) {
      return [
        mainRow,
        {
          key: `expanded-${roadmap.id}`,
          content: (
            <TableRow
              key={`expanded-${roadmap.id}`}
              className={styles.expandedRow}
            >
              <TableCell colSpan={columns.length}>
                {renderExpandedContent(roadmap)}
              </TableCell>
            </TableRow>
          ),
        },
      ];
    }

    return [mainRow];
  });

  return (
    <div className={styles.tableWrapper}>
      <HeroTable aria-label="Training Roadmaps Table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={`${column.sortable ? styles.sortableHeader : ""} ${column.sortable && sortKey === column.key ? "cursor-pointer text-primary" : "cursor-pointer"}`}
              onClick={() => column.sortable && onSort?.(column.key)}
            >
              <div className="flex items-center">
                {column.title} {column.sortable && renderSortIcon(column.key)}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {Array.isArray(roadmaps) && roadmaps.length > 0 ? (
            flattenedRows.map((row) => row.content)
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center py-8 text-gray-500">
                  No training roadmaps found
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </HeroTable>
    </div>
  );
};
