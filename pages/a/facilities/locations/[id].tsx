import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Spinner,
  Tab,
  Tabs,
  useDisclosure,
  Pagination,
} from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { BuildingTable } from "@/components/a/building/building-table";
import { BuildingFilter } from "@/components/a/building/building-filter";
import { CreateBuildingModal } from "@/components/a/building/create-building-modal";
import { UpdateBuildingModal } from "@/components/a/building/update-building-modal";
import { FloorTable } from "@/components/a/floor/floor-table";
import { FloorFilter } from "@/components/a/floor/floor-filter";
import { CreateFloorModal } from "@/components/a/floor/create-floor-modal";
import { UpdateFloorModal } from "@/components/a/floor/update-floor-modal";
import { RoomTable } from "@/components/a/room/room-table";
import { RoomFilter } from "@/components/a/room/room-filter";
import { CreateRoomModal } from "@/components/a/room/create-room-modal";
import { UpdateRoomModal } from "@/components/a/room/update-room-modal";
import { useDebounce } from "@/hooks/useDebounce";
import { locationService } from "@/services/location/location.service";
// Building service operations now handled by Redux actions in the modals
import { Building, BuildingQuery } from "@/services/building/building.schema";
import { Floor, FloorQuery } from "@/services/floor/floor.schema";
import { Room, RoomQuery } from "@/services/room/room.schema";
import { Location } from "@/services/location/location.schema";
import { buildingService } from "@/services/building/building.service";
import { floorService } from "@/services/floor/floor.service";
import { roomService } from "@/services/room/room.service";
import "./index.scss"; // Import your styles

