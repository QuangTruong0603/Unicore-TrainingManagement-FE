import {
  ArrowDown,
  ArrowUp,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
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

import styles from "./building-table.module.scss";

import { Building } from "@/services/building/building.schema";

interface BuildingTableProps {
  buildings: Building[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onEdit?: (building: Building) => void;
}

export const BuildingTable = ({
  buildings,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onEdit,
}: BuildingTableProps) => {
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
      aria-label="Building table"
      className={styles.table}
    >
      <TableHeader>
        <TableColumn
          className={`cursor-pointer ${sortKey === "name" ? "text-primary" : ""}`}
          onClick={() => handleSort("name")}
        >
          <div className="flex items-center">Name {renderSortIcon("name")}</div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "totalFloor" ? "text-primary" : ""}`}
          onClick={() => handleSort("totalFloor")}
        >
          <div className="flex items-center">
            Total Floors {renderSortIcon("totalFloor")}
          </div>
        </TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "totalRoom" ? "text-primary" : ""}`}
          onClick={() => handleSort("totalRoom")}
        >
          <div className="flex items-center">
            Total Rooms {renderSortIcon("totalRoom")}
          </div>
        </TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={isLoading ? "Loading..." : "No buildings to display"}
        isLoading={isLoading}
        items={buildings}
      >
        {(building) => (
          <TableRow key={building.id} className={styles.tableRow}>
            <TableCell>
              <div className="font-medium">{building.name}</div>
            </TableCell>
            <TableCell>{building.totalFloor}</TableCell>
            <TableCell>{building.totalRoom}</TableCell>
            <TableCell>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    aria-label="Actions"
                    size="sm"
                    variant="light"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Building Actions">
                  <DropdownItem
                    key="update"
                    isDisabled={!onEdit}
                    startContent={<Edit size={16} />}
                    onPress={() => onEdit?.(building)}
                  >
                    Update
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    startContent={<Trash2 size={16} />}
                    onPress={() => {
                      // eslint-disable-next-line no-console
                      console.log("Delete building:", building);
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
