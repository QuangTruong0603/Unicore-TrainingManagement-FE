/**
 * This file is now an export point for the separate create and update location modals
 */
import React from "react";

import { CreateLocationModal } from "./create-location-modal";
import { UpdateLocationModal } from "./update-location-modal";

import { CreateLocationData, UpdateLocationData } from "@/services/location/location.dto";
import { Location } from "@/services/location/location.schema";

// Export both modal components
export { CreateLocationModal } from "./create-location-modal";
export { UpdateLocationModal } from "./update-location-modal";

/**
 * @deprecated Use CreateLocationModal or UpdateLocationModal instead
 */
interface LocationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: CreateLocationData | UpdateLocationData) => Promise<void>;
  location?: Location | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

/**
 * @deprecated Use either CreateLocationModal or UpdateLocationModal directly
 */
export function LocationModal({
  isOpen,
  onOpenChange,
  onSubmit,
  location,
  isSubmitting,
  mode,
}: LocationModalProps) {
  if (mode === "create") {
    return (
      <CreateLocationModal
        isOpen={isOpen}
        isSubmitting={isSubmitting}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    );
  } else {
    return (
      <UpdateLocationModal
        isOpen={isOpen}
        isSubmitting={isSubmitting}
        location={location as Location} // Type assertion since we know it's in update mode
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    );
  }
}
