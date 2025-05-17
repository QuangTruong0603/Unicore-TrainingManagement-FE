// filepath: e:\ASSIGNMENT TDTU\HK8\KLTN\SOURCE\WebApp\components\room\room-filter.tsx
import { ChangeEvent, useEffect, useState } from "react";
import { Input, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Search } from "lucide-react";

import { RoomQuery } from "@/services/room/room.schema";
import { Floor } from "@/services/floor/floor.schema";
import { Building } from "@/services/building/building.schema";
import { Location } from "@/services/location/location.schema";
import { buildingService } from "@/services/building/building.service";
import { floorService } from "@/services/floor/floor.service";
import { useDebounce } from "@/hooks/useDebounce";

interface RoomFilterProps {
  query: RoomQuery;
  onQueryChange: (query: RoomQuery) => void;
  locationId?: string;
  locations?: Location[];
}

export function RoomFilter({
  query,
  onQueryChange,
  locationId,
}: RoomFilterProps) {
  // State for form inputs
  const [searchInput, setSearchInput] = useState(query.filter?.name || "");
  const [buildingSearchInput, setBuildingSearchInput] = useState("");
  const [floorSearchInput, setFloorSearchInput] = useState("");

  // State for data
  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [allFloors, setAllFloors] = useState<Floor[]>([]);

  // Debounced search values for performance
  const debouncedSearch = useDebounce<string>(searchInput, 600);
  const debouncedBuildingSearch = useDebounce<string>(buildingSearchInput, 300);
  const debouncedFloorSearch = useDebounce<string>(floorSearchInput, 300);

  // Fetch all buildings and floors
  useEffect(() => {
    const fetchAllBuildings = async () => {
      try {
        // Use the new method to fetch buildings by location if locationId exists
        // Priority to locationId prop over query.filter.locationId
        const currentLocationId = locationId || query.filter?.locationId;

        let response: Building[] | { data: Building[] } | undefined; // Add type annotation
        const effectiveLocationId = currentLocationId;

        if (effectiveLocationId) {
          response =
            await buildingService.getBuildingsByLocation(effectiveLocationId);
        } else {
          // response = await buildingService.getAllBuildings();
        }

        // Check if response has a data property (typical Axios response) or is the data array directly
        const buildings = Array.isArray(response)
          ? response
          : response && typeof response === "object" && "data" in response
            ? (response as { data: Building[] }).data
            : null;

        if (Array.isArray(buildings)) {
          setAllBuildings(buildings);
        } else {
          // eslint-disable-next-line no-console
          console.error("Buildings data is not an array:", response);
          setAllBuildings([]); // Initialize with empty array as fallback
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching buildings:", error);
        setAllBuildings([]); // Initialize with empty array on error
      }
    };
    const fetchAllFloors = async () => {
      try {
        // Use the new method to fetch floors based on location or building ID
        // Priority to locationId prop over query.filter.locationId
        const currentLocationId = locationId || query.filter?.locationId;
        const buildingId = query.filter?.buildingId;
        let response: Floor[] | { data: Floor[] } | undefined; // Add type annotation
        const effectiveLocationId = currentLocationId;

        if (effectiveLocationId) {
          response =
            await floorService.getFloorsByLocation(effectiveLocationId);
        } else if (buildingId) {
          // If only buildingId is provided, use the regular method with query param
          response = await floorService.getAllFloors(undefined, buildingId);
        } else {
          response = await floorService.getAllFloors();
        }

        // Check if response has a data property (typical Axios response) or is the data array directly
        const floors = Array.isArray(response)
          ? response
          : response && typeof response === "object" && "data" in response
            ? (response as { data: Floor[] }).data
            : null;

        if (Array.isArray(floors)) {
          setAllFloors(floors);
        } else {
          // eslint-disable-next-line no-console
          console.error("Floors data is not an array:", response);
          setAllFloors([]); // Initialize with empty array as fallback
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching floors:", error);
        setAllFloors([]); // Initialize with empty array on error
      }
    };
    fetchAllBuildings();
    fetchAllFloors();
  }, [query.filter?.locationId, query.filter?.buildingId, locationId]);

  // When the debounced search value changes, update the query
  useEffect(() => {
    if (debouncedSearch !== query.filter?.name) {
      onQueryChange({
        ...query,
        filter: {
          ...query.filter,
          name: debouncedSearch,
        },
        pageNumber: 1, // Reset to first page on new search
      });
    }
  }, [debouncedSearch, query, onQueryChange]);

  // When locationId prop changes, update the filter in the query
  useEffect(() => {
    if (locationId && locationId !== query.filter?.locationId) {
      onQueryChange({
        ...query,
        filter: {
          ...query.filter,
          locationId: locationId,
        },
      });
    }
  }, [locationId, query, onQueryChange]);

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle floor selection change
  const handleFloorChange = (floorId: string | null) => {
    if (!floorId) {
      onQueryChange({
        ...query,
        filter: {
          ...query.filter,
          floorId: undefined,
        },
        pageNumber: 1,
      });

      return;
    }

    onQueryChange({
      ...query,
      filter: {
        ...query.filter,
        floorId: floorId,
      },
      pageNumber: 1,
    });
  };

  // Handle building selection change
  const handleBuildingChange = (buildingId: string | null) => {
    if (!buildingId) {
      onQueryChange({
        ...query,
        filter: {
          ...query.filter,
          buildingId: undefined,
          floorId: undefined,
        },
        pageNumber: 1,
      });

      return;
    }

    onQueryChange({
      ...query,
      filter: {
        ...query.filter,
        buildingId: buildingId,
        floorId: undefined,
      },
      pageNumber: 1,
    });
  };

  // Handle seats filter change
  const handleSeatsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const seatsValue = e.target.value
      ? parseInt(e.target.value, 10)
      : undefined;

    onQueryChange({
      ...query,
      filter: {
        ...query.filter,
        availableSeats: seatsValue,
      },
      pageNumber: 1,
    });
  };
  // Filter buildings based on search input and selected location
  const filteredBuildings = allBuildings.filter(
    (building) =>
      !debouncedBuildingSearch ||
      building.name
        .toLowerCase()
        .includes(debouncedBuildingSearch.toLowerCase())
  );

  // Filter floors based on search input and selected building
  const filteredFloors = allFloors.filter(
    (floor) =>
      (!debouncedFloorSearch ||
        floor.name
          .toLowerCase()
          .includes(debouncedFloorSearch.toLowerCase())) &&
      (!query.filter?.buildingId ||
        floor.building?.id === query.filter?.buildingId)
  );

  // Add "All Buildings" and "All Floors" options
  const buildingItems = [...filteredBuildings];

  const floorItems = [...filteredFloors];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <Input
          className="w-full"
          endContent={<Search size={16} />}
          label="Search Rooms"
          placeholder="Search by name..."
          value={searchInput}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex-1">
        <Input
          className="w-full"
          label="Minimum Seats"
          placeholder="Enter minimum seats..."
          type="number"
          value={query.filter?.availableSeats?.toString() || ""}
          onChange={handleSeatsChange}
        />
      </div>

      <div className="flex-1">
        <Autocomplete
          className="w-full"
          items={buildingItems}
          label="Filter by Building"
          placeholder="Select a building"
          selectedKey={query.filter?.buildingId || ""}
          onInputChange={setBuildingSearchInput}
          onSelectionChange={(key) => {
            handleBuildingChange(key ? key.toString() : null);
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.id} textValue={item.name}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.name}</span>
                {item.location && (
                  <span className="text-xs text-gray-500">
                    {item.location.name}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      <div className="flex-1">
        <Autocomplete
          className="w-full"
          items={floorItems}
          label="Filter by Floor"
          placeholder="Select a floor"
          selectedKey={query.filter?.floorId || ""}
          onInputChange={setFloorSearchInput}
          onSelectionChange={(key) => {
            handleFloorChange(key ? key.toString() : null);
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.id} textValue={item.name}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.name}</span>
                {item.building && (
                  <span className="text-xs text-gray-500">
                    {item.building.name}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>
    </div>
  );
}
