import React from "react";
import { MapPin, Home, Building, Map, Navigation } from "lucide-react";
import { Card, CardHeader, CardBody } from "@heroui/react";

interface AddressSectionProps {
  address: string | null;
}

export const AddressSection: React.FC<AddressSectionProps> = ({ address }) => {
  return (
    <Card className="mb-6 overflow-visible" radius="sm">
      <CardHeader className="flex items-center gap-2 text-purple-700 pb-2">
        <MapPin className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Address Information</h2>
      </CardHeader>
      <CardBody className="overflow-visible">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="text-gray-500 h-4 w-4" />
          <div>
            <p className="text-xs text-gray-500">Full Address</p>
            <p className="text-sm text-gray-800">{address || "N/A"}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}; 