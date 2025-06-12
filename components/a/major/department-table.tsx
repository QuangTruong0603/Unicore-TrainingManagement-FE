import { useState } from "react";
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
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

import styles from "./department-table.module.scss";
import { DepartmentModal } from "./department-modal";

import { Department } from "@/services/department/department.schema";

interface DepartmentTableProps {
  departments: Department[];
  isLoading: boolean;
  sortKey?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onActiveToggle?: (department: Department) => void;
  onCreateDepartment?: (data: Partial<Department>) => Promise<void>;
  onDeleteDepartment?: (department: Department) => void;
  onUpdateDepartment?: (department: Department) => void;
}

export const DepartmentTable = ({
  departments,
  isLoading,
  sortKey,
  sortDirection = "asc",
  onSort,
  onActiveToggle,
  onCreateDepartment,
  onDeleteDepartment,
  onUpdateDepartment,
}: DepartmentTableProps) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDepartment = async (data: Partial<Department>) => {
    if (onCreateDepartment) {
      setIsSubmitting(true);
      try {
        await onCreateDepartment(data);
        onOpenChange();
      } catch (_) {
        // Handle error silently
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
    <>
      <Table
        isHeaderSticky
        isStriped
        aria-label="Department table"
        className={styles.table}
      >
        <TableHeader>
          <TableColumn
            className={`cursor-pointer ${sortKey === "code" ? "text-primary" : ""}`}
            onClick={() => handleSort("code")}
          >
            <div className="flex items-center">
              Code {renderSortIcon("code")}
            </div>
          </TableColumn>
          <TableColumn
            className={`cursor-pointer ${sortKey === "name" ? "text-primary" : ""}`}
            onClick={() => handleSort("name")}
          >
            <div className="flex items-center">
              Name {renderSortIcon("name")}
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
          emptyContent={isLoading ? "Loading..." : "No departments to display"}
          isLoading={isLoading}
          items={departments}
        >
          {(department) => (
            <TableRow key={department.id}>
              <TableCell>
                <div className="font-medium">{department.code}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{department.name}</div>
              </TableCell>
              <TableCell>
                <Chip
                  color={department.isActive ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {department.isActive ? "Active" : "Inactive"}
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
                          department.isActive ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )
                        }
                        onPress={() =>
                          onActiveToggle && onActiveToggle(department)
                        }
                      >
                        {department.isActive ? "Deactivate" : "Activate"}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        isDisabled={!onDeleteDepartment}
                        startContent={<Trash size={16} />}
                        onPress={() =>
                          onDeleteDepartment && onDeleteDepartment(department)
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

      <DepartmentModal
        isOpen={isOpen}
        isSubmitting={isSubmitting}
        mode="create"
        onOpenChange={onOpenChange}
        onSubmit={handleCreateDepartment}
      />
    </>
  );
};
