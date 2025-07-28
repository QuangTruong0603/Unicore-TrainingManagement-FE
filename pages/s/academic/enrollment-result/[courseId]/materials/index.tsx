import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search, ArrowLeft } from "lucide-react";
import { Button, Input, Pagination, Spinner, Tabs, Tab } from "@heroui/react";
import { useSelector } from "react-redux";

import DefaultLayout from "@/layouts/default";
import { MaterialType } from "@/services/material-type/material-type.schema";
import { materialTypeService } from "@/services/material-type/material-type.service";
import { MaterialCard } from "@/components/a/material/material-card";
import { RootState } from "@/store";
import {
  fetchMaterials,
  setPage,
  setMaterialTypeFilter,
  setSearchTerm,
  setCourseId,
} from "@/store/slices/materialSlice";
import { useAppDispatch } from "@/store/hooks";
import "./index.scss";

export default function CourseMaterialsPage() {
  const router = useRouter();
  const { courseId, courseName } = router.query;
  const courseIdString = typeof courseId === "string" ? courseId : "";
  const courseNameString = typeof courseName === "string" ? courseName : "";
  const dispatch = useAppDispatch();

  // Get material state from Redux
  const { materials, query, total, isLoading, error } = useSelector(
    (state: RootState) => state.material
  );

  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch material types
  const fetchMaterialTypes = async () => {
    try {
      const typesResponse = await materialTypeService.getAllMaterialTypes();

      setMaterialTypes(typesResponse.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Set course ID in Redux when it changes
  useEffect(() => {
    if (courseIdString) {
      dispatch(setCourseId(courseIdString));
    }
  }, [courseIdString, dispatch]);

  // Fetch materials when query parameters change
  useEffect(() => {
    if (courseIdString) {
      dispatch(fetchMaterials({ courseId: courseIdString, query }));
    }
  }, [courseIdString, query, dispatch]);

  // Fetch material types on component mount
  useEffect(() => {
    fetchMaterialTypes();
  }, []);

  // Show error toast when there's an error from Redux
  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  // Set page loading to false when all data is loaded
  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) {
      return;
    }

    // If no courseId after router is ready, stop loading after material types are fetched
    if (!courseIdString && materialTypes.length > 0) {
      setPageLoading(false);

      return;
    }

    // Check if we have course ID and both material types and materials have been fetched
    if (courseIdString && materialTypes.length > 0 && !isLoading) {
      setPageLoading(false);
    }
  }, [router.isReady, courseIdString, materialTypes, isLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleTabChange = (key: string) => {
    if (key === "all") {
      dispatch(setMaterialTypeFilter(undefined));
    } else {
      dispatch(setMaterialTypeFilter(key));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const handleBackToClasses = () => {
    router.push("/s/academic/enrollment-result");
  };

  if (pageLoading) {
    return (
      <DefaultLayout>
        <div className="loading-screen">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container p-6">
        <div className="flex items-center mb-6">
          <Button
            isIconOnly
            className="mr-2"
            variant="light"
            onPress={handleBackToClasses}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">
            {courseNameString ? `${courseNameString} - Materials` : "Materials"}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/3">
            <Input
              className="pl-10"
              placeholder="Search materials..."
              value={query.filter?.name || ""}
              onChange={handleSearchChange}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <Tabs
          aria-label="Material Types"
          className="mb-6"
          selectedKey={query.materialTypeId || "all"}
          onSelectionChange={(key) => handleTabChange(key as string)}
        >
          <Tab key="all" title="All Materials" />
          {materialTypes.map((type) => (
            <Tab key={type.id} title={type.name} />
          ))}
        </Tabs>

        <div className="bg-white rounded-lg shadow p-4">
          {materials.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No materials found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => {
                const materialType = materialTypes.find(
                  (type) => type.id === material.materialTypeId
                );

                return (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    materialType={materialType}
                  />
                );
              })}
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {materials.length} of {total} materials
            </div>
            <Pagination
              page={query.pageNumber || 1}
              total={Math.ceil(total / (query.itemsPerpage || 10))}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
