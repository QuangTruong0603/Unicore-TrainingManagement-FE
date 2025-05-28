import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus, Search, ArrowLeft, Edit, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Pagination,
  Spinner,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  useDisclosure,
} from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { Material } from "@/services/material/material.schema";
import { materialService } from "@/services/material/material.service";
import { MaterialType } from "@/services/material-type/material-type.schema";
import { materialTypeService } from "@/services/material-type/material-type.service";
import {
  Material as MaterialInterface,
  MaterialCreateDto,
  MaterialUpdateDto,
} from "@/services/material/material.schema";
import { MaterialModal } from "@/components/a/material/material-modal";

interface MaterialTypeWithMaterials extends MaterialType {
  materials: MaterialInterface[];
}

export default function CourseMaterialsPage() {
  const router = useRouter();
  const { courseId, name } = router.query;
  const courseName = typeof name === "string" ? decodeURIComponent(name) : "";

  const [materialTypes, setMaterialTypes] = useState<
    MaterialTypeWithMaterials[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialInterface | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add states for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal disclosure
  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();

  const fetchData = async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all material types
      const typesResponse = await materialTypeService.getAllMaterialTypes();
      const types = typesResponse.data || [];

      // Fetch all materials for this course
      const materialsResponse = await materialService.getAllMaterials(
        courseId as string
      );
      const materials = materialsResponse.data || [];

      // Group materials by type
      const typesWithMaterials = types.map((type) => {
        const typeMaterials = materials.filter(
          (material) => material.materialTypeId === type.id
        );

        return {
          ...type,
          materials: typeMaterials,
        };
      });

      setMaterialTypes(typesWithMaterials);
      setTotal(materials.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Filter materials based on search term
  const filteredMaterialTypes = materialTypes.map((type) => {
    const filteredMaterials = type.materials.filter((material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      ...type,
      materials: filteredMaterials,
    };
  });

  // Filter by selected tab
  const displayedMaterialTypes =
    selectedTab === "all"
      ? filteredMaterialTypes
      : filteredMaterialTypes.filter((type) => type.id === selectedTab);

  // Get all materials for pagination when viewing "All" tab
  const allMaterials =
    selectedTab === "all"
      ? filteredMaterialTypes.flatMap((type) => type.materials)
      : displayedMaterialTypes[0]?.materials || [];

  // Calculate pagination
  const totalPages = Math.ceil(allMaterials.length / itemsPerPage);
  const paginatedMaterials = allMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await materialService.deleteMaterial(courseId as string, materialId);
      fetchData(); // Refresh the data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete material"
      );
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
          // Make sure File is handled properly
          await materialService.updateMaterialWithFile(
            courseId as string,
            selectedMaterial.id,
            formData.get("Name") as string,
            formData.get("File") as File,
            formData.get("MaterialTypeId") as string
          );
        } else {
          await materialService.updateMaterial(
            courseId as string,
            selectedMaterial.id,
            data as MaterialUpdateDto
          );
        }
      } else {
        // Create new material
        if (isFormData) {
          const formData = data as FormData;
          // Make sure File is handled properly
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
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCourses = () => {
    router.push("/a/academic/courses");
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex flex-col justify-center items-center h-96">
          <p className="text-red-500 mb-4">{error}</p>
          <Button color="primary" onPress={handleBackToCourses}>
            Back to Courses
          </Button>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          selectedKey={selectedTab}
          onSelectionChange={(key) => {
            setSelectedTab(key as string);
            setCurrentPage(1);
          }}
          className="mb-6"
        >
          <Tab key="all" title="All Materials" />
          {materialTypes.map((type) => (
            <Tab key={type.id} title={type.name} />
          ))}
        </Tabs>

        <div className="bg-white rounded-lg shadow p-4">
          {paginatedMaterials.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No materials found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedMaterials.map((material) => {
                const materialType = materialTypes.find(
                  (type) => type.id === material.materialTypeId
                );

                return (
                  <Card key={material.id} className="shadow-sm">
                    <CardHeader className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{material.name}</h3>
                        <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full">
                          {materialType?.name || "Unknown Type"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      {material.fileUrl && (
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View File
                        </a>
                      )}
                    </CardBody>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="warning"
                        onPress={() => handleEditMaterial(material)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
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
