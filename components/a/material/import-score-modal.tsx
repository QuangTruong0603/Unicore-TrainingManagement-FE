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

interface ImportScoreModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (file: File) => void;
  isSubmitting?: boolean;
}

export const ImportScoreModal: React.FC<ImportScoreModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
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
            errorMessage={fileError}
            label="Upload Excel File"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <p className="text-sm text-green-600 mt-1">
              Selected file: {selectedFile.name}
            </p>
          )}
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
            Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 