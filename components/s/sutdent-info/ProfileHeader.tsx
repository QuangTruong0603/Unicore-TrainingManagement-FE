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
} from "@heroui/react";

import { StudentProfile } from "./types";

interface ProfileHeaderProps {
  profile: StudentProfile;
  onUpdateImage?: (imageFile: File) => void;
}

export const ProfileHeader = ({
  profile,
  onUpdateImage,
}: ProfileHeaderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSave = () => {
    if (imageFile) {
      if (onUpdateImage) {
        onUpdateImage(imageFile);
      }
      setShowModal(false);
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setImageFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar
              showFallback
              className="w-24 h-24 text-xl border-2 border-purple-100"
              name={`${profile.firstName} ${profile.lastName}`}
              src={profile.imageUrl || ""}
            />
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
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Student ID: {profile.studentCode}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Chip
                className="bg-blue-100 text-blue-800 border-none text-xs"
                color="primary"
                variant="flat"
              >
                {profile.majorName}
              </Chip>
              <Chip
                className="bg-green-100 text-green-800 border-none text-xs"
                color="success"
                variant="flat"
              >
                Batch {profile.batchName} ({profile.batchYear})
              </Chip>
            </div>
          </div>
        </div>
      </div>

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
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label
                className="cursor-pointer flex flex-col items-center justify-center"
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
            <Button color="default" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!imageFile}
              onClick={handleSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
