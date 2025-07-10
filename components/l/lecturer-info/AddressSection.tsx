import React, { useState } from "react";
import { MapPin, Home, Building, Map, Navigation, Edit } from "lucide-react";
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

interface Address {
  id: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
}

interface AddressSectionProps {
  address: Address | null;
  onUpdate?: (address: Address) => Promise<void>;
}

export const AddressSection: React.FC<AddressSectionProps> = ({ address, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(
    address
      ? { ...address }
      : {
          id: "",
          country: "",
          city: "",
          district: "",
          ward: "",
          addressDetail: "",
        }
  );
  const [isLoading, setIsLoading] = useState(false);

  // Create full address string
  const fullAddress = address
    ? [
        address.addressDetail,
        address.ward,
        address.district,
        address.city,
        address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const handleChange = (field: keyof Address, value: string) => {
    setEditAddress((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleSave = async () => {
    if (onUpdate && editAddress) {
      setIsLoading(true);
      try {
        // Chỉ gửi các trường cần thiết, không gửi id
        const { country, city, district, ward, addressDetail } = editAddress;
        const addressToUpdate = { country, city, district, ward, addressDetail };
        await onUpdate(addressToUpdate as any);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating address:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="mb-6 overflow-visible" radius="sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-purple-700">
            <MapPin className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Address Information</h2>
          </div>
          {onUpdate && (
            <Button
              isIconOnly
              className="p-1 min-w-0 h-auto"
              color="primary"
              title="Edit address information"
              variant="ghost"
              onClick={() => {
                setEditAddress(
                  address
                    ? { ...address }
                    : {
                        id: "",
                        country: "",
                        city: "",
                        district: "",
                        ward: "",
                        addressDetail: "",
                      }
                );
                setShowModal(true);
              }}
            >
              <Edit size={16} />
            </Button>
          )}
        </CardHeader>
        <CardBody className="overflow-visible">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="text-gray-500 h-4 w-4" />
            <div>
              <p className="text-xs text-gray-500">Full Address</p>
              <p className="text-sm text-gray-800">{fullAddress || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Map className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm text-gray-800">{address?.country || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="text-sm text-gray-800">{address?.city || "N/A"}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">District</p>
                  <p className="text-sm text-gray-800">{address?.district || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Ward</p>
                  <p className="text-sm text-gray-800">{address?.ward || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Home className="text-gray-500 h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Address Detail</p>
                  <p className="text-sm text-gray-800">{address?.addressDetail || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Address Edit Modal */}
      <Modal
        isOpen={showModal}
        size="lg"
        onClose={() => !isLoading && setShowModal(false)}
      >
        <ModalContent>
          <ModalHeader>Update Address Information</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="country"
                >
                  Country
                </label>
                <Input
                  disabled={isLoading}
                  id="country"
                  placeholder="Enter country"
                  value={editAddress?.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="city"
                >
                  City
                </label>
                <Input
                  disabled={isLoading}
                  id="city"
                  placeholder="Enter city"
                  value={editAddress?.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="district"
                >
                  District
                </label>
                <Input
                  disabled={isLoading}
                  id="district"
                  placeholder="Enter district"
                  value={editAddress?.district || ""}
                  onChange={(e) => handleChange("district", e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="ward"
                >
                  Ward
                </label>
                <Input
                  disabled={isLoading}
                  id="ward"
                  placeholder="Enter ward"
                  value={editAddress?.ward || ""}
                  onChange={(e) => handleChange("ward", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="addressDetail"
              >
                Address Detail
              </label>
              <Input
                disabled={isLoading}
                id="addressDetail"
                placeholder="Enter address details"
                value={editAddress?.addressDetail || ""}
                onChange={(e) => handleChange("addressDetail", e.target.value)}
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