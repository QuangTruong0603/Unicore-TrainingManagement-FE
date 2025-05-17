import { useEffect, useMemo, useState } from "react";
import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";

import { FloorQuery } from "@/services/floor/floor.schema";
import { Building } from "@/services/building/building.schema";
import { Location } from "@/services/location/location.schema";
import { useDebounce } from "@/hooks/useDebounce";

interface FloorFilterProps {
  query: FloorQuery;
  onQueryChange: (query: FloorQuery) => void;
  buildings: Building[];
  locations?: Location[];
}

export const FloorFilter = ({
  query,
  onQueryChange,
  buildings,
}: FloorFilterProps) => {
  // State for search input
  const [searchName, setSearchName] = useState(query.filter?.name || "");

  // Debounced value for search name
  const debouncedSearchName = useDebounce(searchName, 300);

  // Apply debounced filter when it changes
  useEffect(() => {
    if (debouncedSearchName !== query.filter?.name) {
      onQueryChange({
        ...query,
        filter: {
          ...query.filter,
          name: debouncedSearchName,
        },
      });
    }
  }, [debouncedSearchName, onQueryChange, query]);

  // Handle building filter change
  const handleBuildingChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const buildingId = event.target.value;

    console.log("Building filter changed to:", buildingId);

    onQueryChange({
      ...query,
      filter: {
        ...query.filter,
        buildingId,
      },
    });
  };

  // Formatted buildings for select
  const buildingOptions = useMemo(() => {
    return [
      { id: "", name: "All Buildings" },
      ...buildings.filter((b) => b.isActive),
    ];
  }, [buildings]);
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
      <div className="relative flex-1">
        <Input
          className="pl-10 w-full rounded-xl"
          placeholder="Search by floor name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Search          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>
      
      <Select
        className="w-full md:w-1/4 h-auto"        classNames={{
          trigger: "h-[42px] rounded-xl",
        }}
        onChange={handleBuildingChange}
        placeholder="Filter by building"
        selectedKeys={
          query.filter?.buildingId ? [query.filter.buildingId] : [""]
        }
      >
        {buildingOptions.map((building) => (
          <SelectItem key={building.id}>{building.name}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
