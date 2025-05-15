import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Button,
} from "@heroui/react";
import { Power, PowerOff } from "lucide-react";
import Image from "next/image";

import styles from "./location-card.module.scss";

import { Location } from "@/services/location/location.schema";

// Sample image for locations without an imageURL
const DEFAULT_IMAGE_URL = "/images/image1.png";

interface LocationCardProps {
  location: Location;
  onActiveToggle?: (location: Location) => void;
  onEdit?: (location: Location) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onActiveToggle,
  onEdit,
}) => {
  const fullAddress = [
    location.addressDetail,
    location.ward,
    location.district,
    location.city,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className={`shadow-md ${styles.locationCard}`}>
      <CardHeader className="flex flex-col items-center p-0">
        <Image
          alt={location.name}
          className="w-full h-48 object-cover rounded-t-lg"
          height={200}
          src={location.imageURL || DEFAULT_IMAGE_URL}
          width={350}
        />
      </CardHeader>
      <CardBody className="px-4 py-3">
        <div className="flex items-start mb-2">
          <Chip
            className="mr-2 mt-1"
            color={location.isActive ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {location.isActive ? "Active" : "Inactive"}
          </Chip>
        </div>
        <h2 className="text-xl font-bold">{location.name}</h2>
        <p className="text-xs text-gray-500 mb-3">{fullAddress}</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Buildings</p>
            <p className="font-semibold">{location.totalBuilding}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Floors</p>
            <p className="font-semibold">{location.totalFloor}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Rooms</p>
            <p className="font-semibold">{location.totalRoom}</p>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-between gap-2 px-4 py-3">
        {onEdit && (
          <Button
            fullWidth
            color="primary"
            size="sm"
            variant="flat"
            onPress={() => onEdit(location)}
          >
            Edit
          </Button>
        )}
        {onActiveToggle && (
          <Button
            fullWidth
            className="flex items-center justify-center gap-1"
            color={location.isActive ? "danger" : "success"}
            size="sm"
            startContent={
              location.isActive ? <PowerOff size={16} /> : <Power size={16} />
            }
            variant="flat"
            onPress={() => onActiveToggle(location)}
          >
            {location.isActive ? "Deactivate" : "Activate"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
