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

import styles from "./major-table.module.scss";

import { Major } from "@/services/major/major.schema";

interface MajorTableProps {
  majors: Major[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (major: Major) => void;
}

export const MajorTable = ({
  majors,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
}: MajorTableProps) => {
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
    <Table aria-label="Major table" className={styles.table}>
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
          className={`cursor-pointer ${sortKey === "costPerCredit" ? "text-primary" : ""}`}
          onClick={() => handleSort("costPerCredit")}
        >
          <div className="flex items-center">
            Cost Per Credit {renderSortIcon("costPerCredit")}
          </div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "majorGroup" ? "text-primary" : ""}`}
          onClick={() => handleSort("majorGroup")}
        >
          <div className="flex items-center">
            Major Group {renderSortIcon("majorGroup")}
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
        emptyContent={isLoading ? "Loading..." : "No majors to display"}
        isLoading={isLoading}
        items={majors}
      >
        {(major) => (
          <TableRow key={major.id}>
            <TableCell>
              <div className="font-medium">{major.code}</div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{major.name}</div>
            </TableCell>
            <TableCell>${major.costPerCredit.toFixed(2)}</TableCell>
            <TableCell>{major.majorGroup?.name || "N/A"}</TableCell>
            <TableCell>
              <Chip
                color={major.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {major.isActive ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
            <TableCell>
              <Button
                className="flex items-center gap-1 h-8 px-3 font-medium"
                color={major.isActive ? "danger" : "success"}
                size="sm"
                startContent={
                  major.isActive ? <PowerOff size={16} /> : <Power size={16} />
                }
                variant="flat"
                onPress={() => onActiveToggle && onActiveToggle(major)}
              >
                {major.isActive ? "Deactivate" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
