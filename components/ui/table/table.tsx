import React from 'react';
import { Table as HeroTable, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
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
      <HeroTable aria-label={title}>
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
      </HeroTable>
    </div>
  );
};

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  sortKey,
  sortDirection,
  onSort
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <HeroTable>
      <TableHeader>
        {columns.map((column) => (
          <TableColumn 
            key={column.key}
            allowsSorting={column.sortable}
            onClick={() => column.sortable && onSort?.(column.key)}
          >
            {column.title}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody items={data}>
        {(item: T) => (
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.render(item)}</TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </HeroTable>
  );
}
