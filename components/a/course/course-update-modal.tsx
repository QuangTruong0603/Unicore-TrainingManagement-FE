import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Checkbox,
} from "@heroui/react";

import { Course } from "@/services/course/course.schema";
import { Major } from "@/services/major/major.schema";
import { UpdateCourseData } from "@/services/course/course.dto";
import { courseService } from "@/services/course/course.service";
import { majorService } from "@/services/major/major.service";

interface CourseUpdateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  course: Course | null;
  onSuccess?: () => void;
}

export const CourseUpdateModal: React.FC<CourseUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  course,
  onSuccess,
}) => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateCourseData & { isActive?: boolean }>({
    defaultValues: {
      code: course?.code || "",
      name: course?.name || "",
      description: course?.description || "",
      credit: course?.credit || 0,
      majorIds: course?.majorIds || [],
      isOpenForAll: course?.isOpenForAll || false,
      isActive: course?.isActive || false,
      practicePeriod: course?.practicePeriod || 0,
      theoryPeriod: course?.theoryPeriod || 0,
      isRequired: course?.isRequired || false,
      minCreditRequired: course?.minCreditRequired || 0,
      preCourseIds: course?.preCourseIds || [],
      parallelCourseId: course?.parallelCourseIds || [],
    },
  });

  const selectedPreCourseIds = watch("preCourseIds") || [];
  const selectedParallelCourseIds = watch("parallelCourseId") || [];

  // Fetch majors and courses when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const [majorsResponse, coursesResponse] = await Promise.all([
            majorService.getMajors(),
            courseService.getCourses({
              pageNumber: 1,
              itemsPerpage: 100,
              orderBy: "name",
              isDesc: false,
            }),
          ]);

          setMajors(majorsResponse.data);
          setAllCourses(coursesResponse.data.data);
        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset form when course changes
  useEffect(() => {
    if (course) {
      reset({
        code: course.code || "",
        name: course.name || "",
        description: course.description || "",
        credit: course.credit || 0,
        majorIds: course.majorIds || [],
        isOpenForAll: course.isOpenForAll || false,
        isActive: course.isActive || false,
        practicePeriod: course.practicePeriod || 0,
        theoryPeriod: course.theoryPeriod || 0,
        isRequired: course.isRequired || false,
        minCreditRequired: course.minCreditRequired || 0,
        preCourseIds: course.preCourseIds || [],
        parallelCourseId: course.parallelCourseIds || [],
      });
    }
  }, [course, reset]);

  const handleFormSubmit = async (
    data: UpdateCourseData & { isActive?: boolean }
  ) => {
    if (!course) return;

    try {
      setIsSubmitting(true);
      // Include isActive in the update data to preserve the current status
      const updateData = {
        ...data,
        isActive: course.isActive, // Preserve the current isActive status
      };

      await courseService.updateCourse(course.id, updateData);
      onOpenChange(); // Close modal after successful update
      onSuccess?.(); // Call success callback to refresh course list
    } catch (error) {
      console.error("Failed to update course", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <ModalHeader className="flex flex-col gap-1">
              Edit Course: {course?.name}
            </ModalHeader>
            <ModalBody>
              <form
                className="space-y-4"
                id="course-update-form"
                onSubmit={handleSubmit(handleFormSubmit)}
              >
                {/* Name */}
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

                {/* Description */}
                <div>
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

                {/* Majors */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="majorIds"
                  >
                    Majors
                  </label>
                  <Controller
                    control={control}
                    name="majorIds"
                    render={({ field }) => (
                      <>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {field.value &&
                            field.value.map((majorId) => {
                              const selectedMajor = majors.find(
                                (m) => m.id === majorId
                              );

                              return (
                                selectedMajor && (
                                  <Chip
                                    key={majorId}
                                    className="bg-primary-100 text-primary-700"
                                    size="sm"
                                    onClose={() => {
                                      setValue(
                                        "majorIds",
                                        field.value!.filter(
                                          (id) => id !== majorId
                                        )
                                      );
                                    }}
                                  >
                                    {selectedMajor.code}
                                  </Chip>
                                )
                              );
                            })}
                        </div>
                        <Autocomplete
                          allowsCustomValue={false}
                          className="w-full"
                          defaultItems={majors.filter(
                            (m) => !field.value || !field.value.includes(m.id)
                          )}
                          id="majorIds"
                          placeholder="Search and select majors"
                          onSelectionChange={(key) => {
                            if (
                              key &&
                              (!field.value ||
                                !field.value.includes(key.toString()))
                            ) {
                              field.onChange([
                                ...(field.value || []),
                                key.toString(),
                              ]);
                            }
                          }}
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
                      </>
                    )}
                  />
                </div>

                {/* Credits and Min Credits Required */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="credit"
                    >
                      Credits
                    </label>
                    <Input
                      id="credit"
                      type="number"
                      {...register("credit", { valueAsNumber: true })}
                      errorMessage={errors.credit?.message}
                      placeholder="Enter credits"
                    />
                  </div>
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
                </div>

                {/* Theory and Practice Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="theoryPeriod"
                    >
                      Theory Period
                    </label>
                    <Input
                      id="theoryPeriod"
                      type="number"
                      {...register("theoryPeriod", { valueAsNumber: true })}
                      errorMessage={errors.theoryPeriod?.message}
                      placeholder="Enter theory periods"
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
                      {...register("practicePeriod", { valueAsNumber: true })}
                      errorMessage={errors.practicePeriod?.message}
                      placeholder="Enter practice periods"
                    />
                  </div>
                </div>

                {/* Pre Courses */}
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
                                  className="bg-orange-100 text-orange-800"
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
                          defaultItems={allCourses.filter(
                            (c) =>
                              !selectedPreCourseIds.includes(c.id) &&
                              c.id !== course?.id
                          )}
                          id="preCourseIds"
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
                          {(courseItem) => (
                            <AutocompleteItem
                              key={courseItem.id}
                              textValue={`${courseItem.code} - ${courseItem.name}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                  {courseItem.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {courseItem.code}
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
                          {selectedParallelCourseIds.map((courseId) => {
                            const selectedCourse = allCourses.find(
                              (c) => c.id === courseId
                            );

                            return (
                              selectedCourse && (
                                <Chip
                                  key={courseId}
                                  className="bg-blue-100 text-blue-800"
                                  size="sm"
                                  onClose={() => {
                                    setValue(
                                      "parallelCourseId",
                                      selectedParallelCourseIds.filter(
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
                          defaultItems={allCourses.filter(
                            (c) =>
                              !selectedParallelCourseIds.includes(c.id) &&
                              c.id !== course?.id
                          )}
                          id="parallelCourseId"
                          placeholder="Search and select parallel courses"
                          onSelectionChange={(key) => {
                            if (
                              key &&
                              !selectedParallelCourseIds.includes(
                                key.toString()
                              )
                            ) {
                              field.onChange([
                                ...selectedParallelCourseIds,
                                key.toString(),
                              ]);
                            }
                          }}
                        >
                          {(courseItem) => (
                            <AutocompleteItem
                              key={courseItem.id}
                              textValue={`${courseItem.code} - ${courseItem.name}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                  {courseItem.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {courseItem.code}
                                </span>
                              </div>
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      </>
                    )}
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start">
                    <Checkbox {...register("isRequired")}>
                      <span className="text-sm">Is Required</span>
                    </Checkbox>
                  </div>
                  <div className="flex items-start">
                    <Checkbox {...register("isOpenForAll")}>
                      <span className="text-sm">Is Open For All Majors</span>
                    </Checkbox>
                  </div>
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                form="course-update-form"
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update Course"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
