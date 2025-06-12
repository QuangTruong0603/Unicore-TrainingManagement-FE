import React, { useState } from "react";
import {
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Filter, Search } from "lucide-react";

import {
  TrainingRoadmapFilter as FilterType,
  TrainingRoadmapQuery,
} from "@/services/training-roadmap/training-roadmap.schema";
import { Major } from "@/services/major/major.schema";
import { useAppDispatch } from "@/store/hooks";
import { setFilter } from "@/store/slices/trainingRoadmapSlice";

interface FilterProps {
  query: TrainingRoadmapQuery;
  majors: Major[];
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (search: string) => void;
  onFilterClear: () => void;
}

export const TrainingRoadmapFilter: React.FC<FilterProps> = ({
  query,
  majors,
  onFilterChange,
  onSearchChange,
  onFilterClear,
}) => {
  const dispatch = useAppDispatch();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(query.searchQuery || "");
  const [majorSearchValue, setMajorSearchValue] = useState("");

  // Get display value for selected major
  const getSelectedMajorDisplay = () => {
    if (!query.filters?.majorIds?.length) return "";

    const selectedMajor = majors.find(
      (major) => major.id === query.filters?.majorIds?.[0]
    );

    return selectedMajor ? `${selectedMajor.code} - ${selectedMajor.name}` : "";
  };

  // Filter majors based on search input
  const filteredMajors = React.useMemo(() => {
    if (!majorSearchValue) return majors;

    return majors.filter(
      (major) =>
        major.code.toLowerCase().includes(majorSearchValue.toLowerCase()) ||
        major.name.toLowerCase().includes(majorSearchValue.toLowerCase())
    );
  }, [majors, majorSearchValue]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
  };
  // Handle major selection with immediate filter application
  const handleMajorChange = (selectedMajorIds: Set<string>) => {
    const newFilter = {
      ...query.filters,
      majorIds:
        Array.from(selectedMajorIds).length > 0
          ? Array.from(selectedMajorIds)
          : undefined,
    };

    dispatch(setFilter(newFilter));
    onFilterChange(newFilter);
  };

  // Handle code filter change with immediate application
  const handleCodeChange = (value: string) => {
    const newFilter = {
      ...query.filters,
      code: value || undefined,
    };

    dispatch(setFilter(newFilter));
    onFilterChange(newFilter);
  };
  // Check if any filters are active
  const hasActiveFilters = () => {
    return query.filters?.majorIds?.length || query.filters?.code;
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.filters?.majorIds?.length) count++;
    if (query.filters?.code) count++;

    return count;
  };

  // Clear all filters
  const handleClearAll = () => {
    const emptyFilter: FilterType = {};

    dispatch(setFilter(emptyFilter));
    onFilterClear();
    setIsFilterOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Input
          className="pl-10 w-full rounded-xl"
          placeholder="Search roadmaps..."
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>

      <Popover
        isOpen={isFilterOpen}
        placement="bottom-end"
        onOpenChange={setIsFilterOpen}
      >
        <PopoverTrigger>
          <Button
            color={hasActiveFilters() ? "primary" : "default"}
            startContent={<Filter size={16} />}
            variant={hasActiveFilters() ? "solid" : "bordered"}
          >
            Filter {hasActiveFilters() && `(${getActiveFiltersCount()})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <div className="px-1 py-2">
            <div className="text-small font-bold mb-3">Filter Roadmaps</div>

            <div className="space-y-4 w-full">
              {/* Major Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Major</div>
                <Autocomplete
                  allowsCustomValue
                  className="w-full"
                  inputValue={majorSearchValue || getSelectedMajorDisplay()}
                  items={filteredMajors}
                  placeholder="Search for a major..."
                  selectedKey={query.filters?.majorIds?.[0] || null}
                  onInputChange={(value) => setMajorSearchValue(value)}
                  onSelectionChange={(key) => {
                    const selectedKey = key as string;

                    handleMajorChange(
                      selectedKey ? new Set([selectedKey]) : new Set()
                    );
                    setMajorSearchValue("");
                  }}
                >
                  {(major) => (
                    <AutocompleteItem key={major.id}>
                      {`${major.code} - ${major.name}`}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Code Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Roadmap Code</div>
                <Input
                  className="w-full w-min-[200px]"
                  placeholder="Filter by code"
                  size="sm"
                  value={query.filters?.code || ""}
                  onChange={(e) => handleCodeChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button color="primary" size="sm" onPress={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
