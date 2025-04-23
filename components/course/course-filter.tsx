import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Button,
  Checkbox,
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
  minPrice: number;
  maxPrice: number;
  minCredit: number;
  maxCredit: number;
  majorIds: string[];
  isOpening: boolean | null;
  isHavePracticeClass: boolean | null;
  isUseForCalculateScore: boolean | null;
  minCreditCanApply: number;
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
    minPrice: 0,
    maxPrice: 1000,
    minCredit: 0,
    maxCredit: 10,
    majorIds: [],
    isOpening: null,
    isHavePracticeClass: null,
    isUseForCalculateScore: null,
    minCreditCanApply: 0,
  });
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);

  // Update filter state based on changed fields
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  // Remove a specific filter
  const removeFilter = (id: string) => {
    // Handle removing specific filters
    if (id === "price") {
      updateFilter("minPrice", 0);
      updateFilter("maxPrice", 1000);
    } else if (id === "credit") {
      updateFilter("minCredit", 0);
      updateFilter("maxCredit", 10);
    } else if (id === "status") {
      updateFilter("isOpening", null);
    } else if (id === "majorIds") {
      updateFilter("majorIds", []);
    } else if (id === "practiceClass") {
      updateFilter("isHavePracticeClass", null);
    } else if (id === "scoreCalculation") {
      updateFilter("isUseForCalculateScore", null);
    } else if (id === "minCreditApply") {
      updateFilter("minCreditCanApply", 0);
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
        priceRange:
          filterState.minPrice > 0 || filterState.maxPrice < 1000
            ? [filterState.minPrice, filterState.maxPrice]
            : undefined,
        creditRange:
          filterState.minCredit > 0 || filterState.maxCredit < 10
            ? [filterState.minCredit, filterState.maxCredit]
            : undefined,
        majorIds:
          filterState.majorIds.length > 0 ? filterState.majorIds : undefined,
        isOpening: filterState.isOpening,
        isHavePracticeClass: filterState.isHavePracticeClass,
        isUseForCalculateScore: filterState.isUseForCalculateScore,
        minCreditCanApply:
          filterState.minCreditCanApply > 0
            ? filterState.minCreditCanApply
            : undefined,
      },
    };

    onFilterChange(newQuery);
  };

  // Apply filters from the modal
  const applyFilters = () => {
    const newChips: FilterChip[] = [];

    // Add price filter chip
    if (filterState.minPrice > 0 || filterState.maxPrice < 1000) {
      newChips.push({
        id: "price",
        label: `Price: $${filterState.minPrice} - $${filterState.maxPrice}`,
        onRemove: () => removeFilter("price"),
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
    if (filterState.isOpening !== null) {
      newChips.push({
        id: "status",
        label: `Status: ${filterState.isOpening ? "Opening" : "Normal"}`,
        onRemove: () => removeFilter("status"),
      });
    }

    // Add practice class chip
    if (filterState.isHavePracticeClass !== null) {
      newChips.push({
        id: "practiceClass",
        label: `Practice Class: ${filterState.isHavePracticeClass ? "Yes" : "No"}`,
        onRemove: () => removeFilter("practiceClass"),
      });
    }

    // Add score calculation chip
    if (filterState.isUseForCalculateScore !== null) {
      newChips.push({
        id: "scoreCalculation",
        label: `Used for Score: ${filterState.isUseForCalculateScore ? "Yes" : "No"}`,
        onRemove: () => removeFilter("scoreCalculation"),
      });
    }

    // Add minimum credit chip
    if (filterState.minCreditCanApply > 0) {
      newChips.push({
        id: "minCreditApply",
        label: `Min Credits to Apply: ${filterState.minCreditCanApply}`,
        onRemove: () => removeFilter("minCreditApply"),
      });
    }

    setFilterChips(newChips);
    applyFiltersToQuery();
    onClose();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState({
      minPrice: 0,
      maxPrice: 1000,
      minCredit: 0,
      maxCredit: 10,
      majorIds: [],
      isOpening: null,
      isHavePracticeClass: null,
      isUseForCalculateScore: null,
      minCreditCanApply: 0,
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
            {/* Price Range Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="price-range"
              >
                Price Range ($)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  aria-label="Minimum price"
                  className="w-[120px] bg-gray-50"
                  id="min-price"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.minPrice.toString()}
                  onChange={(e) =>
                    updateFilter("minPrice", Number(e.target.value))
                  }
                />
                <span>to</span>
                <Input
                  aria-label="Maximum price"
                  className="w-[120px] bg-gray-50"
                  id="max-price"
                  min={0}
                  size="sm"
                  type="number"
                  value={filterState.maxPrice.toString()}
                  onChange={(e) =>
                    updateFilter("maxPrice", Number(e.target.value))
                  }
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>Price</span>
                  <span>0-1,000</span>
                </p>

                <Slider
                  aria-label="Price range"
                  className="max-w-full h-1"
                  classNames={{
                    track: "!bg-gray-200 !h-1",
                    filler: "!bg-blue-500 !h-1",
                    thumb: "!bg-white !border-2 !border-blue-500 !h-3 !w-3", // Small circular thumbs
                  }}
                  id="price-range"
                  maxValue={1000}
                  minValue={0}
                  step={10}
                  value={[filterState.minPrice, filterState.maxPrice]}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      updateFilter("minPrice", value[0]);
                      updateFilter("maxPrice", value[1]);
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
                  color={filterState.isOpening === true ? "primary" : "default"}
                  size="sm"
                  variant={
                    filterState.isOpening === true ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isOpening",
                      filterState.isOpening === true ? null : true
                    )
                  }
                >
                  Opening
                </Button>
                <Button
                  className="flex-1"
                  color={
                    filterState.isOpening === false ? "primary" : "default"
                  }
                  size="sm"
                  variant={
                    filterState.isOpening === false ? "solid" : "bordered"
                  }
                  onPress={() =>
                    updateFilter(
                      "isOpening",
                      filterState.isOpening === false ? null : false
                    )
                  }
                >
                  Normal
                </Button>
              </div>
            </div>

            {/* Other Toggle Filters */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="features-group"
              >
                Course Features
              </label>
              <div className="space-y-2" id="features-group" role="group">
                <div>
                  <Checkbox
                    id="practice-class"
                    isSelected={filterState.isHavePracticeClass === true}
                    onValueChange={(value) =>
                      updateFilter("isHavePracticeClass", value ? true : null)
                    }
                  >
                    Has Practice Class
                  </Checkbox>
                </div>
                <div>
                  <Checkbox
                    id="score-calculation"
                    isSelected={filterState.isUseForCalculateScore === true}
                    onValueChange={(value) =>
                      updateFilter(
                        "isUseForCalculateScore",
                        value ? true : null
                      )
                    }
                  >
                    Used for Score Calculation
                  </Checkbox>
                </div>
              </div>
            </div>

            {/* Min Credit Apply Filter */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="min-credit-apply"
              >
                Min Credits Required to Apply
              </label>
              <Input
                className="w-full bg-gray-50"
                id="min-credit-apply"
                min={0}
                size="sm"
                type="number"
                value={filterState.minCreditCanApply.toString()}
                onChange={(e) =>
                  updateFilter("minCreditCanApply", Number(e.target.value))
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
