import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

import {
  studentImportSchema,
  StudentImport,
} from "@/services/student/student.schema";
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";
interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, batchId: string, majorId: string) => Promise<void>;
  majors: Major[];
  batches: Batch[];
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  majors,
  batches,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
    watch,
  } = useForm<StudentImport>({
    resolver: zodResolver(studentImportSchema),
    defaultValues: {
      file: undefined,
      batchId: "",
      majorId: "",
    },
    mode: "onChange",
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileList = watch("file");
  const file = fileList && fileList.length > 0 ? fileList[0] : null;

  // Simulate upload progress
  const simulateUpload = async (
    file: File,
    batchId: string,
    majorId: string
  ) => {
    setUploadProgress(0);
    // Simulate progress
    for (let i = 1; i <= 100; i += 10) {
      await new Promise((res) => setTimeout(res, 40));
      setUploadProgress(i);
    }
    await onSubmit(file, batchId, majorId);
    setUploadProgress(null);
    reset();
  };

  const handleFormSubmit = async (data: StudentImport) => {
    if (data.file?.[0] && data.batchId && data.majorId) {
      await simulateUpload(data.file[0], data.batchId, data.majorId);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValue("file", e.dataTransfer.files as any, { shouldValidate: true });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClickDropArea = () => {
    fileInputRef.current?.click();
  };

  const isFormValid = isValid && isDirty && !isSubmitting && !!file;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>Import Students from Excel</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="excel-file"
                >
                  Excel File
                </label>
                <div
                  className={`w-full p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
                  `}
                  role="button"
                  tabIndex={0}
                  onClick={handleClickDropArea}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-center text-gray-500">
                    {file
                      ? "File selected: " + file.name
                      : "Drag & drop file here or click to select"}
                  </div>
                  <input
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    type="file"
                    onChange={(e) => {
                      setValue("file", e.target.files as any, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
                {errors.file && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.file.message}
                  </p>
                )}
                {file && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    {file.name}
                  </div>
                )}
                {uploadProgress !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="batch-label"
                >
                  Batch
                </label>
                <Controller
                  control={control}
                  name="batchId"
                  render={({ field }) => (
                    <Autocomplete
                      allowsCustomValue={false}
                      className="w-full"
                      defaultItems={batches}
                      defaultSelectedKey={field.value}
                      placeholder="Search and select a batch"
                      onSelectionChange={(key) =>
                        field.onChange(key?.toString() || "")
                      }
                    >
                      {(batch) => (
                        <AutocompleteItem
                          key={batch.id}
                          textValue={`${batch.title} - ${batch.startYear}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {batch.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {batch.startYear}
                            </span>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                />
                {errors.batchId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.batchId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="major-label"
                >
                  Major
                </label>
                <Controller
                  control={control}
                  name="majorId"
                  render={({ field }) => (
                    <Autocomplete
                      allowsCustomValue={false}
                      className="w-full"
                      defaultItems={majors}
                      defaultSelectedKey={field.value}
                      placeholder="Search and select a major"
                      onSelectionChange={(key) =>
                        field.onChange(key?.toString() || "")
                      }
                    >
                      {(major) => (
                        <AutocompleteItem
                          key={major.id}
                          textValue={`${major.name} - ${major.code}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {major.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {major.code}
                            </span>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                />
                {errors.majorId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.majorId.message}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!isFormValid}
              isLoading={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Importing..." : "Import"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
