import { ArrowDown, ArrowUp, Power, PowerOff, Edit } from "lucide-react";
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

import styles from "./building-table.module.scss";

import { Building } from "@/services/building/building.schema";

interface BuildingTableProps {
  buildings: Building[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (building: Building) => void;
  onEdit?: (building: Building) => void;
}

export const BuildingTable = ({
  buildings,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
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
    <Table aria-label="Building table" className={styles.table}>
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
              <Chip
                color={building.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {building.isActive ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  className="flex items-center gap-1 h-8 px-3 font-medium"
                  color={building.isActive ? "danger" : "success"}
                  size="sm"
                  startContent={
                    building.isActive ? (
                      <PowerOff size={16} />
                    ) : (
                      <Power size={16} />
                    )
                  }
                  variant="flat"
                  onPress={(e) => {
                    onActiveToggle && onActiveToggle(building);
                  }}
                >
                  {building.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  className="flex items-center gap-1 h-8 px-3 font-medium"
                  color="primary"
                  size="sm"
                  startContent={<Edit size={16} />}
                  variant="flat"
                  onPress={(e) => {
                    onEdit && onEdit(building);
                  }}
                >
                  Edit
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
