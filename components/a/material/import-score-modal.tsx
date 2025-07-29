import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { Download } from "lucide-react";

interface ImportScoreModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (file: File) => void;
  isSubmitting?: boolean;
  onExportTemplate?: () => void;
}

export const ImportScoreModal: React.FC<ImportScoreModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  onExportTemplate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setFileError("");
    }
  };

  const handleSubmit = () => {
    setFileError("");
    if (!selectedFile) {
      setFileError("File is required");

      return;
    }
    onSubmit(selectedFile);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Import Scores</ModalHeader>
        <ModalBody>
          <Input
            isRequired
            accept=".xlsx,.xls,.csv"
            errorMessage={fileError}
            label="Upload Excel File"
            type="file"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <p className="text-sm text-green-600 mt-1">
              Selected file: {selectedFile.name}
            </p>
          )}
          {!selectedFile && onExportTemplate && (
            <div className="text-xs text-gray-400 mt-2">
              Need a template? Click &quot;Export Template&quot; below to
              download a sample file.
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <div>
              {onExportTemplate && (
                <Button
                  color="secondary"
                  size="sm"
                  startContent={<Download className="w-4 h-4" />}
                  variant="bordered"
                  onPress={onExportTemplate}
                >
                  Export Template
                </Button>
              )}
            </div>
            <div className="flex gap-2">
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
                Import
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
