import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import styles from './table.module.scss';

export interface TableData {
  id: string;
  activity: string;
  date: string;
  status: string;
}

interface ActivityTableProps {
  data: TableData[];
  title?: string;
  onViewAll?: () => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  data,
  title = "Recent Activities",
  onViewAll
}) => {
  return (
    <div className={styles.tableWrapper}>
      {title && (
        <div className={styles.tableHeader}>
          <h3>{title}</h3>
          {onViewAll && (
            <button onClick={onViewAll} className={styles.viewAllButton}>
              View All
            </button>
          )}
        </div>
      )}
      <Table aria-label={title}>
        <TableHeader>
          <TableColumn>ACTIVITY</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.activity}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>
                <span className={`${styles.status} ${styles[row.status.toLowerCase()]}`}>
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
