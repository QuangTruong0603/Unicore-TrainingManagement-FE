import React, { useState } from "react";
import { User, Mail, Phone, Edit } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";

import { StudentProfile } from "./types";

interface PersonalInfoSectionProps {
  profile: StudentProfile;
  onUpdate?: (phoneNumber: string) => Promise<void>;
}

export const PersonalInfoSection = ({
  profile,
  onUpdate,
}: PersonalInfoSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (onUpdate) {
      setIsLoading(true);
      try {
        await onUpdate(phoneNumber);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating phone number:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="overflow-visible mb-6" radius="sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-purple-700">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          <Button
            isIconOnly
            className="p-1 min-w-0 h-auto"
            color="primary"
            title="Edit personal information"
            variant="ghost"
            onClick={() => setShowModal(true)}
          >
            <Edit size={16} />
          </Button>
        </CardHeader>

        <CardBody className="overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm text-gray-800">{profile.phoneNumber}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <User className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Personal ID</p>
                  <p className="text-sm text-gray-800">{profile.personId}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Phone Number Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isLoading && setShowModal(false)}
      >
        <ModalContent>
          <ModalHeader>Update Phone Number</ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="phoneNumber"
              >
                Phone Number
              </label>
              <Input
                disabled={isLoading}
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              disabled={isLoading}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isLoading}
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
