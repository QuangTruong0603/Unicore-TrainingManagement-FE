import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Course } from "@/services/course/course.schema";

interface CourseUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  course: Course | null;
}

export const CourseUpdateModal: React.FC<CourseUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  course,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Course
            </ModalHeader>
            <ModalBody>
              <p>Course ID: {course?.id}</p>
              <p>This modal will be implemented later.</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
