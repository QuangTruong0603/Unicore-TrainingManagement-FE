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
  mode: "create"; // Only create mode is supported
}

export function TrainingRoadmapModal({
  isOpen,
  onOpenChange,
  majors,
  batches,
  onSubmit,
  isSubmitting,
  mode,
}: TrainingRoadmapModalProps) {
  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-semibold">Create Training Roadmap</h2>
            </ModalHeader>

            <ModalBody>
              <TrainingRoadmapForm
                batches={batches}
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
                {isSubmitting ? "Creating..." : "Create Roadmap"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
