import {
  ArrowDown,
  ArrowUp,
  Power,
  PowerOff,
  MoreVertical,
  Trash,
} from "lucide-react";
import {
  Button,
  Chip,
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

import styles from "./major-group-table.module.scss";

import { MajorGroup } from "@/services/major-group/major-group.schema";

interface MajorGroupTableProps {
  majorGroups: MajorGroup[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (majorGroup: MajorGroup) => void;
  onDeleteMajorGroup?: (majorGroup: MajorGroup) => void;
  onUpdateMajorGroup?: (majorGroup: MajorGroup) => void;
}

export const MajorGroupTable = ({
  majorGroups,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
  onDeleteMajorGroup,
  onUpdateMajorGroup,
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
    <Table
      isHeaderSticky
      isStriped
      aria-label="Major Group table"
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
          className={`cursor-pointer ${sortKey === "department" ? "text-primary" : ""}`}
          onClick={() => handleSort("department")}
        >
          <div className="flex items-center">
            Department {renderSortIcon("department")}
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
              <div className="flex items-center gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key="toggle"
                      startContent={
                        majorGroup.isActive ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )
                      }
                      onPress={() =>
                        onActiveToggle && onActiveToggle(majorGroup)
                      }
                    >
                      {majorGroup.isActive ? "Deactivate" : "Activate"}
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      isDisabled={!onDeleteMajorGroup}
                      startContent={<Trash size={16} />}
                      onPress={() =>
                        onDeleteMajorGroup && onDeleteMajorGroup(majorGroup)
                      }
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
