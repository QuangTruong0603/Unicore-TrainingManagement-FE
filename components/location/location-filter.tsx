import React from "react";
import { Search } from "lucide-react";
import { Input } from "@heroui/react";

interface LocationFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Input
        endContent={<Search className="text-default-400" size={18} />}
        placeholder="Search locations..."
        size="md"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
