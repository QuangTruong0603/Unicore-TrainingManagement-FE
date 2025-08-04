/* eslint-disable jsx-a11y/click-events-have-key-events */
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
import { Download } from "lucide-react";

import {
  studentImportSchema,
  StudentImport,
} from "@/services/student/student.schema";
import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";
import { batchService } from "@/services/batch/batch.service";
interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, batchId: string, majorId: string) => Promise<void>;
  majors: Major[];
  batches: Batch[];
  onBatchCreated?: (newBatch: Batch) => void;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  majors,
  batches,
  isOpen,
  onClose,
  onSubmit,
  onBatchCreated,
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
  const [isCreatingNewBatch, setIsCreatingNewBatch] = useState(false);
  const [newBatchTitle, setNewBatchTitle] = useState("");
  const [newBatchStartYear, setNewBatchStartYear] = useState("");
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileList = watch("file");
  const file = fileList && fileList.length > 0 ? fileList[0] : null;

  const handleExportTemplate = () => {
    // Create template data based on actual Excel format
    const templateData = [
      [
        "Order",
        "PrivateEmail",
        "FirstName",
        "LastName",
        "PersonId",
        "Dob",
        "PhoneNumber",
      ],
      [
        "1",
        "tranhuuquangtruong2003@gmail.com",
        "Trần",
        "A",
        "950",
        "3-Feb",
        "1023456791",
      ],
      [
        "2",
        "tranhuuquangtruong2003@gmail.com",
        "Nguyễn",
        "B",
        "951",
        "4-Feb",
        "1023456792",
      ],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
    ];

    // Create CSV content with semicolon separator and proper escaping
    const csvContent = templateData
      .map((row) =>
        row
          .map((cell) => {
            if (
              typeof cell === "string" &&
              (cell.includes(";") || cell.includes('"') || cell.includes("\n"))
            ) {
              // Escape quotes by doubling them
              return `"${cell.replace(/\"/g, '""')}"`;
            }

            return cell;
          })
          .join(";")
      )
      .join("\n");

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleCreateNewBatch = async () => {
    if (!newBatchTitle.trim() || !newBatchStartYear.trim()) {
      return;
    }

    const startYear = parseInt(newBatchStartYear);

    if (isNaN(startYear) || startYear < 1900 || startYear > 2100) {
      return;
    }

    try {
      setIsCreatingBatch(true);
      const response = await batchService.createBatch({
        title: newBatchTitle.trim(),
        startYear: startYear,
      });

      if (response.success && response.data) {
        // Set the newly created batch as selected
        setValue("batchId", response.data.id, { shouldValidate: true });

        // Call the callback to update the parent component's batch list
        if (onBatchCreated) {
          onBatchCreated(response.data);
        }

        // Reset new batch form and exit creation mode
        setNewBatchTitle("");
        setNewBatchStartYear("");
        setIsCreatingNewBatch(false);
      }
    } catch (error) {
      console.error("Error creating batch:", error);
    } finally {
      setIsCreatingBatch(false);
    }
  };

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

  // Reset form and states when modal is closed
  const handleModalClose = () => {
    reset();
    setNewBatchTitle("");
    setNewBatchStartYear("");
    setIsCreatingNewBatch(false);
    setUploadProgress(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
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
                  <div className="text-center">
                    <div className="text-gray-500">
                      {file
                        ? "File selected: " + file.name
                        : "Drag & drop file here or click to select"}
                    </div>
                    {!file && (
                      <div className="text-xs text-gray-400 mt-2">
                        Need a template? Click &quot;Export Template&quot; above
                        to download a sample file.
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
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

                {!isCreatingNewBatch ? (
                  <div className="space-y-2">
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
                    <Button
                      color="primary"
                      size="sm"
                      variant="light"
                      onPress={() => setIsCreatingNewBatch(true)}
                    >
                      + Create New Batch
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Create New Batch</h4>
                      <Button
                        color="default"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setIsCreatingNewBatch(false);
                          setNewBatchTitle("");
                          setNewBatchStartYear("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div>
                      <label
                        className="block text-xs font-medium text-gray-600 mb-1"
                        htmlFor="batch-title"
                      >
                        Batch Title
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="batch-title"
                        placeholder="Enter batch title (e.g., K19, K20)"
                        type="text"
                        value={newBatchTitle}
                        onChange={(e) => setNewBatchTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs font-medium text-gray-600 mb-1"
                        htmlFor="batch-start-year"
                      >
                        Start Year
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="batch-start-year"
                        max="2100"
                        min="1900"
                        placeholder="Enter start year (e.g., 2024)"
                        type="number"
                        value={newBatchStartYear}
                        onChange={(e) => setNewBatchStartYear(e.target.value)}
                      />
                    </div>

                    <Button
                      color="primary"
                      isDisabled={
                        !newBatchTitle.trim() ||
                        !newBatchStartYear.trim() ||
                        isNaN(parseInt(newBatchStartYear)) ||
                        parseInt(newBatchStartYear) < 1900 ||
                        parseInt(newBatchStartYear) > 2100
                      }
                      isLoading={isCreatingBatch}
                      size="sm"
                      onPress={handleCreateNewBatch}
                    >
                      {isCreatingBatch ? "Creating..." : "Create Batch"}
                    </Button>
                  </div>
                )}

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
            <div className="flex justify-between items-center w-full">
              <Button
                color="secondary"
                size="sm"
                startContent={<Download className="w-4 h-4" />}
                variant="bordered"
                onPress={handleExportTemplate}
              >
                Export Template
              </Button>
              <div className="flex gap-2">
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleModalClose}
                >
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
              </div>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
