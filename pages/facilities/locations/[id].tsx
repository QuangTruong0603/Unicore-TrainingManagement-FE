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
import { BuildingTable } from "@/components/building/building-table";
import { BuildingFilter } from "@/components/building/building-filter";
import { CreateBuildingModal } from "@/components/building/create-building-modal";
import { UpdateBuildingModal } from "@/components/building/update-building-modal";
import { useDebounce } from "@/hooks/useDebounce";
import { locationService } from "@/services/location/location.service";
// Building service operations now handled by Redux actions in the modals
import { Building, BuildingQuery } from "@/services/building/building.schema";
import { Location } from "@/services/location/location.schema";
import { buildingService } from "@/services/building/building.service";

export default function LocationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const locationId = id as string;

  // Location state
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("buildings");

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
  }, [locationId, buildingQuery]);
  // No longer need separate create/update functions as they're handled by the modals

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

  // Handle building sort
  const handleBuildingSort = (key: string) => {
    setBuildingQuery((prev) => ({
      ...prev,
      orderBy: key,
      isDesc: prev.orderBy === key ? !prev.isDesc : false,
    }));
  };

  // Handle page change for buildings
  const handleBuildingPageChange = (page: number) => {
    setBuildingQuery((prev) => ({ ...prev, pageNumber: page }));
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
        </div>

        {/* Tabs for Building, Floor, Room management */}
        <div className="mt-10">
          <Tabs
            aria-label="Location Management Tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
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
                <Card>
                  <CardBody>
                    <BuildingTable
                      buildings={buildings}
                      isLoading={isBuildingsLoading}
                      sortDirection={buildingQuery.isDesc ? "desc" : "asc"}
                      sortKey={buildingQuery.orderBy}
                      onActiveToggle={toggleBuildingActive}
                      onEdit={handleEditBuilding}
                      onSort={handleBuildingSort}
                    />
                  </CardBody>
                </Card>

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
            <Tab key="floors" title="Floors">
              <div className="py-4">
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">
                    Floor management will be implemented in the future.
                  </p>
                </div>
              </div>
            </Tab>
            <Tab key="rooms" title="Rooms">
              <div className="py-4">
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">
                    Room management will be implemented in the future.
                  </p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>

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
            isOpen={isBuildingModalOpen}
            building={selectedBuilding}
            onOpenChange={onBuildingModalOpenChange}
            onSuccess={fetchBuildings}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
