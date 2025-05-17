import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Pagination, Button, useDisclosure } from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { LocationCard } from "@/components/location/location-card";
import { LocationFilter } from "@/components/location/location-filter";
import { CreateLocationModal } from "@/components/location/create-location-modal";
import { UpdateLocationModal } from "@/components/location/update-location-modal";
import { useDebounce } from "@/hooks/useDebounce";
import { locationService } from "@/services/location/location.service";
import { Location, LocationQuery } from "@/services/location/location.schema";
import {
  CreateLocationData,
  UpdateLocationData,
} from "@/services/location/location.dto";

export default function LocationsPage() {
  // Location state
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Query state
  const [query, setQuery] = useState<LocationQuery>({
    pageNumber: 1,
    itemsPerpage: 12, // Show more items per page for cards
    searchQuery: "",
    orderBy: "name",
    isDesc: false,
  });

  const [searchInput, setSearchInput] = useState(() => query.searchQuery || "");
  const debouncedSearch = useDebounce<string>(searchInput, 600);

  // Modal state
  const {
    isOpen: isLocationModalOpen,
    onOpen: onLocationModalOpen,
    onOpenChange: onLocationModalChange,
  } = useDisclosure();
  const [isLocationSubmitting, setIsLocationSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await locationService.getLocations(query);

      if (response && response.data) {
        setLocations(response.data.data);
        if (response.data.total !== undefined) {
          setTotal(response.data.total);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Create location
  const createLocation = async (data: CreateLocationData) => {
    try {
      await locationService.createLocation(data);

      return await fetchLocations();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Update location
  const updateLocation = async (id: string, data: UpdateLocationData) => {
    try {
      setIsLocationSubmitting(true);
      await locationService.updateLocation(id, data);
      await fetchLocations();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLocationSubmitting(false);
    }
  };

  // Activate/deactivate location
  const activateLocation = useCallback(
    async (id: string) => {
      try {
        await locationService.activateLocation(id);

        return await fetchLocations();
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    },
    [fetchLocations]
  );

  const deactivateLocation = useCallback(
    async (id: string) => {
      try {
        await locationService.deactivateLocation(id);

        return await fetchLocations();
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    },
    [fetchLocations]
  );

  // Handle location toggle (activate/deactivate)
  const handleLocationToggle = (location: Location) => {
    if (location.isActive) {
      deactivateLocation(location.id);
    } else {
      activateLocation(location.id);
    }
  };

  // Handle edit location
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setModalMode("update");
    onLocationModalOpen();
  };

  // Handle add location
  const handleAddLocation = () => {
    setSelectedLocation(null);
    setModalMode("create");
    onLocationModalOpen();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber: page }));
  };

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearch !== query.searchQuery) {
      setQuery((prevQuery) => ({
        ...prevQuery,
        searchQuery: debouncedSearch,
        pageNumber: 1, // Reset to first page on new search
      }));
    }
  }, [debouncedSearch, query.searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Location Management</h1>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={handleAddLocation}
          >
            Add Location
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <LocationFilter
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
          />
        </div>

        {/* Location grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        ) : locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onActiveToggle={handleLocationToggle}
                onEdit={handleEditLocation}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No locations found</p>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              page={query.pageNumber}
              total={Math.ceil(total / query.itemsPerpage)}
              onChange={handlePageChange}
            />
          </div>
        )}

        {/* Create Location Modal */}
        <CreateLocationModal
          isOpen={isLocationModalOpen && modalMode === "create"}
          isSubmitting={isLocationSubmitting}
          onOpenChange={onLocationModalChange}
          onSubmit={createLocation}
        />

        {/* Update Location Modal */}
        {selectedLocation && (
          <UpdateLocationModal
            isOpen={isLocationModalOpen && modalMode === "update"}
            isSubmitting={isLocationSubmitting}
            location={selectedLocation} // Change initialData to location
            onOpenChange={onLocationModalChange}
            onSubmit={(data) => updateLocation(selectedLocation.id, data)}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
