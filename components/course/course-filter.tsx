import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Slider,
  useDisclosure,
} from "@heroui/react";

import { CourseQuery } from "@/services/course/course.schema";
import { Major } from "@/services/major/major.schema";

interface CourseFilterProps {
  query: CourseQuery;
  majors: Major[];
  onFilterChange: (newQuery: CourseQuery) => void;
  onFilterClear: () => void;
}

interface FilterState {
  minCost: number;
  maxCost: number;
  minCredit: number;
  maxCredit: number;
  majorIds: string[];
  isRegistrable: boolean | null;
  practicePeriod: number;
  isRequired: boolean | null;
  minCreditRequired: number;
}

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export function CourseFilter({
  query,
  majors,
  onFilterChange,
  onFilterClear,
}: CourseFilterProps) {
  // Use useDisclosure for modal control
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [filterState, setFilterState] = useState<FilterState>({
    minCost: 0,
    maxCost: 1000,
    minCredit: 0,
    maxCredit: 10,
    majorIds: [],
    isRegistrable: null,
    practicePeriod: 0,
    isRequired: null,
    minCreditRequired: 0,
  });
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);

  // Update filter state based on changed fields
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  // Remove a specific filter
  const removeFilter = (id: string) => {
    // Handle removing specific filters
    if (id === "cost") {
      updateFilter("minCost", 0);
      updateFilter("maxCost", 1000);
    } else if (id === "credit") {
      updateFilter("minCredit", 0);
      updateFilter("maxCredit", 10);
    } else if (id === "status") {
      updateFilter("isRegistrable", null);
    } else if (id === "majorIds") {
      updateFilter("majorIds", []);
    } else if (id === "practiceClass") {
      updateFilter("practicePeriod", 0);
    } else if (id === "requiredCourse") {
      updateFilter("isRequired", null);
    } else if (id === "minCreditRequired") {
      updateFilter("minCreditRequired", 0);
    }

    // Remove chip
    setFilterChips((chips) => chips.filter((chip) => chip.id !== id));

    // Update the query with the new filter state
    applyFiltersToQuery();
  };

  // Apply all filters to query
  const applyFiltersToQuery = () => {
    // Create a new query with current filter state
    const newQuery: CourseQuery = {
      ...query,
      pageNumber: 1, // Reset to first page when applying filters
      filters: {
        costRange:
          filterState.minCost > 0 || filterState.maxCost < 1000
            ? [filterState.minCost, filterState.maxCost]
            : undefined,
        creditRange:
          filterState.minCredit > 0 || filterState.maxCredit < 10
            ? [filterState.minCredit, filterState.maxCredit]
            : undefined,
        majorIds:
          filterState.majorIds.length > 0 ? filterState.majorIds : undefined,
        isRegistrable: filterState.isRegistrable,
        practicePeriod:
          filterState.practicePeriod > 0
            ? filterState.practicePeriod
            : undefined,
        isRequired: filterState.isRequired,
        minCreditRequired:
          filterState.minCreditRequired > 0
            ? filterState.minCreditRequired
            : undefined,
      },
    };

    onFilterChange(newQuery);
  };

  // Apply filters from the modal
  const applyFilters = () => {
    const newChips: FilterChip[] = [];

    // Add cost filter chip
    if (filterState.minCost > 0 || filterState.maxCost < 1000) {
      newChips.push({
        id: "cost",
        label: `Cost: $${filterState.minCost} - $${filterState.maxCost}`,
        onRemove: () => removeFilter("cost"),
      });
    }

    // Add credit filter chip
    if (filterState.minCredit > 0 || filterState.maxCredit < 10) {
      newChips.push({
        id: "credit",
        label: `Credits: ${filterState.minCredit} - ${filterState.maxCredit}`,
        onRemove: () => removeFilter("credit"),
      });
    }

    // Add major filter chip
    if (filterState.majorIds.length > 0) {
      const selectedMajors = majors
        .filter((m) => filterState.majorIds.includes(m.id))
        .map((m) => m.code)
        .join(", ");

      newChips.push({
        id: "majorIds",
        label: `Majors: ${selectedMajors}`,
        onRemove: () => removeFilter("majorIds"),
      });
    }

    // Add course status chip
    if (filterState.isRegistrable !== null) {
      newChips.push({
        id: "status",
        label: `Status: ${filterState.isRegistrable ? "Registrable" : "Not Registrable"}`,
        onRemove: () => removeFilter("status"),
      });
    }

    // Add practice period chip
    if (filterState.practicePeriod > 0) {
      newChips.push({
        id: "practiceClass",
        label: `Practice Period: ${filterState.practicePeriod}`,
        onRemove: () => removeFilter("practiceClass"),
      });
    }

    // Add required course chip
    if (filterState.isRequired !== null) {
      newChips.push({
        id: "requiredCourse",
        label: `Required Course: ${filterState.isRequired ? "Yes" : "No"}`,
        onRemove: () => removeFilter("requiredCourse"),
      });
    }

    // Add minimum credit required chip
    if (filterState.minCreditRequired > 0) {
      newChips.push({
        id: "minCreditRequired",
        label: `Min Credits Required: ${filterState.minCreditRequired}`,
        onRemove: () => removeFilter("minCreditRequired"),
      });
    }

    setFilterChips(newChips);
    applyFiltersToQuery();
    onClose();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState({
      minCost: 0,
      maxCost: 1000,
      minCredit: 0,
      maxCredit: 10,
      majorIds: [],
      isRegistrable: null,
      practicePeriod: 0,
      isRequired: null,
      minCreditRequired: 0,
    });
    setFilterChips([]);
    onFilterClear();
  };

  // Calculate if any filters are active
  const hasActiveFilters = filterChips.length > 0;

  return (
    <div>
      <div>
        <Button
          className="flex items-center gap-1"
          color={hasActiveFilters ? "primary" : "default"}
          variant={hasActiveFilters ? "solid" : "bordered"}
          onPress={onOpen}
        >
          <Filter size={16} />
          <span>Filters {hasActiveFilters && `(${filterChips.length})`}</span>
        </Button>
      </div>

      {/* Filter modal */}
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="sm"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center p-4 border-b">
            <span className="text-lg font-medium">Filter Courses</span>
          </ModalHeader>
          <ModalBody className="py-4 px-4">
            {/* Cost Range Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="cost-range"
              >
                Cost Range ($)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  aria-label="Minimum cost"
                  className="w-[120px] bg-gray-50"
                  id="min-cost"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.minCost.toString()}
                  onChange={(e) =>
                    updateFilter("minCost", Number(e.target.value))
                  }
                />
                <span>to</span>
                <Input
                  aria-label="Maximum cost"
                  className="w-[120px] bg-gray-50"
                  id="max-cost"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.maxCost.toString()}
                  onChange={(e) =>
                    updateFilter("maxCost", Number(e.target.value))
                  }
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>Cost</span>
                  <span>0-1,000</span>
                </p>

                <Slider
                  aria-label="Cost range"
                  className="max-w-full h-1"
                  classNames={{
                    track: "!bg-gray-200 !h-1",
                    filler: "!bg-blue-500 !h-1",
                    thumb: "!bg-white !border-2 !border-blue-500 !h-3 !w-3", // Small circular thumbs
                  }}
                  id="cost-range"
                  maxValue={1000}
                  minValue={0}
                  step={10}
                  value={[filterState.minCost, filterState.maxCost]}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      updateFilter("minCost", value[0]);
                      updateFilter("maxCost", value[1]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Credit Range Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="credit-range"
              >
                Credit Range
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  aria-label="Minimum credits"
                  className="w-[120px] bg-gray-50"
                  id="min-credit"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.minCredit.toString()}
                  onChange={(e) =>
                    updateFilter("minCredit", Number(e.target.value))
                  }
                />
                <span>to</span>
                <Input
                  aria-label="Maximum credits"
                  className="w-[120px] bg-gray-50"
                  id="max-credit"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.maxCredit.toString()}
                  onChange={(e) =>
                    updateFilter("maxCredit", Number(e.target.value))
                  }
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>Credits</span>
                  <span>0-10</span>
                </p>
                <Slider
                  aria-label="Credit range"
                  className="max-w-full h-1"
                  classNames={{
                    track: "!bg-gray-200 !h-1",
                    filler: "!bg-blue-500 !h-1",
                    thumb: "!bg-white !border-2 !border-blue-500 !h-3 !w-3", // Small circular thumbs
                  }}
                  id="credit-range"
                  maxValue={10}
                  minValue={0}
                  step={1}
                  value={[filterState.minCredit, filterState.maxCredit]}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      updateFilter("minCredit", value[0]);
                      updateFilter("maxCredit", value[1]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Major Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="major-select"
              >
                Major
              </label>
              <Select
                aria-label="Select majors"
                className="w-full bg-gray-50"
                id="major-select"
                items={majors}
                placeholder="Select majors"
                selectedKeys={filterState.majorIds}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  if (keys instanceof Set) {
                    updateFilter("majorIds", Array.from(keys));
                  }
                }}
              >
                {majors.map((major) => (
                  <SelectItem key={major.id} textValue={major.id}>
                    {`${major.name} (${major.code})`}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Status Toggle */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="status-toggle"
              >
                Course Status
              </label>
              <div className="flex gap-2" id="status-toggle" role="group">
                <Button
                  className="flex-1"
                  color={
                    filterState.isRegistrable === true ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRegistrable === true ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRegistrable",
                      filterState.isRegistrable === true ? null : true
                    )
                  }
                >
                  Registrable
                </Button>
                <Button
                  className="flex-1"
                  color={
                    filterState.isRegistrable === false ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRegistrable === false ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRegistrable",
                      filterState.isRegistrable === false ? null : false
                    )
                  }
                >
                  Not Registrable
                </Button>
              </div>
            </div>

            {/* Required Course Toggle */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="required-toggle"
              >
                Course Required
              </label>
              <div className="flex gap-2" id="required-toggle" role="group">
                <Button
                  className="flex-1"
                  color={
                    filterState.isRequired === true ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRequired === true ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRequired",
                      filterState.isRequired === true ? null : true
                    )
                  }
                >
                  Required
                </Button>
                <Button
                  className="flex-1"
                  color={
                    filterState.isRequired === false ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isRequired === false ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isRequired",
                      filterState.isRequired === false ? null : false
                    )
                  }
                >
                  Not Required
                </Button>
              </div>
            </div>

            {/* Practice Period Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="practice-period"
              >
                Practice Period
              </label>
              <Input
                className="w-full bg-gray-50"
                id="practice-period"
                min={0}
                size="sm"
                type="number"
                value={filterState.practicePeriod.toString()}
                onChange={(e) =>
                  updateFilter("practicePeriod", Number(e.target.value))
                }
              />
            </div>

            {/* Min Credit Required Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="min-credit-required"
              >
                Min Credits Required
              </label>
              <Input
                className="w-full bg-gray-50"
                id="min-credit-required"
                min={0}
                size="sm"
                type="number"
                value={filterState.minCreditRequired.toString()}
                onChange={(e) =>
                  updateFilter("minCreditRequired", Number(e.target.value))
                }
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t pt-4 flex justify-between">
            <Button color="danger" variant="light" onPress={clearFilters}>
              Reset All
            </Button>
            <div className="flex gap-2">
              <Button variant="bordered" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
