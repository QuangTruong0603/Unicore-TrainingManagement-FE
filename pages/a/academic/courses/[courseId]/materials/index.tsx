import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus, Search, ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  Pagination,
  Spinner,
  Tabs,
  Tab,
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";

import DefaultLayout from "@/layouts/default";
import { materialService } from "@/services/material/material.service";
import { MaterialType } from "@/services/material-type/material-type.schema";
import { materialTypeService } from "@/services/material-type/material-type.service";
import {
  Material as MaterialInterface,
  MaterialCreateDto,
  MaterialUpdateDto,
} from "@/services/material/material.schema";
import { MaterialModal } from "@/components/a/material/material-modal";
import { MaterialCard } from "@/components/a/material/material-card";
import { RootState, AppDispatch } from "@/store";
import {
  fetchMaterials,
  setPage,
  setItemsPerPage,
  setMaterialTypeFilter,
  setSearchTerm,
  setCourseId,
} from "@/store/slices/materialSlice";

interface MaterialTypeWithMaterials extends MaterialType {
  materials: MaterialInterface[];
}

export default function CourseMaterialsPage() {
  const router = useRouter();
  const { courseId, name } = router.query;
  const courseName = typeof name === "string" ? decodeURIComponent(name) : "";
  const dispatch = useDispatch<AppDispatch>();

  // Get material state from Redux
  const { materials, query, total, isLoading, error } = useSelector(
    (state: RootState) => state.material
  );

  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialInterface | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal disclosure
  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();

  // Fetch material types
  const fetchMaterialTypes = async () => {
    try {
      const typesResponse = await materialTypeService.getAllMaterialTypes();
      setMaterialTypes(typesResponse.data || []);
    } catch (err) {
      console.error("Failed to load material types:", err);
    }
  };

  // Set course ID in Redux when it changes
  useEffect(() => {
    if (courseId && typeof courseId === "string") {
      dispatch(setCourseId(courseId));
    }
  }, [courseId, dispatch]);

  // Fetch materials when query parameters change
  useEffect(() => {
    if (courseId && typeof courseId === "string") {
      dispatch(fetchMaterials({ courseId, query }));
    }
  }, [courseId, query, dispatch]);

  // Fetch material types on component mount
  useEffect(() => {
    fetchMaterialTypes();
  }, []);

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

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    onOpenModal();
  };

  const handleEditMaterial = (material: MaterialInterface) => {
    setSelectedMaterial(material);
    onOpenModal();
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!courseId) return;

    // Validate materialId exists
    if (!materialId) {
      console.error("Material ID is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await materialService.deleteMaterial(courseId as string, materialId);
      // Refresh materials after deletion
      dispatch(fetchMaterials({ courseId: courseId as string, query }));
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  const handleMaterialSubmit = async (
    data: MaterialCreateDto | MaterialUpdateDto | FormData,
    isFormData: boolean
  ) => {
    if (!courseId) return;

    try {
      setIsSubmitting(true);

      if (selectedMaterial) {
        // Update existing material
        if (isFormData) {
          const formData = data as FormData;

          await materialService.updateMaterialWithFile(
            courseId as string,
            selectedMaterial.materialId,
            formData.get("Name") as string,
            formData.get("File") as File,
            formData.get("MaterialTypeId") as string
          );
        } else {
          await materialService.updateMaterial(
            courseId as string,
            selectedMaterial.materialId,
            data as MaterialUpdateDto
          );
        }
      } else {
        // Create new material
        if (isFormData) {
          const formData = data as FormData;

          await materialService.createMaterialWithFile(
            courseId as string,
            formData.get("Name") as string,
            formData.get("File") as File,
            formData.get("MaterialTypeId") as string
          );
        } else {
          await materialService.createMaterial(
            courseId as string,
            data as MaterialCreateDto
          );
        }
      }

      onModalOpenChange();
      // Refresh materials after creation/update
      dispatch(fetchMaterials({ courseId: courseId as string, query }));
    } catch (err) {
      console.error("Failed to save material:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCourses = () => {
    router.push("/a/academic/courses");
  };

  // Get the currently selected material type object
  const selectedMaterialType = query.materialTypeId
    ? materialTypes.find((type) => type.id === query.materialTypeId)
    : null;

  if (isLoading && materials.length === 0) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
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
            variant="light"
            className="mr-2"
            onPress={handleBackToCourses}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{courseName} - Materials</h1>
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
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            variant="solid"
            onPress={handleAddMaterial}
          >
            Add Material
          </Button>
        </div>

        <Tabs
          aria-label="Material Types"
          selectedKey={query.materialTypeId || "all"}
          onSelectionChange={(key) => handleTabChange(key as string)}
          className="mb-6"
        >
          <Tab key="all" title="All Materials" />
          {materialTypes.map((type) => (
            <Tab key={type.id} title={type.name} />
          ))}
        </Tabs>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
                    key={material.materialId}
                    material={material}
                    materialType={materialType}
                    onEdit={handleEditMaterial}
                    onDelete={handleDeleteMaterial}
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
              total={Math.ceil(total / (query.itemsPerpage || 10))}
              page={query.pageNumber || 1}
              onChange={handlePageChange}
            />
          </div>
        )}

        {/* Material Modal */}
        <MaterialModal
          isOpen={isModalOpen}
          onOpenChange={onModalOpenChange}
          onSubmit={handleMaterialSubmit}
          materialTypes={materialTypes}
          courseId={courseId as string}
          isSubmitting={isSubmitting}
          mode={selectedMaterial ? "edit" : "create"}
          initialData={selectedMaterial || undefined}
        />
      </div>
    </DefaultLayout>
  );
}
