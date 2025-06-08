import React from "react";
import { Search } from "lucide-react";

interface LecturerFilterProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
}

export function LecturerFilter({
  searchQuery,
  onSearchChange,
}: LecturerFilterProps) {
  return (
    <div className="relative w-full">
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
  );
} 