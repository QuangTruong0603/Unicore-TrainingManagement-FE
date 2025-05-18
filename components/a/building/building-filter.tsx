import { Search } from "lucide-react";
import { Input } from "@heroui/react";

interface BuildingFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const BuildingFilter = ({
  searchQuery,
  onSearchChange,
}: BuildingFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Input
          className="pl-10 w-full rounded-xl"
          placeholder="Search buildings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>
    </div>
  );
};
