import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";

import { StudentQuery } from "@/services/student/student.schema";
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";

interface StudentFilterProps {
  query: StudentQuery;
  majors: Major[];
  batches: Batch[];
  onFilterChange: (newQuery: StudentQuery) => void;
  onFilterClear: () => void;
}

export function StudentFilter({
  query,
  majors,
  batches,
  onFilterChange,
  onFilterClear,
}: StudentFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Immediate filter handlers
  const handleMajorChange = (majorId: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      majorId: majorId || undefined,
    });
  };

  const handleBatchChange = (batchId: string) => {
    onFilterChange({
      ...query,
      pageNumber: 1,
      batchId: batchId || undefined,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return query.majorId || query.batchId;
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;

    if (query.majorId) count++;
    if (query.batchId) count++;

    return count;
  };

  // Clear all filters
  const handleClearAll = () => {
    onFilterClear();
    setIsFilterOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        isOpen={isFilterOpen}
        placement="bottom-start"
        onOpenChange={setIsFilterOpen}
      >
        <PopoverTrigger>
          <Button
            className="flex items-center gap-1"
            color={hasActiveFilters() ? "primary" : "default"}
            variant={hasActiveFilters() ? "solid" : "bordered"}
          >
            <Filter size={16} />
            <span>
              Filters {hasActiveFilters() && `(${getActiveFiltersCount()})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Students</h3>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setIsFilterOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Major Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="major-autocomplete"
                >
                  Major
                </label>
                <Autocomplete
                  allowsCustomValue={false}
                  className="w-full"
                  defaultItems={majors}
                  id="major-autocomplete"
                  placeholder="Search and select major"
                  selectedKey={query.majorId || null}
                  onSelectionChange={(key) => {
                    handleMajorChange(key?.toString() || "");
                  }}
                >
                  {(major) => (
                    <AutocompleteItem
                      key={major.id}
                      textValue={`${major.name} (${major.code})`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {major.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {major.code}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              {/* Batch Filter */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="batch-autocomplete"
                >
                  Batch
                </label>
                <Autocomplete
                  allowsCustomValue={false}
                  className="w-full"
                  defaultItems={batches}
                  id="batch-autocomplete"
                  placeholder="Search and select batch"
                  selectedKey={query.batchId || null}
                  onSelectionChange={(key) => {
                    handleBatchChange(key?.toString() || "");
                  }}
                >
                  {(batch) => (
                    <AutocompleteItem
                      key={batch.id}
                      textValue={
                        batch.title
                          ? `${batch.title} - ${batch.startYear}`
                          : batch.title || ""
                      }
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {batch.title || "No title"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {batch.startYear}
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
            </div>

            {/* Footer */}
            {hasActiveFilters() && (
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button color="primary" size="sm" onPress={handleClearAll}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
