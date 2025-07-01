import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface Lecturer {
  id: string;
  name: string;
}

interface AssignLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturers: Lecturer[];
  onSubmit: (lecturerId: string) => void;
  selectedClassName?: string;
}

export const AssignLecturerModal: React.FC<AssignLecturerModalProps> = ({
  isOpen,
  onClose,
  lecturers,
  onSubmit,
  selectedClassName,
}) => {
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");

  const handleSave = () => {
    if (selectedLecturerId) {
      onSubmit(selectedLecturerId);
      setSelectedLecturerId("");
    }
  };

  const handleClose = () => {
    setSelectedLecturerId("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Chọn giảng viên cho lớp {selectedClassName}</ModalHeader>
        <ModalBody>
          <select
            className="w-full border rounded p-2"
            value={selectedLecturerId}
            onChange={e => setSelectedLecturerId(e.target.value)}
          >
            <option value="">-- Chọn giảng viên --</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>Hủy</Button>
          <Button color="primary" onClick={handleSave} disabled={!selectedLecturerId}>
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 