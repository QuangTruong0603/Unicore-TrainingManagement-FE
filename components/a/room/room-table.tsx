import { ArrowDown, ArrowUp, Power, PowerOff, Edit, MoreVertical, Trash } from "lucide-react";
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

import styles from "./room-table.module.scss";

import { Room } from "@/services/room/room.schema";

interface RoomTableProps {
  rooms: Room[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
}

export const RoomTable = ({
  rooms,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
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
              <Chip
                color={room.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {room.isActive ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
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
                        case "edit":
                          if (onEdit) onEdit(room);
                          break;
                        case "delete":
                          if (onDeleteRoom) onDeleteRoom(room);
                          break;
                        case "activate":
                          if (onActiveToggle) onActiveToggle(room);
                          break;
                      }
                    }}
                  >
                    <DropdownItem
                      key="edit"
                      startContent={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<Trash className="w-4 h-4" />}
                    >
                      Delete
                    </DropdownItem>
                    <DropdownItem
                      key="activate"
                      startContent={
                        room.isActive ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )
                      }
                    >
                      {room.isActive ? "Deactivate" : "Activate"}
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
