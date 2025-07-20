import { ArrowDown, ArrowUp, Edit, MoreVertical, Trash } from "lucide-react";
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

import styles from "./room-table.module.scss";

import { Room } from "@/services/room/room.schema";

interface RoomTableProps {
  rooms: Room[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onEdit?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
}

export const RoomTable = ({
  rooms,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onEdit,
  onDeleteRoom,
}: RoomTableProps) => {
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
      aria-label="Rooms table"
      className={styles.table}
    >
      <TableHeader>
        <TableColumn
          className={`cursor-pointer ${sortKey === "name" ? "text-primary" : ""}`}
          onClick={() => handleSort("name")}
        >
          <div className="flex items-center">
            Room Name {renderSortIcon("name")}
          </div>
        </TableColumn>
        <TableColumn>Floor</TableColumn>
        <TableColumn>Building</TableColumn>
        <TableColumn
          className={`cursor-pointer ${sortKey === "availableSeats" ? "text-primary" : ""}`}
          onClick={() => handleSort("availableSeats")}
        >
          <div className="flex items-center">
            Available Seats {renderSortIcon("availableSeats")}
          </div>
        </TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={isLoading ? "Loading..." : "No rooms found"}
        isLoading={isLoading}
        items={rooms}
      >
        {(room) => (
          <TableRow key={room.id} className={styles.tableRow}>
            <TableCell>
              <div className="font-medium">{room.name}</div>
            </TableCell>
            <TableCell>{room.floor?.name || "N/A"}</TableCell>
            <TableCell>{room.floor?.building?.name || "N/A"}</TableCell>
            <TableCell>{room.availableSeats}</TableCell>
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
                    aria-label="Room Actions"
                    onAction={(key) => {
                      switch (key) {
                        case "update":
                          if (onEdit) onEdit(room);
                          break;
                        case "delete":
                          if (onDeleteRoom) onDeleteRoom(room);
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
