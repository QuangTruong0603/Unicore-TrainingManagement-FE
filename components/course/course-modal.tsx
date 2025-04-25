import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";

import { Major } from "@/services/major/major.schema";
import { Course } from "@/services/course/course.schema";
import {
  CreateCourseData,
  UpdateCourseData,
} from "@/services/course/course.dto";
import { courseService } from "@/services/course/course.service";

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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCourseData | UpdateCourseData>({
    defaultValues:
      mode === "create"
        ? {
            code: "",
            name: "",
            description: "",
            credit: 0,
            minCreditRequired: 0,
            majorId: "",
            isRegistrable: true,
            practicePeriod: 0,
            isRequired: true,
            preCourseIds: [],
            parallelCourseId: [],
            courseCertificates: [],
            courseMaterials: [],
          }
        : {
            code: course?.code || "",
            name: course?.name || "",
            description: course?.description || "",
            credit: course?.credit || 0,
            majorId: course?.majorId || "",
            isRegistrable: course?.isRegistrable || false,
            practicePeriod: course?.practicePeriod || 0,
            isRequired: course?.isRequired || false,
            minCreditRequired: course?.minCreditRequired || 0,
            preCourseIds: course?.preCourseIds || [],
            parallelCourseId: course?.parallelCourseId || [],
          },
  });

  const selectedPreCourseIds = watch("preCourseIds") || [];
  const selectedParallelCourseId = watch("parallelCourseId") || [];

  // Fetch all courses for the dropdowns
  useEffect(() => {
    const fetchAllCourses = async () => {
      if (isOpen) {
        setIsLoadingCourses(true);
        try {
          // Use a larger page size to get most courses in one request
          const response = await courseService.getCourses({
            pageNumber: 1,
            itemsPerpage: 100,
            orderBy: "name",
            isDesc: false,
          });

          setAllCourses(response.data.data);
        } catch (error) {
          console.error("Failed to fetch courses", error);
        } finally {
          setIsLoadingCourses(false);
        }
      }
    };

    fetchAllCourses();
  }, [isOpen]);

  // Reset form when course or mode changes
  useEffect(() => {
    if (mode === "update" && course) {
      reset({
        code: course.code || "",
        name: course.name || "",
        description: course.description || "",
        credit: course.credit || 0,
        majorId: course.majorId || "",
        isRegistrable: course.isRegistrable || false,
        practicePeriod: course.practicePeriod || 0,
        isRequired: course.isRequired || false,
        minCreditRequired: course.minCreditRequired || 0,
        preCourseIds: course.preCourseIds || [],
        parallelCourseId: course.parallelCourseId || [],
      });
    } else if (mode === "create") {
      reset({
        code: "",
        name: "",
        description: "",
        credit: 0,
        minCreditRequired: 0,
        majorId: "",
        isRegistrable: true,
        practicePeriod: 0,
        isRequired: true,
        preCourseIds: [],
        parallelCourseId: [],
        courseCertificates: [],
        courseMaterials: [],
      });
    }
  }, [course, mode, reset]);

  const handleFormSubmit = async (
    data: CreateCourseData | UpdateCourseData
  ) => {
    await onSubmit(data);
    reset();
  };

  const title = mode === "create" ? "Add New Course" : "Edit Course";
  const submitButtonText =
    mode === "create" ? "Create Course" : "Update Course";
  const loadingText = mode === "create" ? "Creating..." : "Updating...";

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
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
                        className="block text-sm font-medium text-gray-700 mb-1"
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
                        className="block text-sm font-medium text-gray-700 mb-1"
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
                      className="block text-sm font-medium text-gray-700 mb-1"
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

                <div className="mb-0">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className="w-full resize-vertical min-h-[100px]"
                    errorMessage={errors.description?.message}
                    placeholder="Enter course description"
                    rows={4}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="majorId"
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
                        id="majorId"
                        placeholder="Search and select a major"
                        onSelectionChange={(key) => field.onChange(key)}
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
                    rules={{ required: "Major is required" }}
                  />
                  {errors.majorId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.majorId.message}
                    </p>
                  )}
                </div>

                {mode === "create" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="minCreditRequired"
                        >
                          Min Credits Required
                        </label>
                        <Input
                          id="minCreditRequired"
                          type="number"
                          {...register("minCreditRequired", {
                            valueAsNumber: true,
                          })}
                          errorMessage={errors.minCreditRequired?.message}
                          placeholder="Enter minimum credits required"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="practicePeriod"
                        >
                          Practice Period
                        </label>
                        <Input
                          id="practicePeriod"
                          type="number"
                          {...register("practicePeriod", {
                            valueAsNumber: true,
                          })}
                          errorMessage={errors.practicePeriod?.message}
                          placeholder="Enter practice periods"
                        />
                      </div>
                    </div>

                    {/* Prerequisites Courses */}
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="preCourseIds"
                      >
                        Prerequisite Courses
                      </label>
                      <Controller
                        control={control}
                        name="preCourseIds"
                        render={({ field }) => (
                          <>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {selectedPreCourseIds.map((courseId) => {
                                const selectedCourse = allCourses.find(
                                  (c) => c.id === courseId
                                );

                                return (
                                  selectedCourse && (
                                    <Chip
                                      key={courseId}
                                      className="bg-primary-100 text-primary-700"
                                      size="sm"
                                      onClose={() => {
                                        setValue(
                                          "preCourseIds",
                                          selectedPreCourseIds.filter(
                                            (id) => id !== courseId
                                          )
                                        );
                                      }}
                                    >
                                      {selectedCourse.code}
                                    </Chip>
                                  )
                                );
                              })}
                            </div>
                            <Autocomplete
                              allowsCustomValue={false}
                              className="w-full"
                              classNames={{
                                base: "w-full",
                                listboxWrapper: "max-h-[400px]",
                              }}
                              defaultItems={allCourses.filter(
                                (c) =>
                                  !selectedPreCourseIds.includes(c.id) &&
                                  c.id !== course?.id
                              )}
                              id="preCourseIds"
                              isLoading={isLoadingCourses}
                              placeholder="Search and select prerequisite courses"
                              onSelectionChange={(key) => {
                                if (
                                  key &&
                                  !selectedPreCourseIds.includes(key.toString())
                                ) {
                                  field.onChange([
                                    ...selectedPreCourseIds,
                                    key.toString(),
                                  ]);
                                }
                              }}
                            >
                              {(course) => (
                                <AutocompleteItem
                                  key={course.id}
                                  textValue={`${course.code} - ${course.name}`}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold">
                                      {course.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {course.code}
                                    </span>
                                  </div>
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          </>
                        )}
                      />
                    </div>

                    {/* Parallel Courses */}
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="parallelCourseId"
                      >
                        Parallel Courses
                      </label>
                      <Controller
                        control={control}
                        name="parallelCourseId"
                        render={({ field }) => (
                          <>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {selectedParallelCourseId.map((courseId) => {
                                const selectedCourse = allCourses.find(
                                  (c) => c.id === courseId
                                );

                                return (
                                  selectedCourse && (
                                    <Chip
                                      key={courseId}
                                      className="bg-primary-100 text-primary-700"
                                      size="sm"
                                      onClose={() => {
                                        setValue(
                                          "parallelCourseId",
                                          selectedParallelCourseId.filter(
                                            (id) => id !== courseId
                                          )
                                        );
                                      }}
                                    >
                                      {selectedCourse.code}
                                    </Chip>
                                  )
                                );
                              })}
                            </div>
                            <Autocomplete
                              allowsCustomValue={false}
                              className="w-full"
                              classNames={{
                                base: "w-full",
                                listboxWrapper: "max-h-[400px]",
                              }}
                              defaultItems={allCourses.filter(
                                (c) =>
                                  !selectedParallelCourseId.includes(c.id) &&
                                  c.id !== course?.id
                              )}
                              id="parallelCourseId"
                              isLoading={isLoadingCourses}
                              placeholder="Search and select parallel courses"
                              onSelectionChange={(key) => {
                                if (
                                  key &&
                                  !selectedParallelCourseId.includes(
                                    key.toString()
                                  )
                                ) {
                                  field.onChange([
                                    ...selectedParallelCourseId,
                                    key.toString(),
                                  ]);
                                }
                              }}
                            >
                              {(course) => (
                                <AutocompleteItem
                                  key={course.id}
                                  textValue={`${course.code} - ${course.name}`}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold">
                                      {course.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {course.code}
                                    </span>
                                  </div>
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          </>
                        )}
                      />
                    </div>

                    <div className="flex flex-col space-y-3 mt-2">
                      <div className="flex items-start">
                        <Checkbox {...register("isRegistrable")}>
                          <span className="text-sm">Is Registrable</span>
                        </Checkbox>
                      </div>
                      <div className="flex items-start">
                        <Checkbox {...register("isRequired")}>
                          <span className="text-sm">Is Required</span>
                        </Checkbox>
                      </div>
                    </div>
                  </>
                )}

                {mode === "update" && (
                  <div className="flex flex-col space-y-3 mt-2">
                    <div className="flex items-start">
                      <Checkbox {...register("isRegistrable")}>
                        <span className="text-sm">Is Registrable</span>
                      </Checkbox>
                    </div>
                    <div className="flex items-start">
                      <Checkbox {...register("isRequired")}>
                        <span className="text-sm">Is Required</span>
                      </Checkbox>
                    </div>
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
