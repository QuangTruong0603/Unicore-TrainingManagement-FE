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
        className="max-w-xs"
        placeholder="Search students..."
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
