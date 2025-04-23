import { useForm } from "react-hook-form";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";

import { Major } from "@/services/major/major.schema";
import { Course } from "@/services/course/course.schema";

interface CourseModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  majors: Major[];
  onSubmit: (data: any) => Promise<void>;
  course?: Course | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

export function CourseModal({
  isOpen,
  onOpenChange,
  majors,
  onSubmit,
  course,
  isSubmitting,
  mode,
}: CourseModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues:
      mode === "create"
        ? {
            code: "",
            name: "",
            description: "",
            price: 0,
            credit: 0,
            minCreditCanApply: 0,
            majorId: "",
            isOpening: true,
            isHavePracticeClass: false,
            isUseForCalculateScore: true,
          }
        : {
            name: course?.name || "",
            description: course?.description || "",
            price: course?.price || 0,
            majorId: course?.majorId || "",
            isActive: course?.isOpening || true,
          },
  });

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    reset();
  };

  const title = mode === "create" ? "Add New Course" : "Edit Course";
  const submitButtonText =
    mode === "create" ? "Create Course" : "Update Course";
  const loadingText = mode === "create" ? "Creating..." : "Updating...";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <form
                className="space-y-4"
                id="course-form"
                onSubmit={handleSubmit(handleFormSubmit)}
              >
                {mode === "create" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="code"
                      >
                        Code
                      </label>
                      <Input
                        id="code"
                        {...register("code", { required: "Code is required" })}
                        errorMessage={errors.code?.message}
                        placeholder="Enter course code"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        errorMessage={errors.name?.message}
                        placeholder="Enter course name"
                      />
                    </div>
                  </div>
                )}

                {mode === "update" && (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      errorMessage={errors.name?.message}
                      placeholder="Enter course name"
                    />
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Input
                    id="description"
                    {...register("description")}
                    errorMessage={errors.description?.message}
                    placeholder="Enter course description"
                  />
                </div>

                {mode === "create" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="price"
                      >
                        Price
                      </label>
                      <Input
                        id="price"
                        type="number"
                        {...register("price", {
                          min: { value: 0, message: "Price must be positive" },
                        })}
                        errorMessage={errors.price?.message}
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="credit"
                      >
                        Credit
                      </label>
                      <Input
                        id="credit"
                        type="number"
                        {...register("credit", {
                          min: { value: 0, message: "Credit must be positive" },
                        })}
                        errorMessage={errors.credit?.message}
                        placeholder="Enter credits"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="price"
                    >
                      Price
                    </label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", {
                        min: { value: 0, message: "Price must be positive" },
                      })}
                      errorMessage={errors.price?.message}
                      placeholder="Enter price"
                    />
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="major"
                  >
                    Major
                  </label>
                  <Select
                    className="w-full"
                    id="major"
                    items={majors}
                    placeholder="Select a major"
                    selectionMode="single"
                    {...register("majorId")}
                  >
                    {majors.map((major) => (
                      <SelectItem key={major.id} id={major.id}>
                        {`${major.name} (${major.code})`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {mode === "create" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor="minCreditCanApply"
                        >
                          Min Credits to Apply
                        </label>
                        <Input
                          id="minCreditCanApply"
                          type="number"
                          {...register("minCreditCanApply")}
                          errorMessage={errors.minCreditCanApply?.message}
                          placeholder="Enter minimum credits"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Checkbox {...register("isOpening")}>Is Opening</Checkbox>
                      <Checkbox {...register("isHavePracticeClass")}>
                        Has Practice Class
                      </Checkbox>
                      <Checkbox {...register("isUseForCalculateScore")}>
                        Use for Score Calculation
                      </Checkbox>
                    </div>
                  </>
                )}

                {mode === "update" && (
                  <div className="space-y-2">
                    <Checkbox {...register("isActive")}>Is Active</Checkbox>
                  </div>
                )}
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                form="course-form"
                type="submit"
              >
                {isSubmitting ? loadingText : submitButtonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
