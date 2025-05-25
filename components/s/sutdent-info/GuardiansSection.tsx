import React, { useState } from "react";
import { Users, Edit, Plus, X } from "lucide-react";
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
  Badge,
} from "@heroui/react";

import { Guardian } from "./types";
import { GuardianCard } from "./GuardianCard";

interface GuardiansSectionProps {
  guardians: Guardian[];
  onUpdate?: (guardians: Guardian[]) => Promise<void>;
}

export const GuardiansSection = ({
  guardians,
  onUpdate,
}: GuardiansSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editGuardians, setEditGuardians] = useState<Guardian[]>([
    ...guardians,
  ]);
  const [currentGuardian, setCurrentGuardian] = useState<
    Omit<Guardian, "id"> & { id?: string }
  >({
    name: "",
    phoneNumber: "",
    relationship: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddGuardian = () => {
    // For new guardians, we don't include an ID (backend will generate it)
    const newGuardian: Guardian = {
      ...(currentGuardian as Omit<Guardian, "id">),
      // Add a temporary ID for React's key prop, will be ignored on save
      id: `temp-${Date.now()}`,
    };

    setEditGuardians([...editGuardians, newGuardian]);
    setCurrentGuardian({
      name: "",
      phoneNumber: "",
      relationship: "",
    });
  };

  const handleEditGuardian = (index: number) => {
    setCurrentGuardian(editGuardians[index]);
    setEditIndex(index);
  };

  const handleUpdateGuardian = () => {
    if (editIndex !== null) {
      const updatedGuardians = [...editGuardians];

      updatedGuardians[editIndex] = {
        // Preserve the original ID if it exists
        id: editGuardians[editIndex].id,
        name: currentGuardian.name,
        phoneNumber: currentGuardian.phoneNumber,
        relationship: currentGuardian.relationship,
      };
      setEditGuardians(updatedGuardians);
      setCurrentGuardian({
        name: "",
        phoneNumber: "",
        relationship: "",
      });
      setEditIndex(null);
    }
  };

  const handleDeleteGuardian = (index: number) => {
    const updatedGuardians = [...editGuardians];

    updatedGuardians.splice(index, 1);
    setEditGuardians(updatedGuardians);

    if (editIndex === index) {
      setCurrentGuardian({
        name: "",
        phoneNumber: "",
        relationship: "",
      });
      setEditIndex(null);
    }
  };

  const handleSave = async () => {
    if (onUpdate) {
      setIsLoading(true);
      try {
        // Process guardians before sending to parent
        // For new guardians (with temp IDs), remove the ID field
        const processedGuardians = editGuardians.map((guardian) => {
          if (guardian.id.startsWith("temp-")) {
            // Destructure to remove id from new guardians
            const { id, ...guardianWithoutId } = guardian;

            return guardianWithoutId as Guardian;
          }

          return guardian;
        });

        await onUpdate(processedGuardians as Guardian[]);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating guardians:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowModal(false);
    }
  };

  const handleInputChange = (
    field: keyof Omit<Guardian, "id">,
    value: string
  ) => {
    setCurrentGuardian((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Card className="overflow-visible" radius="sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-purple-700">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Guardians</h2>
          </div>
          <Button
            isIconOnly
            className="p-1 min-w-0 h-auto"
            color="primary"
            title="Edit guardians"
            variant="ghost"
            onClick={() => setShowModal(true)}
          >
            <Edit size={16} />
          </Button>
        </CardHeader>

        <CardBody className="overflow-visible">
          <div className="space-y-4">
            {guardians.map((guardian) => (
              <GuardianCard key={guardian.id} guardian={guardian} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Guardians Edit Modal */}
      <Modal
        isOpen={showModal}
        size="2xl"
        onClose={() => !isLoading && setShowModal(false)}
      >
        <ModalContent>
          <ModalHeader>Manage Guardians</ModalHeader>
          <ModalBody className="">
            <Card className="mb-6 bg-gray-50">
              <CardHeader>
                <h4 className="text-sm font-semibold">
                  {editIndex !== null ? "Edit Guardian" : "Add New Guardian"}
                </h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="mb-4 overflow-visible">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="guardianName"
                    >
                      Name
                    </label>
                    <Input
                      id="guardianName"
                      placeholder="Enter guardian name"
                      value={currentGuardian.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="guardianPhone"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="guardianPhone"
                      placeholder="Enter phone number"
                      value={currentGuardian.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="guardianRelationship"
                  >
                    Relationship
                  </label>
                  <Input
                    id="guardianRelationship"
                    placeholder="Enter relationship (e.g. Parent, Sibling)"
                    value={currentGuardian.relationship}
                    onChange={(e) =>
                      handleInputChange("relationship", e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-end">
                  {editIndex !== null ? (
                    <Button
                      color="primary"
                      disabled={
                        !currentGuardian.name ||
                        !currentGuardian.phoneNumber ||
                        !currentGuardian.relationship
                      }
                      onClick={handleUpdateGuardian}
                    >
                      Update Guardian
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      disabled={
                        !currentGuardian.name ||
                        !currentGuardian.phoneNumber ||
                        !currentGuardian.relationship
                      }
                      startContent={<Plus size={14} />}
                      onClick={handleAddGuardian}
                    >
                      Add Guardian
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>

            <h4 className="text-sm font-semibold mb-3">Current Guardians</h4>

            {editGuardians.length > 0 ? (
              <div className="space-y-2 max-h-[28vh] overflow-y-auto">
                {editGuardians.map((guardian, index) => (
                  <Card key={guardian.id} className="p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{guardian.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-xs"
                            color="primary"
                            variant="flat"
                          >
                            {guardian.relationship}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {guardian.phoneNumber}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          color="primary"
                          size="sm"
                          title="Edit guardian"
                          variant="ghost"
                          onClick={() => handleEditGuardian(index)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          title="Remove guardian"
                          variant="ghost"
                          onClick={() => handleDeleteGuardian(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No guardians added yet
              </p>
            )}
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