export default function LocationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const locationId = id as string;

  // Location state
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Tab state
  const [activeTab, setActiveTab] = useState("rooms");

  // Buildings state
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [buildingsTotal, setBuildingsTotal] = useState(0);
  // Building query state
  const [buildingQuery, setBuildingQuery] = useState<BuildingQuery>({
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "",
    isDesc: false,
    filter: {
      locationId: locationId,
    },
  });

  const [buildingSearchInput, setBuildingSearchInput] = useState("");
  const debouncedBuildingSearch = useDebounce<string>(buildingSearchInput, 600);

  // Floors state
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isFloorsLoading, setIsFloorsLoading] = useState(false);
  const [floorsError, setFloorsError] = useState<string | null>(null);
  const [floorsTotal, setFloorsTotal] = useState(0);
  // Floor query state
  const [floorQuery, setFloorQuery] = useState<FloorQuery>({
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "",
    isDesc: false,
    filter: {
      buildingId: "",
      name: "",
    },
  });

  // Rooms state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [roomsTotal, setRoomsTotal] = useState(0); // Room query state
  const [roomQuery, setRoomQuery] = useState<RoomQuery>({
    pageNumber: 1,
    itemsPerpage: 10,
    orderBy: "",
    isDesc: false,
    filter: {
      buildingId: "",
      floorId: "",
      name: "",
      locationId: locationId, // Add locationId to the filter
    },
  });

  // Modal state for building
  const {
    isOpen: isBuildingModalOpen,
    onOpen: onBuildingModalOpen,
    onOpenChange: onBuildingModalOpenChange,
  } = useDisclosure();
  // Submission state is now handled within the modal components
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [buildingModalMode, setBuildingModalMode] = useState<
    "create" | "update"
  >("create");

  // Modal state for floor
  const {
    isOpen: isFloorModalOpen,
    onOpen: onFloorModalOpen,
    onOpenChange: onFloorModalOpenChange,
  } = useDisclosure();
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [floorModalMode, setFloorModalMode] = useState<"create" | "update">(
    "create"
  );

  // Modal state for room
  const {
    isOpen: isRoomModalOpen,
    onOpen: onRoomModalOpen,
    onOpenChange: onRoomModalOpenChange,
  } = useDisclosure();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomModalMode, setRoomModalMode] = useState<"create" | "update">(
    "create"
  );

  // Fetch location data
  const fetchLocation = useCallback(async () => {
    if (!locationId) return;

    try {
      setIsLocationLoading(true);
      const response = await locationService.getLocationById(locationId);

      if (response && response.data) {
        setLocation(response.data);
      }
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLocationLoading(false);
    }
  }, [locationId]);
  // Fetch buildings for the location
  const fetchBuildings = useCallback(async () => {
    if (!locationId) return;

    try {
      setIsBuildingsLoading(true);
      const response = await buildingService.getBuildings({
        ...buildingQuery,
        filter: {
          ...buildingQuery.filter,
          locationId: locationId,
        },
      });

      if (response && response.data) {
        setBuildings(response.data.data || []);
        setBuildingsTotal(response.data.total || 0);
      }
    } catch (error) {
      setBuildingsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsBuildingsLoading(false);
    }
  }, [locationId, buildingQuery]); // Fetch floors for the location
  const fetchFloors = useCallback(async () => {
    if (!locationId) return;

    try {
      setIsFloorsLoading(true);

      // Create a clean query object to avoid nested references
      const currentQuery = {
        pageNumber: floorQuery.pageNumber,
        itemsPerpage: floorQuery.itemsPerpage,
        orderBy: floorQuery.orderBy,
        isDesc: floorQuery.isDesc,
        filter: {
          ...floorQuery.filter,
          locationId: locationId, // Use the current locationId directly
        },
      };

      const response = await floorService.getFloors(currentQuery);

      if (response && response.data) {
        setFloors(response.data.data || []);
        setFloorsTotal(response.data.total || 0);
      }
    } catch (error) {
      setFloorsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsFloorsLoading(false);
    }
  }, [locationId, floorQuery]); // Add floorQuery to dependency array so it gets the latest values

  // Fetch rooms for the location
  const fetchRooms = useCallback(async () => {
    if (!locationId) return;

    try {
      setIsRoomsLoading(true);

      // Create a clean query object to avoid nested references
      const currentQuery = {
        pageNumber: roomQuery.pageNumber,
        itemsPerpage: roomQuery.itemsPerpage,
        orderBy: roomQuery.orderBy,
        isDesc: roomQuery.isDesc,
        filter: {
          ...roomQuery.filter,
          locationId: locationId, // Use the current locationId directly
        },
      };

      const response = await roomService.getRooms(currentQuery);

      if (response && response.data) {
        setRooms(response.data.data || []);
        setRoomsTotal(response.data.total || 0);
      }
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsRoomsLoading(false);
    }
  }, [locationId, roomQuery]); // Add roomQuery to dependency array so it gets the latest values

  // Handle building activation/deactivation
  const toggleBuildingActive = async (building: Building) => {
    try {
      if (building.isActive) {
        await buildingService.deactivateBuilding(building.id);
      } else {
        await buildingService.activateBuilding(building.id);
      }
      await fetchBuildings();
    } catch (error) {
      setBuildingsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Handle adding new building
  const handleAddBuilding = () => {
    setSelectedBuilding(null);
    setBuildingModalMode("create");
    onBuildingModalOpen();
  };

  // Handle edit building
  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setBuildingModalMode("update");
    onBuildingModalOpen();
  };

  // Handle floor activation/deactivation
  const toggleFloorActive = async (floor: Floor) => {
    try {
      if (floor.isActive) {
        await floorService.deactivateFloor(floor.id);
      } else {
        await floorService.activateFloor(floor.id);
      }
      await fetchFloors();
    } catch (error) {
      setFloorsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Handle adding new floor
  const handleAddFloor = () => {
    setSelectedFloor(null);
    setFloorModalMode("create");
    onFloorModalOpen();
  };

  // Handle edit floor
  const handleEditFloor = (floor: Floor) => {
    setSelectedFloor(floor);
    setFloorModalMode("update");
    onFloorModalOpen();
  };

  // Handle room activation/deactivation
  const toggleRoomActive = async (room: Room) => {
    try {
      if (room.isActive) {
        await roomService.deactivateRoom(room.id);
      } else {
        await roomService.activateRoom(room.id);
      }
      await fetchRooms();
    } catch (error) {
      setRoomsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Handle adding new room
  const handleAddRoom = () => {
    setSelectedRoom(null);
    setRoomModalMode("create");
    onRoomModalOpen();
  };

  // Handle edit room
  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setRoomModalMode("update");
    onRoomModalOpen();
  };

  // Handle building sort
  const handleBuildingSort = (key: string) => {
    setBuildingQuery((prev) => ({
      ...prev,
      orderBy: key,
      isDesc: prev.orderBy === key ? !prev.isDesc : false,
    }));
  };

  // Handle floor sort
  const handleFloorSort = (key: string) => {
    setFloorQuery((prev) => ({
      ...prev,
      orderBy: key,
      isDesc: prev.orderBy === key ? !prev.isDesc : false,
    }));
  };

  // Handle room sort
  const handleRoomSort = (key: string) => {
    setRoomQuery({
      ...roomQuery,
      orderBy: key,
      isDesc: roomQuery.orderBy === key ? !roomQuery.isDesc : false,
    });
  };

  // Handle page change for buildings
  const handleBuildingPageChange = (page: number) => {
    setBuildingQuery((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle page change for floors
  const handleFloorPageChange = (page: number) => {
    setFloorQuery((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle page change for rooms
  const handleRoomPageChange = (page: number) => {
    setRoomQuery({
      ...roomQuery,
      pageNumber: page,
    });
  }; // Effect for debounced search

  useEffect(() => {
    if (
      !buildingQuery.filter?.name ||
      debouncedBuildingSearch !== buildingQuery.filter.name
    ) {
      setBuildingQuery((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          name: debouncedBuildingSearch,
        },
        pageNumber: 1, // Reset to first page on new search
      }));
    }
  }, [debouncedBuildingSearch, buildingQuery.filter?.name]);
  // Fetch floors when query changes
  useEffect(() => {
    if (locationId && activeTab === "floors") {
      fetchFloors();
    }
  }, [
    locationId,
    activeTab,
    floorQuery.pageNumber,
    floorQuery.filter?.buildingId,
    floorQuery.filter?.name,
    floorQuery.orderBy,
    floorQuery.isDesc,
  ]);
  // Fetch rooms when query changes
  useEffect(() => {
    if (locationId && activeTab === "rooms") {
      fetchRooms();
    }
  }, [
    locationId,
    activeTab,
    roomQuery.pageNumber,
    roomQuery.filter?.buildingId,
    roomQuery.filter?.floorId,
    roomQuery.filter?.name,
    roomQuery.orderBy,
    roomQuery.isDesc,
    fetchRooms,
  ]);
  // Update room query with locationId when it changes
  useEffect(() => {
    if (locationId) {
      setRoomQuery((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          locationId: locationId,
        },
      }));
    }
  }, [locationId]);

  // Initial data fetch
  useEffect(() => {
    if (locationId) {
      fetchLocation();
    }
  }, [locationId, fetchLocation]);

  // Fetch buildings when query changes
  useEffect(() => {
    if (locationId) {
      fetchBuildings();
    }
  }, [locationId, fetchBuildings]);

  // Loading state
  if (isLocationLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner color="primary" label="Loading..." />
        </div>
      </DefaultLayout>
    );
  }

  // Error state
  if (locationError || !location) {
    return (
      <DefaultLayout>
        <div className="p-6 text-center">
          <h2 className="text-2xl mb-4 text-red-600">Error</h2>
          <p className="mb-6">Failed to load location details.</p>
          <Button
            color="primary"
            onClick={() => router.push("/facilities/locations")}
          >
            Return to Locations
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Head>
        <title>{location.name} - Location Details</title>
      </Head>

      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Link href="/facilities/locations">
            <Button color="default" variant="flat">
              Back to Locations
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">{location.name}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main information */}
          <Card className="lg:col-span-2">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{location.country}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{location.city}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{location.district}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Ward</p>
                  <p className="font-medium">{location.ward}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address Detail</p>
                  <p>{location.addressDetail}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Chip
                    color={location.isActive ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {location.isActive ? "Active" : "Inactive"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Summary</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Buildings</p>
                  <p className="text-2xl font-bold">{location.totalBuilding}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Floors</p>
                  <p className="text-2xl font-bold">{location.totalFloor}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold">{location.totalRoom}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>{" "}
        {/* Tabs for Room, Floor, Building management */}
        <div className="mt-10">
          <Tabs
            aria-label="Location Management Tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="rooms" title="Rooms">
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Rooms</h2>
                  <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={handleAddRoom}
                  >
                    Add Room
                  </Button>{" "}
                </div>
                {/* Filters */}
                <div className="mb-6">
                  <RoomFilter
                    locationId={locationId}
                    query={roomQuery}
                    onQueryChange={setRoomQuery}
                  />
                </div>
                {/* Room table */}
                <RoomTable
                  isLoading={isRoomsLoading}
                  rooms={rooms}
                  sortDirection={roomQuery.isDesc ? "desc" : "asc"}
                  sortKey={roomQuery.orderBy}
                  onActiveToggle={toggleRoomActive}
                  onEdit={handleEditRoom}
                  onSort={handleRoomSort}
                />
                {/* Pagination */}
                {roomsTotal > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      page={roomQuery.pageNumber}
                      total={Math.ceil(roomsTotal / roomQuery.itemsPerpage!)}
                      onChange={handleRoomPageChange}
                    />
                  </div>
                )}
              </div>
            </Tab>
            <Tab key="floors" title="Floors">
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Floors</h2>
                  <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={handleAddFloor}
                  >
                    Add Floor
                  </Button>
                </div>{" "}
                {/* Filters */}{" "}
                <div className="mb-6">
                  <FloorFilter
                    buildings={buildings}
                    query={floorQuery}
                    onQueryChange={setFloorQuery}
                  />
                </div>
                {/* Floor table */}
                <FloorTable
                  floors={floors}
                  isLoading={isFloorsLoading}
                  sortDirection={floorQuery.isDesc ? "desc" : "asc"}
                  sortKey={floorQuery.orderBy}
                  onActiveToggle={toggleFloorActive}
                  onEdit={handleEditFloor}
                  onSort={handleFloorSort}
                />
                {/* Pagination */}
                {floorsTotal > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      page={floorQuery.pageNumber}
                      total={Math.ceil(floorsTotal / floorQuery.itemsPerpage!)}
                      onChange={handleFloorPageChange}
                    />
                  </div>
                )}
              </div>
            </Tab>
            <Tab key="buildings" title="Buildings">
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Buildings</h2>
                  <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={handleAddBuilding}
                  >
                    Add Building
                  </Button>
                </div>

                {/* Filters */}
                <div className="mb-6">
                  <BuildingFilter
                    searchQuery={buildingSearchInput}
                    onSearchChange={setBuildingSearchInput}
                  />
                </div>

                {/* Building table */}
                <BuildingTable
                  buildings={buildings}
                  isLoading={isBuildingsLoading}
                  sortDirection={buildingQuery.isDesc ? "desc" : "asc"}
                  sortKey={buildingQuery.orderBy}
                  onActiveToggle={toggleBuildingActive}
                  onEdit={handleEditBuilding}
                  onSort={handleBuildingSort}
                />

                {/* Pagination */}
                {buildingsTotal > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      page={buildingQuery.pageNumber}
                      total={Math.ceil(
                        buildingsTotal / buildingQuery.itemsPerpage!
                      )}
                      onChange={handleBuildingPageChange}
                    />
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>{" "}
        {/* Building Modals */}
        {buildingModalMode === "create" ? (
          <CreateBuildingModal
            isOpen={isBuildingModalOpen}
            locationId={locationId}
            onOpenChange={onBuildingModalOpenChange}
            onSuccess={fetchBuildings}
          />
        ) : (
          <UpdateBuildingModal
            building={selectedBuilding}
            isOpen={isBuildingModalOpen}
            onOpenChange={onBuildingModalOpenChange}
            onSuccess={fetchBuildings}
          />
        )}{" "}
        {/* Floor Modals */}
        {floorModalMode === "create" ? (
          <CreateFloorModal
            buildingId={floorQuery.filter?.buildingId}
            buildings={buildings.filter((b) => b.isActive)}
            isOpen={isFloorModalOpen}
            onOpenChange={onFloorModalOpenChange}
            onSuccess={fetchFloors}
          />
        ) : (
          <UpdateFloorModal
            floor={selectedFloor}
            isOpen={isFloorModalOpen}
            onOpenChange={onFloorModalOpenChange}
            onSuccess={fetchFloors}
          />
        )}
        {roomModalMode === "create" ? (
          <CreateRoomModal
            floorId={roomQuery.filter?.floorId}
            floors={floors.filter((f) => f.isActive)}
            isOpen={isRoomModalOpen}
            onOpenChange={onRoomModalOpenChange}
            onSuccess={fetchRooms}
          />
        ) : (
          <UpdateRoomModal
            isOpen={isRoomModalOpen}
            room={selectedRoom}
            onOpenChange={onRoomModalOpenChange}
            onSuccess={fetchRooms}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
