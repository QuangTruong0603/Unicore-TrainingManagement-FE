import React, { useState } from "react";
import { Edit } from "lucide-react";
import {
  Avatar,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

import { StudentProfile } from "./types";

interface ProfileHeaderProps {
  profile: StudentProfile;
  onUpdate?: (imageUrl: string) => void;
}

export const ProfileHeader = ({ profile, onUpdate }: ProfileHeaderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(profile.imageUrl);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(imageUrl);
    }
    setShowModal(false);
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
              src={profile.imageUrl}
            />
            <Button
              onClick={() => setShowModal(true)}
              className="absolute bottom-0 right-0 p-1 min-w-0 h-auto"
              color="primary"
              size="sm"
              isIconOnly
              title="Edit profile image"
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Update Profile Image</ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL
              </label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            {imageUrl && (
              <div className="mt-4 flex justify-center">
                <Avatar
                  showFallback
                  alt="Preview"
                  className="w-32 h-32 text-xl border-2 border-purple-100"
                  src={imageUrl}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
