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
} from "@heroui/react";

import { MaterialType } from "@/services/material-type/material-type.schema";
import {
  MaterialCreateDto,
  MaterialUpdateDto,
} from "@/services/material/material.schema";

interface MaterialModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (
    data: MaterialCreateDto | MaterialUpdateDto | FormData,
    isFormData: boolean,
    materialId?: string
  ) => Promise<void>;
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

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  materialTypes,
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

    formData.append("Name", name);
    formData.append("MaterialTypeId", materialTypeId);

    if (selectedFile) {
      formData.append("File", selectedFile, selectedFile.name);
    }
    if (mode === "edit" && initialData?.materialId) {
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
                isRequired
                errorMessage={nameError}
                label="Material Name"
                placeholder="Enter material name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Select
                isRequired
                errorMessage={materialTypeError}
                label="Material Type"
                placeholder="Select material type"
                selectedKeys={materialTypeId ? [materialTypeId] : []}
                onChange={(e) => setMaterialTypeId(e.target.value)}
              >
                {materialTypes.map((type) => (
                  <SelectItem key={type.id}>{type.name}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Input
                errorMessage={fileError}
                isRequired={mode === "create"}
                label="Upload File"
                type="file"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected file: {selectedFile.name}
                </p>
              )}
              {initialData?.fileUrl && !selectedFile && mode === "edit" && (
                <p className="text-sm text-blue-600 mt-1">
                  Current file:{" "}
                  <a
                    className="underline"
                    href={initialData.fileUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View
                  </a>
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            isDisabled={isSubmitting}
            variant="flat"
            onPress={onOpenChange}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            {mode === "create" ? "Add Material" : "Save Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
