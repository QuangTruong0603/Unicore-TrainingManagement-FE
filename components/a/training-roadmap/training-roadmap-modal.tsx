import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import {
  TrainingRoadmapForm,
  TrainingRoadmapFormData,
} from "./training-roadmap-form";

import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";

interface TrainingRoadmapModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  majors: Major[];
  batches: Batch[];
  onSubmit: (data: TrainingRoadmapFormData) => void;
  isSubmitting: boolean;
  mode: "create" | "update";
  initialData?: TrainingRoadmapFormData;
}

export function TrainingRoadmapModal({
  isOpen,
  onOpenChange,
  majors,
  batches,
  onSubmit,
  isSubmitting,
  mode,
  initialData,
}: TrainingRoadmapModalProps) {
  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-semibold">
                {mode === "create" ? "Create Training Roadmap" : "Update Training Roadmap"}
              </h2>
            </ModalHeader>

            <ModalBody>
              <TrainingRoadmapForm
                batches={batches}
                initialData={initialData}
                isSubmitting={isSubmitting}
                majors={majors}
                mode={mode}
                onSubmit={onSubmit}
              />
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                form="roadmap-form"
                type="submit"
              >
                {isSubmitting 
                  ? (mode === "create" ? "Creating..." : "Updating...") 
                  : (mode === "create" ? "Create Roadmap" : "Update Roadmap")
                }
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
