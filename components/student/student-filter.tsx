import React from "react";
import { Input } from "@heroui/react";
import { Search } from "lucide-react";

interface StudentFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StudentFilter: React.FC<StudentFilterProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex gap-4">
      <Input
        type="text"
        placeholder="Search students..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        className="max-w-xs"
      />
    </div>
  );
}; 