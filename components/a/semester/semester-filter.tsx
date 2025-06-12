import React, { useState } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Filter } from "lucide-react";

import {
  SemesterFilter,
  SemesterQuery,
} from "@/services/semester/semester.schema";

interface SemesterFilterProps {
  query: SemesterQuery;
  onFilterChange: (newQuery: SemesterQuery) => void;
  onFilterClear: () => void;
}

interface FilterState {
  year: number | null;
  numberOfWeeks: number | null;
}

export function SemesterFilterComponent({
  query,
  onFilterChange,
  onFilterClear,
}: SemesterFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    year: query.filters?.year ?? null,
    numberOfWeeks: query.filters?.numberOfWeeks ?? null,
  });
  const handleYearChange = (value: string) => {
    const year = value ? parseInt(value, 10) : null;
    const newFilterState = { ...filterState, year };

    setFilterState(newFilterState);
    applyFilters(newFilterState);
  };

  const handleNumberOfWeeksChange = (value: string) => {
    const numberOfWeeks = value ? parseInt(value, 10) : null;
    const newFilterState = { ...filterState, numberOfWeeks };

    setFilterState(newFilterState);
    applyFilters(newFilterState);
  };

  const applyFilters = (state: FilterState) => {
    const newFilters: SemesterFilter = {};

    if (state.year !== null) {
      newFilters.year = state.year;
    }

    if (state.numberOfWeeks !== null) {
      newFilters.numberOfWeeks = state.numberOfWeeks;
    }

    onFilterChange({
      ...query,
      pageNumber: 1,
      filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
    });
  };

  const handleClearAll = () => {
    setFilterState({
      year: null,
      numberOfWeeks: null,
    });
    onFilterClear();
    setIsFilterOpen(false);
  };

  const hasActiveFilters = () => {
    return (
      query.filters?.year !== undefined ||
      query.filters?.numberOfWeeks !== undefined
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.filters?.year !== undefined) count++;
    if (query.filters?.numberOfWeeks !== undefined) count++;

    return count;
  };

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
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
            <div className="text-small font-bold mb-3">Filter Semesters</div>

            <div className="space-y-4">
              {/* Year Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Year</div>
                <Input
                  className="w-full min-w-[200px]"
                  max={2030}
                  min={2020}
                  placeholder="Enter year"
                  size="sm"
                  type="number"
                  value={filterState.year?.toString() || ""}
                  onValueChange={handleYearChange}
                />
              </div>
              {/* Number of Weeks Filter */}
              <div>
                <div className="text-sm font-medium mb-2">Number of Weeks</div>
                <Input
                  className="w-full"
                  max={52}
                  min={1}
                  placeholder="Enter number of weeks"
                  size="sm"
                  type="number"
                  value={filterState.numberOfWeeks?.toString() || ""}
                  onValueChange={handleNumberOfWeeksChange}
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
}
