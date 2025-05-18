import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
} from "@heroui/react";
import { Edit, Trash2, Plus } from "lucide-react";

import styles from "./schedule-table.module.scss";

export interface ScheduleData {
  id: string;
  className: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  status: "active" | "inactive";
}

interface ScheduleTableProps {
  data: ScheduleData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  data,
  onEdit,
  onDelete,
  onAdd,
}) => {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeader}>
        <h2>Class Schedule Management</h2>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onClick={onAdd}
        >
          Add Schedule
        </Button>
      </div>

      <Table aria-label="Class schedule table">
        <TableHeader>
          <TableColumn>CLASS</TableColumn>
          <TableColumn>SUBJECT</TableColumn>
          <TableColumn>TEACHER</TableColumn>
          <TableColumn>ROOM</TableColumn>
          <TableColumn>DAY</TableColumn>
          <TableColumn>TIME</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>{schedule.className}</TableCell>
              <TableCell>{schedule.subject}</TableCell>
              <TableCell>{schedule.teacher}</TableCell>
              <TableCell>{schedule.room}</TableCell>
              <TableCell>{schedule.dayOfWeek}</TableCell>
              <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
              <TableCell>
                <Chip
                  color={schedule.status === "active" ? "success" : "danger"}
                  variant="flat"
                >
                  {schedule.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className={styles.actionButtons}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => onEdit(schedule.id)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onClick={() => onDelete(schedule.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
