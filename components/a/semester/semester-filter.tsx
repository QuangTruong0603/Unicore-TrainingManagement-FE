import { useEffect, useState } from "react";
import { Input, Select, SelectItem } from "@heroui/react";

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
  semesterNumber: number | null;
  year: number | null;
  isActive: boolean | null;
  startDate: Date | null;
  endDate: Date | null;
  numberOfWeeks: number | null;
}

export function SemesterFilterComponent({
  query,
  onFilterChange,
}: SemesterFilterProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    semesterNumber: null,
    year: null,
    isActive: null,
    startDate: null,
    endDate: null,
    numberOfWeeks: null,
  });

  // Initialize filter state based on current query
  useEffect(() => {
    if (query.filters) {
      setFilterState({
        semesterNumber: query.filters.semesterNumber ?? null,
        year: query.filters.year ?? null,
        isActive: query.filters.isActive ?? null,
        startDate: query.filters.startDate ?? null,
        endDate: query.filters.endDate ?? null,
        numberOfWeeks: query.filters.numberOfWeeks ?? null,
      });
    }
  }, [query]);

  // Update filter state based on changed fields
  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilterState = { ...filterState, [key]: value };

    setFilterState(newFilterState);
    // Apply the filters immediately
    applyFilters(newFilterState);
  };

  // Apply filters
  const applyFilters = (state: FilterState = filterState) => {
    const newFilters: SemesterFilter = {};

    if (state.semesterNumber !== null) {
      newFilters.semesterNumber = state.semesterNumber;
    }

    if (state.year !== null) {
      newFilters.year = state.year;
    }

    if (state.isActive !== null) {
      newFilters.isActive = state.isActive;
    }

    if (state.startDate !== null) {
      newFilters.startDate = state.startDate;
    }

    if (state.endDate !== null) {
      newFilters.endDate = state.endDate;
    }

    if (state.numberOfWeeks !== null) {
      newFilters.numberOfWeeks = state.numberOfWeeks;
    }

    // Apply the filters to the query
    onFilterChange({
      ...query,
      filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
    });
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm mb-1 block" htmlFor="semester-number-input">
            Semester Number
          </label>
          <Input
            id="semester-number-input"
            max={3}
            min={1}
            placeholder="Enter semester number"
            size="sm"
            type="number"
            value={filterState.semesterNumber?.toString() || ""}
            onValueChange={(value) =>
              updateFilter("semesterNumber", value ? parseInt(value, 10) : null)
            }
          />
        </div>

        <div>
          <label className="text-sm mb-1 block" htmlFor="year-input">
            Year
          </label>
          <Input
            id="year-input"
            max={2030}
            min={2020}
            placeholder="Enter year"
            size="sm"
            type="number"
            value={filterState.year?.toString() || ""}
            onValueChange={(value) =>
              updateFilter("year", value ? parseInt(value, 10) : null)
            }
          />
        </div>

        <div>
          <label
            className="text-sm mb-1 block"
            htmlFor="semester-status-select"
          >
            Status
          </label>
          <Select
            id="semester-status-select"
            placeholder="Select status"
            selectedKeys={
              filterState.isActive !== null
                ? [filterState.isActive.toString()]
                : []
            }
            size="sm"
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0]?.toString();

              if (selectedKey === undefined) {
                updateFilter("isActive", null);
              } else {
                updateFilter("isActive", selectedKey === "true");
              }
            }}
          >
            <SelectItem key="true">Active</SelectItem>
            <SelectItem key="false">Inactive</SelectItem>
          </Select>
        </div>

        <div>
          <label className="text-sm mb-1 block" htmlFor="number-of-weeks-input">
            Number of Weeks
          </label>
          <Input
            id="number-of-weeks-input"
            min={1}
            placeholder="Enter number of weeks"
            size="sm"
            type="number"
            value={filterState.numberOfWeeks?.toString() || ""}
            onValueChange={(value) =>
              updateFilter("numberOfWeeks", value ? parseInt(value, 10) : null)
            }
          />
        </div>

        <div>
          <label className="text-sm mb-1 block" htmlFor="start-date-input">
            Start Date
          </label>          <Input
            id="start-date-input"
            placeholder="Select start date"
            size="sm"
            type="date"
            value={
              filterState.startDate
                ? filterState.startDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              
              updateFilter("startDate", value ? new Date(value) : null);
            }}
          />
        </div>

        <div>
          <label className="text-sm mb-1 block" htmlFor="end-date-input">
            End Date
          </label>          <Input
            id="end-date-input"
            placeholder="Select end date"
            size="sm"
            type="date"
            value={
              filterState.endDate
                ? filterState.endDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              
              updateFilter("endDate", value ? new Date(value) : null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
