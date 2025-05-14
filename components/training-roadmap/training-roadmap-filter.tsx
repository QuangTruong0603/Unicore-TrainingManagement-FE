import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Filter, X } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<FilterType>(query.filters || {});
  const [searchValue, setSearchValue] = useState(query.searchQuery || "");

  // When popover opens, initialize temp filter with current filter
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFilter(query.filters || {});
    }
    setIsOpen(open);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
  };

  // Handle major selection
  const handleMajorChange = (selectedMajorIds: Set<string>) => {
    setTempFilter({
      ...tempFilter,
      majorIds: Array.from(selectedMajorIds),
    });
  };

  // Handle code filter change
  const handleCodeChange = (value: string) => {
    setTempFilter({
      ...tempFilter,
      code: value || undefined,
    });
  };

  // Handle start year range change
  const handleYearRangeChange = (index: number, value: number) => {
    const currentRange = tempFilter.startYearRange || [
      2020,
      new Date().getFullYear(),
    ];
    const newRange = [...currentRange] as [number, number];

    newRange[index] = value;

    setTempFilter({
      ...tempFilter,
      startYearRange: newRange as [number, number],
    });
  };

  // Apply filters
  const handleApplyFilter = () => {
    dispatch(setFilter(tempFilter));
    onFilterChange(tempFilter);
    setIsOpen(false);
  };

  // Reset filters
  const handleResetFilter = () => {
    const emptyFilter: FilterType = {};

    setTempFilter(emptyFilter);
    dispatch(setFilter(emptyFilter));
    onFilterClear();
    setIsOpen(false);
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
        <Filter
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>

      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger>
          <Button
            className="min-w-[100px] h-11 px-4"
            color="default"
            startContent={<Filter size={18} />}
            variant="bordered"
          >
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filter Roadmaps</h3>
              <Button
                isIconOnly
                className="h-8 w-8"
                color="default"
                size="sm"
                variant="flat"
                onPress={() => setIsOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Major Filter */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="major-select"
              >
                Major
              </label>
              <Select
                className="w-full"
                id="major-select"
                placeholder="Select a major"
                selectedKeys={tempFilter.majorIds || []}
                selectionMode="single"
                onSelectionChange={(keys) =>
                  handleMajorChange(keys as Set<string>)
                }
              >
                {majors.map((major) => (
                  <SelectItem key={major.id}>
                    {major.name} ({major.code})
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Code Filter */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="roadmap-code"
              >
                Roadmap Code
              </label>
              <Input
                id="roadmap-code"
                placeholder="Filter by code"
                value={tempFilter.code || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
              />
            </div>

            {/* Year Range Filter */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="start-year-range"
              >
                Start Year Range
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  id="start-year-range"
                  placeholder="From year"
                  type="number"
                  value={tempFilter.startYearRange?.[0]?.toString() || ""}
                  onChange={(e) =>
                    handleYearRangeChange(0, parseInt(e.target.value))
                  }
                />
                <span>to</span>
                <Input
                  placeholder="To year"
                  type="number"
                  value={tempFilter.startYearRange?.[1]?.toString() || ""}
                  onChange={(e) =>
                    handleYearRangeChange(1, parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button color="danger" variant="flat" onPress={handleResetFilter}>
              Reset
            </Button>
            <Button color="primary" onPress={handleApplyFilter}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
