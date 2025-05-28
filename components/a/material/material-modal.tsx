import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { MaterialType } from "@/services/material-type/material-type.schema";
import { MaterialCreateDto, MaterialUpdateDto, Material } from "@/services/material/material.schema";

interface MaterialModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: MaterialCreateDto | MaterialUpdateDto | FormData, isFormData: boolean, materialId?: string) => Promise<void>;
  materialTypes: MaterialType[];
  courseId: string;
  isSubmitting: boolean;
  mode: "create" | "edit";
  initialData?: {
    materialId?: string;
    name: string;
    materialTypeId: string;
    fileUrl?: string;
  };
}

interface MaterialCardProps {
  material: Material;
  materialType?: MaterialType;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  materialType,
  onEdit,
  onDelete,
}) => {
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
          onPress={() => onEdit(material)}
        >
          <Edit size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="danger"
          onPress={() => onDelete(material.id)}
        >
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  materialTypes,
  courseId,
  isSubmitting,
  mode,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState("");
  const [nameError, setNameError] = useState("");
  const [materialTypeError, setMaterialTypeError] = useState("");
  const [fileError, setFileError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setMaterialTypeId(initialData.materialTypeId || "");
      setSelectedFile(null);
    } else {
      // Reset form when opening in create mode
      setName("");
      setMaterialTypeId("");
      setSelectedFile(null);
    }
    
    // Reset errors
    setNameError("");
    setMaterialTypeError("");
    setFileError("");
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    // Reset errors
    setNameError("");
    setMaterialTypeError("");
    setFileError("");
    
    // Validate
    let hasError = false;
    
    if (!name.trim()) {
      setNameError("Material name is required");
      hasError = true;
    }
    
    if (!materialTypeId) {
      setMaterialTypeError("Material type is required");
      hasError = true;
    }
    
    if (mode === "create" && !selectedFile) {
      setFileError("File is required");
      hasError = true;
    }
    
    if (hasError) return;
    
    // Always use FormData for consistency
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('MaterialTypeId', materialTypeId);
    
    if (selectedFile) {
      // Make sure the file is correctly appended with its filename
      formData.append('File', selectedFile, selectedFile.name);
    }
    console.log(initialData);
    if (mode === "edit" && initialData?.materialId) {
      console.log(initialData.materialId);
      // Pass materialId as a separate parameter
      await onSubmit(formData, true, initialData.materialId);
    } else {
      // Submit with FormData only for create
      await onSubmit(formData, true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileError("");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          {mode === "create" ? "Add New Material" : "Edit Material"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Input
                label="Material Name"
                placeholder="Enter material name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                errorMessage={nameError}
                isRequired
              />
            </div>
            
            <div>
              <Select
                label="Material Type"
                placeholder="Select material type"
                selectedKeys={materialTypeId ? [materialTypeId] : []}
                onChange={(e) => setMaterialTypeId(e.target.value)}
                errorMessage={materialTypeError}
                isRequired
              >
                {materialTypes.map((type) => (
                  <SelectItem key={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <Input
                type="file"
                label="Upload File"
                onChange={handleFileChange}
                errorMessage={fileError}
                isRequired={mode === "create"}
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected file: {selectedFile.name}
                </p>
              )}
              {initialData?.fileUrl && !selectedFile && mode === "edit" && (
                <p className="text-sm text-blue-600 mt-1">
                  Current file: <a href={initialData.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="flat"
            onPress={onOpenChange}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {mode === "create" ? "Add Material" : "Save Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 