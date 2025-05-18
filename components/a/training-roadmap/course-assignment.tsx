import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Save,
  Edit2,
  Trash,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Badge,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

import { useAddComponentsToTrainingRoadmap } from "@/services/training-roadmap/training-roadmap.hooks";
import { useCourses } from "@/services/course/course.hooks";
import { useCourseGroupsByMajorId } from "@/services/training-roadmap/training-roadmap.hooks";
import {
  TrainingRoadmap,
  CoursesGroup,
} from "@/services/training-roadmap/training-roadmap.schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentRoadmap,
  addCourseToSemester,
  removeCourseFromSemester,
  replaceCourseInSemester,
  saveRoadmapChanges,
  addCourseGroupToSemester,
  removeCourseGroupFromSemester,
  replaceCourseGroupInSemester,
  initializeFromApiData,
} from "@/store/slices/trainingRoadmapSlice";
import { Course } from "@/services/course/course.schema";

interface CourseAssignmentProps {
  roadmap: TrainingRoadmap;
  onUpdate: () => void;
}

const CourseAssignment: React.FC<CourseAssignmentProps> = ({
  roadmap,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const {
    draftCourseAssignments,
    draftCourseGroupAssignments,
    unsavedChanges,
  } = useAppSelector((state) => state.trainingRoadmap);

  const {
    isOpen: isAddCourseModalOpen,
    onOpen: onAddCourseModalOpen,
    onClose: onAddCourseModalClose,
  } = useDisclosure();
  const {
    isOpen: isReplaceCourseModalOpen,
    onOpen: onReplaceCourseModalOpen,
    onClose: onReplaceCourseModalClose,
  } = useDisclosure();
  const {
    isOpen: isReplaceCourseGroupModalOpen,
    onOpen: onReplaceCourseGroupModalOpen,
    onClose: onReplaceCourseGroupModalClose,
  } = useDisclosure();
  // Local state
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [nextSemester, setNextSemester] = useState<number>(1);
  const [replacingCourse, setReplacingCourse] = useState<{
    courseId: string;
    draftId?: string;
    semesterNumber: number;
    type?: string;
  } | null>(null);
  const [replacingCourseGroup, setReplacingCourseGroup] = useState<{
    coursesGroupId: string;
    draftId?: string;
    semesterNumber: number;
  } | null>(null);
  const [selectedCourseGroupId, setSelectedCourseGroupId] =
    useState<string>("");

  // Modal controls for group selection
  const {
    isOpen: isAddCourseGroupModalOpen,
    onOpen: onAddCourseGroupModalOpen,
    onClose: onAddCourseGroupModalClose,
  } = useDisclosure();

  // Ref for horizontal scrolling container
  const semestersContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all available courses
  const { data: coursesData } = useCourses({
    pageNumber: 1,
    itemsPerpage: 100,
    searchQuery: "",
    isDesc: false,
  });

  // Fetch course groups
  const { data: courseGroupsData } = useCourseGroupsByMajorId(roadmap?.majorId);

  const availableCourses = coursesData?.data?.data || [];

  // Filter courses based on search query
  const getFilteredCourses = () => {
    const query = courseSearchQuery.toLowerCase().trim();

    if (!query) return getUnassignedCourses();

    return getUnassignedCourses().filter(
      (course: Course) =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)
    );
  };

  // Initialize the Redux store with the current roadmap on component mount
  useEffect(() => {
    if (roadmap) {
      dispatch(setCurrentRoadmap(roadmap));
      dispatch(initializeFromApiData());
    }
  }, [roadmap, dispatch]);

  //Initialize semesters from both API data and draft assignments
  useEffect(() => {
    if (
      draftCourseAssignments.length > 0 ||
      draftCourseGroupAssignments.length > 0
    ) {
      // Get all semester numbers from draft assignments
      const draftSemesters = draftCourseAssignments.map(
        (assignment) => assignment.semesterNumber
      );
      const draftGroupSemesters = draftCourseGroupAssignments.map(
        (assignment) => assignment.semesterNumber
      );

      // Combine all semester numbers and remove duplicates
      const allSemesters = [...draftSemesters, ...draftGroupSemesters];

      if (allSemesters.length > 0) {
        const uniqueSemesters = Array.from(new Set(allSemesters)).sort(
          (a, b) => a - b
        );

        setSemesters(uniqueSemesters);
        setNextSemester(Math.max(...uniqueSemesters) + 1);
      } else {
        setSemesters([]);
        setNextSemester(1);
      }
    } else {
      setSemesters([]);
      setNextSemester(1);
    }
  }, [draftCourseAssignments, draftCourseGroupAssignments]);

  // Filter out courses that are already assigned
  const getAssignedCourseIds = () => {
    const apiAssignedIds = new Set(
      roadmap?.trainingRoadmapCourses?.map((c) => c.courseId) || []
    );
    const draftAssignedIds = new Set(
      draftCourseAssignments.map((c) => c.courseId)
    );

    return new Set([
      ...Array.from(apiAssignedIds),
      ...Array.from(draftAssignedIds),
    ]);
  };

  const getUnassignedCourses = () => {
    const assignedIds = getAssignedCourseIds();

    // When replacing, don't exclude the currently selected course
    if (replacingCourse) {
      assignedIds.delete(replacingCourse.courseId);
    }

    return availableCourses.filter(
      (course: Course) => !assignedIds.has(course.id)
    );
  }; // Get all courses and course groups for a specific semester
  const getCoursesForSemester = (semesterNumber: number) => {
    // Get individual courses from draft assignments
    const draftCourses = draftCourseAssignments
      .filter((c) => c.semesterNumber === semesterNumber)
      .map((c) => ({
        ...c.course,
        isDraft: true, // Mark as draft course
        isFromApi: c.isFromApi, // Keep track if it came from API
        draftId: c.id,
        courseId: c.courseId,
        semesterNumber: c.semesterNumber,
        type: "course", // Mark as individual course
      }));

    // Get course groups from draft assignments
    const draftCourseGroups = draftCourseGroupAssignments
      .filter((g) => g.semesterNumber === semesterNumber)
      .map((g) => ({
        id: g.id,
        groupName: g.coursesGroup?.groupName || "Course Group",
        isDraft: true,
        isFromApi: g.isFromApi, // Keep track if it came from API
        draftId: g.id,
        coursesGroupId: g.coursesGroupId,
        semesterNumber: g.semesterNumber,
        type: "courseGroup", // Mark as course group
        totalCourses: g.coursesGroup?.courses?.length || 0,
        totalCredits:
          g.coursesGroup?.courses?.reduce(
            (total: number, course: Course) => total + (course.credit || 0),
            0
          ) || 0,
        credit: g.coursesGroup?.courses?.[0]?.credit || 0, // First course credit for display
        code: `Group-${g.coursesGroupId?.substring(0, 4)}`, // Generate a code for display
        name: g.coursesGroup?.groupName || "Course Group", // Use group name for display
      }));

    return [...draftCourses, ...draftCourseGroups];
  };

  // Calculate total credits for a semester
  const calculateTotalCredits = (semesterNumber: number): number => {
    return getCoursesForSemester(semesterNumber).reduce((total, course) => {
      return total + (course.credit || 0);
    }, 0);
  };

  // Calculate total credits across all semesters
  const calculateAllCredits = (): number => {
    return [...semesters, nextSemester].reduce((total, semesterNum) => {
      return total + calculateTotalCredits(semesterNum);
    }, 0);
  };

  const hasCourses = (semesterNumber: number): boolean => {
    return getCoursesForSemester(semesterNumber).length > 0;
  };
  // Handler for adding a course to a semester
  const handleAddCourse = () => {
    if (!selectedCourseId) return;

    const selectedCourse = availableCourses.find(
      (c: Course) => c.id === selectedCourseId
    );

    if (!selectedCourse) return;

    // Dispatch to Redux instead of calling API directly
    dispatch(
      addCourseToSemester({
        courseId: selectedCourse.id,
        semesterNumber: selectedSemester,
        course: {
          id: selectedCourse.id,
          code: selectedCourse.code,
          name: selectedCourse.name,
          description: selectedCourse.description,
          credit: selectedCourse.credit,
          majorId: selectedCourse.majorId,
        },
      })
    );

    onAddCourseModalClose();
    setSelectedCourseId("");
    setCourseSearchQuery("");
  };

  // Handler for adding a course group to a semester
  const handleAddCourseGroup = () => {
    if (!selectedCourseGroupId) return;

    const selectedGroup = courseGroupsData?.data?.find(
      (group: CoursesGroup) => group.id === selectedCourseGroupId
    );

    if (!selectedGroup) return;

    // Dispatch to Redux to add the course group to the semester as a single unit
    dispatch(
      addCourseGroupToSemester({
        coursesGroupId: selectedGroup.id,
        semesterNumber: selectedSemester,
        coursesGroup: selectedGroup,
      })
    );

    onAddCourseGroupModalClose();
    setSelectedCourseGroupId("");
  };
  // Handler for initiating the replacement of a course
  const handleReplaceCourseClick = (
    courseId: string,
    draftId: string | undefined,
    semesterNumber: number,
    type?: string
  ) => {
    if (type === "courseGroup") {
      setReplacingCourseGroup({
        coursesGroupId: courseId,
        draftId,
        semesterNumber,
      });
      setSelectedCourseGroupId(""); // Clear any selected course group
      onReplaceCourseGroupModalOpen();
    } else {
      setReplacingCourse({
        courseId,
        draftId,
        semesterNumber,
        type,
      });
      setSelectedCourseId(""); // Clear any selected course
      setCourseSearchQuery("");
      onReplaceCourseModalOpen();
    }
  };

  // Handler for completing the course replacement
  const handleReplaceCourse = () => {
    if (!replacingCourse || !selectedCourseId) return;

    const newCourse = availableCourses.find(
      (c: Course) => c.id === selectedCourseId
    );

    if (!newCourse) return;

    dispatch(
      replaceCourseInSemester({
        oldCourseId: replacingCourse.courseId,
        oldDraftId: replacingCourse.draftId,
        newCourseId: newCourse.id,
        semesterNumber: replacingCourse.semesterNumber,
        newCourse: {
          id: newCourse.id,
          code: newCourse.code,
          name: newCourse.name,
          description: newCourse.description,
          credit: newCourse.credit,
          majorId: newCourse.majorId,
        },
      })
    );

    onReplaceCourseModalClose();
    setReplacingCourse(null);
    setSelectedCourseId("");
    setCourseSearchQuery("");
  };

  // Handler for completing the course group replacement
  const handleReplaceCourseGroup = () => {
    if (!replacingCourseGroup || !selectedCourseGroupId) return;

    const newCourseGroup = courseGroupsData?.data?.find(
      (group: CoursesGroup) => group.id === selectedCourseGroupId
    );

    if (!newCourseGroup) return;

    dispatch(
      replaceCourseGroupInSemester({
        oldCoursesGroupId: replacingCourseGroup.coursesGroupId,
        oldDraftId: replacingCourseGroup.draftId,
        newCoursesGroupId: newCourseGroup.id,
        semesterNumber: replacingCourseGroup.semesterNumber,
        newCoursesGroup: newCourseGroup,
      })
    );

    onReplaceCourseGroupModalClose();
    setReplacingCourseGroup(null);
    setSelectedCourseGroupId("");
  }; // Handler for removing a course or course group
  const handleRemoveCourse = (
    courseId: string,
    draftId?: string,
    type?: string
  ) => {
    if (type === "courseGroup") {
      // This is a course group, so use the coursesGroupId as courseId
      dispatch(
        removeCourseGroupFromSemester({
          coursesGroupId: courseId,
          draftId: draftId,
        })
      );
    } else {
      // This is a regular course
      dispatch(removeCourseFromSemester({ courseId, draftId }));
    }
  }; // Import the new hook
  const addComponentsMutation = useAddComponentsToTrainingRoadmap();
  // Handler for saving all changes
  const handleSaveAllChanges = async () => {
    if (
      !roadmap ||
      (draftCourseAssignments.length === 0 &&
        draftCourseGroupAssignments.length === 0)
    )
      return;

    setIsSubmitting(true);

    try {
      // Prepare the payload for the API to add components
      // Send all draft items (both from API and new ones)
      const payload = {
        trainingRoadmapId: roadmap.id,
        trainingRoadmapCourses: draftCourseAssignments.map((assignment) => ({
          courseId: assignment.courseId,
          semesterNumber: assignment.semesterNumber,
        })),
        coursesGroupSemesters: draftCourseGroupAssignments.map(
          (assignment) => ({
            coursesGroupId: assignment.coursesGroupId,
            semesterNumber: assignment.semesterNumber,
          })
        ),
      };

      // Call the API to add components
      await addComponentsMutation.mutateAsync(payload);

      // Wait a moment for the API update to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Clear draft assignments in Redux
      dispatch(saveRoadmapChanges());

      // Refresh parent component to fetch the latest data from the server
      onUpdate();
    } catch (_error) {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine existing semesters with the next one for display
  const allSemesters = [...semesters, nextSemester];

  // Scroll semester container left/right
  const scrollSemesters = (direction: "left" | "right") => {
    if (!semestersContainerRef.current) return;

    const container = semestersContainerRef.current;
    const scrollAmount = 300; // px to scroll

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Course Assignment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total credits: {calculateAllCredits()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {" "}
          <div className="hidden sm:flex gap-2">
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onClick={() => scrollSemesters("left")}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onClick={() => scrollSemesters("right")}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          {unsavedChanges && (
            <Button
              color="success"
              isLoading={isSubmitting}
              startContent={<Save size={18} />}
              variant="solid"
              onClick={handleSaveAllChanges}
            >
              Complete Roadmap
            </Button>
          )}
        </div>
      </div>
      {/* Horizontal scrolling semester cards */}
      <div
        ref={semestersContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {allSemesters.map((semesterNumber) => {
          const totalSemesterCredits = calculateTotalCredits(semesterNumber);

          return (
            <Card
              key={semesterNumber}
              className={`min-w-[300px] max-w-[300px] ${semesterNumber === nextSemester ? "border-dashed border-2 border-gray-300" : ""} snap-center`}
            >
              <div
                className={`
              ${
                semesterNumber === nextSemester
                  ? "bg-gray-100"
                  : hasCourses(semesterNumber)
                    ? "bg-primary text-white"
                    : "bg-blue-600 text-white"
              } py-3 px-4 flex justify-between items-center`}
              >
                <div>
                  <h3
                    className={`text-lg font-medium ${semesterNumber === nextSemester ? "text-gray-600" : ""}`}
                  >
                    {semesterNumber === nextSemester
                      ? `Semester ${semesterNumber} (Next)`
                      : `Semester ${semesterNumber}`}
                  </h3>
                  {totalSemesterCredits > 0 && (
                    <span
                      className={`text-xs ${semesterNumber === nextSemester ? "text-gray-500" : "text-white/90"}`}
                    >
                      {totalSemesterCredits} credits
                    </span>
                  )}
                </div>
              </div>
              <CardBody className="overflow-visible">
                {getCoursesForSemester(semesterNumber).length > 0 ? (
                  <div className="space-y-3">
                    {" "}
                    {getCoursesForSemester(semesterNumber).map((course) => (
                      <div
                        key={course.id + (course.draftId || "")}
                        className={`p-3 border-b last:border-0 hover:bg-gray-50 ${
                          course.type === "courseGroup"
                            ? "bg-purple-50"
                            : "bg-orange-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium truncate pr-2">
                            {course.name}
                          </h4>{" "}
                          <Badge
                            className="whitespace-nowrap flex-shrink-0 min-w-[65px] text-center"
                            color={
                              course.type === "courseGroup"
                                ? "secondary"
                                : "warning"
                            }
                            variant="flat"
                          >
                            {course.credit} credits
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 truncate">
                          Code: {course.code}
                        </p>{" "}
                        {course.type === "courseGroup" && (
                          <p className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                            <Layers size={12} />
                            Group: {course.groupName || "Course Group"}
                          </p>
                        )}{" "}
                        <div className="flex justify-end gap-1">
                          <Tooltip
                            content={
                              course.type === "courseGroup"
                                ? "Replace group"
                                : "Replace course"
                            }
                          >
                            <Button
                              isIconOnly
                              color="primary"
                              size="sm"
                              variant="flat"
                              onClick={() =>
                                handleReplaceCourseClick(
                                  course.type === "courseGroup"
                                    ? course.coursesGroupId
                                    : course.courseId,
                                  course.draftId,
                                  semesterNumber,
                                  course.type
                                )
                              }
                            >
                              <Edit2 size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content={
                              course.type === "courseGroup"
                                ? "Remove group"
                                : "Remove course"
                            }
                          >
                            <Button
                              isIconOnly
                              color="danger"
                              size="sm"
                              variant="flat"
                              onClick={() =>
                                handleRemoveCourse(
                                  course.type === "courseGroup"
                                    ? course.coursesGroupId
                                    : course.courseId,
                                  course.draftId,
                                  course.type
                                )
                              }
                            >
                              <Trash size={14} />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {semesterNumber === nextSemester
                      ? "Ready for new course assignments"
                      : "No courses assigned"}
                  </p>
                )}{" "}
                <div className="mt-4 pt-3 border-t flex justify-center gap-2">
                  <Button
                    color="warning"
                    endContent={<Plus size={14} />}
                    size="sm"
                    variant="flat"
                    onClick={() => {
                      setSelectedSemester(semesterNumber);
                      onAddCourseModalOpen();
                    }}
                  >
                    Add Course
                  </Button>
                  <Button
                    color="secondary"
                    endContent={<Layers size={14} />}
                    size="sm"
                    variant="flat"
                    onClick={() => {
                      setSelectedSemester(semesterNumber);
                      onAddCourseGroupModalOpen();
                    }}
                  >
                    Add Group
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
      {/* Add Course Modal with Search */}
      <Modal isOpen={isAddCourseModalOpen} onOpenChange={onAddCourseModalClose}>
        <ModalContent>
          <ModalHeader>Add Course to Semester {selectedSemester}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {selectedCourseId && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(() => {
                    const selectedCourse = availableCourses.find(
                      (c: Course) => c.id === selectedCourseId
                    );

                    return selectedCourse ? (
                      <Chip
                        key={selectedCourseId}
                        className="bg-primary-100 text-primary-700"
                        size="sm"
                        onClose={() => setSelectedCourseId("")}
                      >
                        {selectedCourse.code} - {selectedCourse.name}
                      </Chip>
                    ) : null;
                  })()}
                </div>
              )}

              <Autocomplete
                allowsCustomValue={false}
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[400px]",
                }}
                defaultItems={getFilteredCourses()}
                items={getFilteredCourses()}
                placeholder="Search courses by name or code"
                selectedKey={selectedCourseId}
                onInputChange={(value) => setCourseSearchQuery(value)}
                onSelectionChange={(key) => {
                  if (key) {
                    setSelectedCourseId(key.toString());
                  }
                }}
              >
                {(course: Course) => (
                  <AutocompleteItem
                    key={course.id}
                    textValue={`${course.code} - ${course.name}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {course.name}
                      </span>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">
                          {course.code}
                        </span>
                        <span className="text-xs text-blue-600">
                          {course.credit} credits
                        </span>
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onAddCourseModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!selectedCourseId}
              onPress={handleAddCourse}
            >
              Add Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>{" "}
      {/* Replace Course Modal with Search */}
      <Modal
        isOpen={isReplaceCourseModalOpen}
        onOpenChange={onReplaceCourseModalClose}
      >
        <ModalContent>
          <ModalHeader>
            Replace Course in Semester {replacingCourse?.semesterNumber}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="mb-4">
                <Input
                  className="w-full"
                  placeholder="Search courses by name or code"
                  startContent={<Search size={16} />}
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                />
              </div>

              <div className="mb-2">
                {selectedCourseId && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(() => {
                      const selectedCourse = availableCourses.find(
                        (c: Course) => c.id === selectedCourseId
                      );

                      return selectedCourse ? (
                        <Chip
                          key={selectedCourseId}
                          className="bg-primary-100 text-primary-700"
                          size="sm"
                          onClose={() => setSelectedCourseId("")}
                        >
                          {selectedCourse.code} - {selectedCourse.name}
                        </Chip>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <Autocomplete
                allowsCustomValue={false}
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[400px]",
                }}
                defaultItems={getFilteredCourses()}
                items={getFilteredCourses()}
                placeholder="Select a replacement course"
                selectedKey={selectedCourseId}
                onSelectionChange={(key) => {
                  if (key) {
                    setSelectedCourseId(key.toString());
                  }
                }}
              >
                {(course: Course) => (
                  <AutocompleteItem
                    key={course.id}
                    textValue={`${course.code} - ${course.name}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {course.name}
                      </span>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">
                          {course.code}
                        </span>
                        <span className="text-xs text-blue-600">
                          {course.credit} credits
                        </span>
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onReplaceCourseModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!selectedCourseId}
              onPress={handleReplaceCourse}
            >
              Replace Course
            </Button>
          </ModalFooter>{" "}
        </ModalContent>
      </Modal>
      {/* Add Course Group Modal */}
      <Modal
        isOpen={isAddCourseGroupModalOpen}
        onOpenChange={onAddCourseGroupModalClose}
      >
        <ModalContent>
          <ModalHeader>
            Add Course Group to Semester {selectedSemester}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Select a Course Group"
                placeholder="Choose a course group"
                selectedKeys={[selectedCourseGroupId]}
                onChange={(e) => setSelectedCourseGroupId(e.target.value)}
              >
                {courseGroupsData?.data?.map((group: CoursesGroup) => (
                  <SelectItem key={group.id}>
                    {group.groupName} ({(group.courses || []).length} courses,{" "}
                    {(group.courses || []).reduce(
                      (total, course) => total + (course.credit || 0),
                      0
                    )}{" "}
                    credits)
                  </SelectItem>
                ))}
              </Select>

              {selectedCourseGroupId && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Courses in this group:
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {courseGroupsData?.data
                      ?.find(
                        (group: CoursesGroup) =>
                          group.id === selectedCourseGroupId
                      )
                      ?.courses.map((course: Course) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center py-1 border-b last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">{course.name}</p>
                            <p className="text-xs text-gray-500">
                              {course.code}
                            </p>
                          </div>
                          <Badge color="primary" variant="flat">
                            {course.credit} credits
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onAddCourseGroupModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!selectedCourseGroupId}
              onPress={handleAddCourseGroup}
            >
              Add Course Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Replace Course Group Modal */}
      <Modal
        isOpen={isReplaceCourseGroupModalOpen}
        onOpenChange={onReplaceCourseGroupModalClose}
      >
        <ModalContent>
          <ModalHeader>
            Replace Course Group in Semester{" "}
            {replacingCourseGroup?.semesterNumber}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Select a New Course Group"
                placeholder="Choose a course group"
                selectedKeys={[selectedCourseGroupId]}
                onChange={(e) => setSelectedCourseGroupId(e.target.value)}
              >
                {courseGroupsData?.data?.map((group: CoursesGroup) => (
                  <SelectItem key={group.id}>
                    {group.groupName} ({(group.courses || []).length} courses,{" "}
                    {(group.courses || []).reduce(
                      (total, course) => total + (course.credit || 0),
                      0
                    )}{" "}
                    credits)
                  </SelectItem>
                ))}
              </Select>

              {selectedCourseGroupId && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Courses in this group:
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {courseGroupsData?.data
                      ?.find(
                        (group: CoursesGroup) =>
                          group.id === selectedCourseGroupId
                      )
                      ?.courses.map((course: any) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center py-1 border-b last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">{course.name}</p>
                            <p className="text-xs text-gray-500">
                              {course.code}
                            </p>
                          </div>
                          <Badge color="primary" variant="flat">
                            {course.credit} credits
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onReplaceCourseGroupModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!selectedCourseGroupId}
              onPress={handleReplaceCourseGroup}
            >
              Replace Course Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CourseAssignment;
