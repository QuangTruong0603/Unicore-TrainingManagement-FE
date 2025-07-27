import { ArrowDown, ArrowUp, MoreVertical, Edit, Trash } from "lucide-react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

import styles from "./major-table.module.scss";

import { Major } from "@/services/major/major.schema";

interface MajorTableProps {
  majors: Major[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onDeleteMajor?: (major: Major) => void;
  onUpdateMajor?: (major: Major) => void;
}

export const MajorTable = ({
  majors,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onDeleteMajor,
  onUpdateMajor,
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
    <Table
      isHeaderSticky
      isStriped
      aria-label="Major table"
      className={styles.table}
    >
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
                    aria-label="Major Actions"
                    onAction={(key) => {
                      switch (key) {
                        case "update":
                          if (onUpdateMajor) onUpdateMajor(major);
                          break;
                        case "delete":
                          if (onDeleteMajor) onDeleteMajor(major);
                          break;
                      }
                    }}
                  >
                    <DropdownItem
                      key="update"
                      startContent={<Edit className="w-4 h-4" />}
                    >
                      Update
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<Trash className="w-4 h-4" />}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
