import { ArrowDown, ArrowUp, Power, PowerOff } from "lucide-react";
import {
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import styles from "./major-group-table.module.scss";

import { MajorGroup } from "@/services/major-group/major-group.schema";

interface MajorGroupTableProps {
  majorGroups: MajorGroup[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (majorGroup: MajorGroup) => void;
}

export const MajorGroupTable = ({
  majorGroups,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
}: MajorGroupTableProps) => {
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <Table aria-label="Major Group table" className={styles.table}>
      <TableHeader>
        <TableColumn
          className={`cursor-pointer ${sortKey === "code" ? "text-primary" : ""}`}
          onClick={() => handleSort("code")}
        >
          <div className="flex items-center">Code {renderSortIcon("code")}</div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "name" ? "text-primary" : ""}`}
          onClick={() => handleSort("name")}
        >
          <div className="flex items-center">Name {renderSortIcon("name")}</div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "department.name" ? "text-primary" : ""}`}
          onClick={() => handleSort("department.name")}
        >
          <div className="flex items-center">
            Department {renderSortIcon("department.name")}
          </div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "isActive" ? "text-primary" : ""}`}
          onClick={() => handleSort("isActive")}
        >
          <div className="flex items-center">
            Status {renderSortIcon("isActive")}
          </div>
        </TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={isLoading ? "Loading..." : "No major groups to display"}
        isLoading={isLoading}
        items={majorGroups}
      >
        {(majorGroup) => (
          <TableRow key={majorGroup.id}>
            <TableCell>
              <div className="font-medium">{majorGroup.code}</div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{majorGroup.name}</div>
            </TableCell>
            <TableCell>{majorGroup.department?.name || "N/A"}</TableCell>
            <TableCell>
              <Chip
                color={majorGroup.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {majorGroup.isActive ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
            <TableCell>
              <Button
                className="flex items-center gap-1 h-8 px-3 font-medium"
                color={majorGroup.isActive ? "danger" : "success"}
                size="sm"
                startContent={
                  majorGroup.isActive ? (
                    <PowerOff size={16} />
                  ) : (
                    <Power size={16} />
                  )
                }
                variant="flat"
                onPress={() => onActiveToggle && onActiveToggle(majorGroup)}
              >
                {majorGroup.isActive ? "Deactivate" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
