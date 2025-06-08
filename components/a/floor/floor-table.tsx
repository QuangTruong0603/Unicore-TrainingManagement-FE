import {
  ArrowDown,
  ArrowUp,
  Power,
  PowerOff,
  Edit,
  Trash2,
  MoreVertical,
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

import styles from "./floor-table.module.scss";

import { Floor } from "@/services/floor/floor.schema";

interface FloorTableProps {
  floors: Floor[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (floor: Floor) => void;
  onEdit?: (floor: Floor) => void;
}

export const FloorTable = ({
  floors,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
  onEdit,
}: FloorTableProps) => {
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
      aria-label="Floors table"
      className={styles.table}
    >
      <TableHeader>
        <TableColumn
          className={`cursor-pointer ${sortKey === "name" ? "text-primary" : ""}`}
          onClick={() => handleSort("name")}
        >
          <div className="flex items-center">
            Floor Name {renderSortIcon("name")}
          </div>
        </TableColumn>
        <TableColumn>Building</TableColumn>
        <TableColumn>Total Rooms</TableColumn>
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
        emptyContent={isLoading ? "Loading..." : "No floors found"}
        isLoading={isLoading}
        items={floors}
      >
        {(floor) => (
          <TableRow key={floor.id}>
            <TableCell>
              <div className="font-medium">{floor.name}</div>
            </TableCell>
            <TableCell>{floor.building?.name || "N/A"}</TableCell>
            <TableCell>{floor.totalRoom}</TableCell>
            <TableCell>
              <Chip
                color={floor.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {floor.isActive ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
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
                <DropdownMenu aria-label="Floor Actions">
                  <DropdownItem
                    key="edit"
                    isDisabled={!onEdit}
                    startContent={<Edit size={16} />}
                    onPress={() => onEdit?.(floor)}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    startContent={<Trash2 size={16} />}
                    onPress={() => {
                      // eslint-disable-next-line no-console
                      console.log("Delete floor:", floor);
                    }}
                  >
                    Delete
                  </DropdownItem>
                  <DropdownItem
                    key="toggle-active"
                    isDisabled={!onActiveToggle}
                    startContent={
                      floor.isActive ? (
                        <PowerOff size={16} />
                      ) : (
                        <Power size={16} />
                      )
                    }
                    onPress={() => onActiveToggle?.(floor)}
                  >
                    {floor.isActive ? "Deactivate" : "Activate"}
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
