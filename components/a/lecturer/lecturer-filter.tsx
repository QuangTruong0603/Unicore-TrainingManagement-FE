import React from "react";
import { Search } from "lucide-react";
import { Select, SelectItem } from "@heroui/react";

import { Department } from "@/services/department/department.schema";

interface LecturerFilterProps {
  searchQuery: string;
  departmentId?: string;
  departments: Department[];
  onSearchChange: (search: string) => void;
  onDepartmentChange: (departmentId: string) => void;
}

export function LecturerFilter({
  searchQuery,
  departmentId,
  departments,
  onSearchChange,
  onDepartmentChange,
}: LecturerFilterProps) {
  const departmentOptions = [
    { id: "", name: "All Departments" },
    ...departments,
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative w-full md:w-2/3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <input
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by name, code, degree..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="w-full md:w-1/3">
        <Select
          className="w-full"
          items={departmentOptions}
          placeholder="Filter by department"
          selectedKeys={departmentId ? [departmentId] : [""]}
          onChange={(e) => onDepartmentChange(e.target.value)}
        >
          {(department) => (
            <SelectItem key={department.id}>{department.name}</SelectItem>
          )}
        </Select>
      </div>
    </div>
  );
}
