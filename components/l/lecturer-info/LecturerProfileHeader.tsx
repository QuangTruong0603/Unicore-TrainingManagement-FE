import React, { useState, useCallback } from "react";
import { Edit, Upload } from "lucide-react";
import {
  Avatar,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
} from "@heroui/react";

interface LecturerProfileHeaderProps {
  profile: {
    firstName: string;
    lastName: string;
    imageUrl: string;
    status: number;
    workingStatus: number;
    lecturerCode: string;
    departmentName: string;
    email: string;
    phoneNumber: string;
  };
  onUpdateImage?: (imageFile: File) => Promise<void>;
}

export const LecturerProfileHeader: React.FC<LecturerProfileHeaderProps> = ({
  profile,
  onUpdateImage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback((file: File) => {
    setImageFile(file);
    const fileUrl = URL.createObjectURL(file);

    setPreviewUrl(fileUrl);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];

        if (file.type.startsWith("image/")) {
          handleFileChange(file);
        }
      }
    },
    [handleFileChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileChange(e.target.files[0]);
      }
    },
    [handleFileChange]
  );

  const handleSave = async () => {
    if (imageFile && onUpdateImage) {
      setIsLoading(true);
      try {
        await onUpdateImage(imageFile);
        setShowModal(false);
        setImageFile(null);
        setPreviewUrl(null);
      } catch (error) {
        console.error("Error updating profile image:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowModal(false);
    }
  };

  const closeModal = () => {
    if (isLoading) return;
    setShowModal(false);
    setImageFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <>
      <Card
        className="p-6 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-md"
        radius="lg"
      >
        <div className="relative">
          <Avatar
            showFallback
            className="w-24 h-24 text-xl border-2 border-purple-100"
            name={`${profile.firstName} ${profile.lastName}`}
            src={profile.imageUrl || ""}
          />
          {onUpdateImage && (
            <Button
              isIconOnly
              className="absolute bottom-0 right-0 p-1 min-w-0 h-auto"
              color="primary"
              size="sm"
              title="Edit profile image"
              onClick={() => setShowModal(true)}
            >
              <Edit size={14} />
            </Button>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Chip
                color={profile.status === 1 ? "success" : "danger"}
                variant="flat"
              >
                {profile.status === 1 ? "Active" : "Inactive"}
              </Chip>
            </div>
          </div>
          <div>
            <Chip
              className="bg-blue-100 text-blue-800 border-none text-xs"
              color="primary"
              variant="flat"
            >
              <b>Lecturer Code:</b> {profile.lecturerCode}
            </Chip>

            <Chip className="bg-blue-100 text-orange-800 border-none text-xs">
              <b>Department:</b> {profile.departmentName}
            </Chip>
            <Chip className="bg-blue-100 text-purple-800 border-none text-xs">
              <b>Email:</b> {profile.email}
            </Chip>
            <Chip className="bg-blue-100 text-green-800 border-none text-xs">
              <b>Phone:</b> {profile.phoneNumber}
            </Chip>
          </div>
        </div>
      </Card>

      {/* Image Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal}>
        <ModalContent>
          <ModalHeader>Update Profile Image</ModalHeader>
          <ModalBody>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? "border-primary bg-primary-50" : "border-gray-300"
              }`}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                accept="image/*"
                className="hidden"
                disabled={isLoading}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label
                className={`cursor-pointer flex flex-col items-center justify-center ${isLoading ? "opacity-50" : ""}`}
                htmlFor="file-upload"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Drag and drop an image here, or click to select a file
                </p>
                <p className="text-xs text-gray-500">
                  (Only image files are accepted)
                </p>
              </label>
            </div>

            {previewUrl && (
              <div className="mt-4 flex justify-center">
                <Avatar
                  showFallback
                  alt="Preview"
                  className="w-32 h-32 text-xl border-2 border-purple-100"
                  src={previewUrl}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" disabled={isLoading} onClick={closeModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!imageFile || isLoading}
              isLoading={isLoading}
              onClick={handleSave}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
