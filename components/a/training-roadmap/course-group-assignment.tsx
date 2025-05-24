import React, { useState, useEffect } from "react";
import { Plus, Save, Edit2, Trash, Search } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Tooltip,
} from "@heroui/react";

import { useCoursesByMajorId } from "@/services/course/course.hooks";
import { useCourseGroupsByMajorId } from "@/services/training-roadmap/training-roadmap.hooks";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import {
  TrainingRoadmap,
  CoursesGroup,
} from "@/services/training-roadmap/training-roadmap.schema";
import { Course } from "@/services/course/course.schema";
import { trainingRoadmapService } from "@/services/training-roadmap/training-roadmap.service";

// Define unique ID for draft course groups
const generateDraftId = () =>
  `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface CourseGroupAssignmentProps {
  roadmap: TrainingRoadmap;
  onUpdate: () => void;
}

const CourseGroupAssignment: React.FC<CourseGroupAssignmentProps> = ({
  roadmap,
  onUpdate,
}) => {
  const [courseGroups, setCourseGroups] = useState<CoursesGroup[]>([]);
  const [draftCourseGroups, setDraftCourseGroups] = useState<CoursesGroup[]>(
    []
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group editing state
  const [currentGroupName, setCurrentGroupName] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  // Modal controls
  const {
    isOpen: isGroupModalOpen,
    onOpen: onGroupModalOpen,
    onClose: onGroupModalClose,
  } = useDisclosure();

  // Fetch all available courses
  // const { data: coursesData } = useCourses({
  //   pageNumber: 1,
  //   itemsPerpage: 1000,
  //   isDesc: false,
  //   filters: {
  //     majorIds: [roadmap.majorId],
  //   },
  // });

  const { data: coursesData } = useCoursesByMajorId(roadmap.majorId);

  const availableCourses = coursesData?.data || [];
  // Fetch course groups by major ID
  const { data: courseGroupsData, refetch: refetchCourseGroups } =
    useCourseGroupsByMajorId(roadmap?.majorId);

  useEffect(() => {
    if (courseGroupsData?.data) {
      setCourseGroups(courseGroupsData.data);
    }
  }, [courseGroupsData]);

  // Check if a course is already used in any group (except the current editing group)
  const isCourseUsedInOtherGroup = (courseId: string): boolean => {
    // Check in existing course groups
    for (const group of courseGroups) {
      if (editingGroupId === group.id) continue; // Skip the group being edited
      if (group.courses?.some((course) => course.id === courseId)) {
        return true;
      }
    }

    // Check in draft course groups
    for (const group of draftCourseGroups) {
      if (editingGroupId === group.id) continue; // Skip the group being edited
      if (group.courses?.some((course) => course.id === courseId)) {
        return true;
      }
    }

    return false;
  };

  // Handle adding or updating a course group
  const handleSaveCourseGroup = () => {
    if (!currentGroupName || selectedCourseIds.length === 0) return;

    // Get selected course objects
    const selectedCourses = availableCourses.filter((course: Course) =>
      selectedCourseIds.includes(course.id)
    );

    if (editingGroupId) {
      // Update existing group
      const isExistingGroup = courseGroups.some(
        (group) => group.id === editingGroupId
      );

      if (isExistingGroup) {
        // Update existing roadmap group
        setCourseGroups((groups) =>
          groups.map((group) =>
            group.id === editingGroupId
              ? {
                  ...group,
                  groupName: currentGroupName,
                  courses: selectedCourses,
                  updatedAt: new Date().toISOString(),
                  majorId: roadmap?.majorId,
                }
              : group
          )
        );
      } else {
        // Update draft group
        setDraftCourseGroups((groups) =>
          groups.map((group) =>
            group.id === editingGroupId
              ? {
                  ...group,
                  groupName: currentGroupName,
                  courses: selectedCourses,
                  updatedAt: new Date().toISOString(),
                  majorId: roadmap?.majorId,
                }
              : group
          )
        );
      }
    } else {
      // Create new draft course group
      const newGroup: CoursesGroup = {
        id: generateDraftId(),
        groupName: currentGroupName,
        courses: selectedCourses,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
        majorId: roadmap?.majorId,
        credit: selectedCourses[0]?.credit || 0,
      };

      setDraftCourseGroups((prevGroups) => [...prevGroups, newGroup]);
    }

    setHasUnsavedChanges(true);
    resetForm();
    onGroupModalClose();
  };

  // Handle editing a course group
  const handleEditGroup = (group: CoursesGroup) => {
    setEditingGroupId(group.id);
    setCurrentGroupName(group.groupName);
    setSelectedCourseIds((group.courses || []).map((course) => course.id));
    onGroupModalOpen();
  };

  // Handle deleting a course group
  const handleDeleteGroup = (groupId: string) => {
    const isExistingGroup = courseGroups.some((group) => group.id === groupId);

    if (isExistingGroup) {
      setCourseGroups((groups) =>
        groups.filter((group) => group.id !== groupId)
      );
    } else {
      setDraftCourseGroups((groups) =>
        groups.filter((group) => group.id !== groupId)
      );
    }

    setHasUnsavedChanges(true);
  };

  // Reset form state
  const resetForm = () => {
    setCurrentGroupName("");
    setSelectedCourseIds([]);
    setEditingGroupId(null);
    setCourseSearchQuery("");
  };

  // Handle opening the modal for creating a new group
  const handleAddNewGroup = () => {
    resetForm();
    onGroupModalOpen();
  };

  // Handle course selection/deselection
  const handleCourseSelection = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
    } else {
      // Check if the course is already used in another group before adding
      if (isCourseUsedInOtherGroup(courseId)) {
        alert(
          `This course is already assigned to another group. Each course can only be in one group.`
        );

        return;
      }
      setSelectedCourseIds((prev) => [...prev, courseId]);
    }
  };

  // Filter available courses based on search query
  const getFilteredCourses = () => {
    const query = courseSearchQuery.toLowerCase().trim();

    if (!query) return availableCourses;

    return availableCourses.filter(
      (course: Course) =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)
    );
  };

  // Get course by ID
  const getCourseById = (courseId: string) => {
    return availableCourses.find((course: Course) => course.id === courseId);
  };

  // Calculate total credits for a course group
  const calculateGroupCredits = (group: CoursesGroup): number => {
    return (group.courses || []).reduce(
      (total, course) => total + (course.credit || 0),
      0
    );
  };

  const { confirmDialog } = useConfirmDialog();
  // Save only the draft course groups to the roadmap
  const handleSaveAllChanges = async () => {
    if (!roadmap) return;

    confirmDialog(
      async () => {
        setIsSubmitting(true);

        try {
          // Only use the draft course groups
          const draftGroupsToSave = [...draftCourseGroups];

          // Prepare the payload for the multiple course groups API
          const courseGroupsPayload = draftGroupsToSave.map((group) => ({
            groupName: group.groupName,
            courseIds: (group.courses || []).map((course) => course.id),
            majorId: group.majorId || roadmap.majorId,
          }));

          // Call the create multiple course groups API for draft groups only
          const response =
            await trainingRoadmapService.createMultipleCourseGroups(
              courseGroupsPayload
            );

          // Update the local course groups state with the newly created groups
          // from the response if available, otherwise merge the draft groups into the existing groups
          if (response?.data) {
            setCourseGroups(response.data);
          } else {
            // Merge draft groups into the current course groups
            setCourseGroups((prevGroups) => [
              ...prevGroups,
              ...draftCourseGroups,
            ]);
          }

          // Clear draft groups and reset state
          setDraftCourseGroups([]);
          setHasUnsavedChanges(false);

          // Refetch the course groups data from the server to ensure we have the latest data
          await refetchCourseGroups();

          // Refresh parent component to get updated course groups from server
          onUpdate();
        } catch {
          // Handle error silently
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        title: "Save Changes?",
        message:
          "Are you sure you want to save the new course groups? This will update the roadmap for all students.",
        confirmText: "Yes, Save Changes",
        cancelText: "Cancel",
      }
    );
  };

  // All course groups (existing + draft)
  const allCourseGroups = [...courseGroups, ...draftCourseGroups];

  return (
    <div className="mt-10 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Course Groups</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage course groups that can be assigned to semesters
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onClick={handleAddNewGroup}
          >
            Add Course Group
          </Button>

          {hasUnsavedChanges && (
            <Button
              color="success"
              isLoading={isSubmitting}
              startContent={<Save size={18} />}
              onClick={handleSaveAllChanges}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {allCourseGroups.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <p className="mb-4 text-gray-500">
              No course groups have been created yet.
            </p>
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              onClick={handleAddNewGroup}
            >
              Create Course Group
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {allCourseGroups.map((group) => {
            const isDraft = draftCourseGroups.some(
              (draftGroup) => draftGroup.id === group.id
            );
            const courses = group.courses || [];

            return (
              <Card
                key={group.id}
                className={
                  isDraft ? "border-2 border-dashed border-gray-300" : ""
                }
              >
                <CardHeader className="flex justify-between items-center px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{group.groupName}</h3>
                      {isDraft && (
                        <Badge color="warning" variant="flat">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {courses.length} courses · {calculateGroupCredits(group)}{" "}
                      total credits
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      color="primary"
                      variant="flat"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-4">
                  <Table removeWrapper aria-label="Courses in group">
                    <TableHeader>
                      <TableColumn>CODE</TableColumn>
                      <TableColumn>NAME</TableColumn>
                      <TableColumn>CREDITS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>
                            <Badge color="primary" variant="flat">
                              {course.credit}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Course Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        size="2xl"
        onOpenChange={onGroupModalClose}
      >
        <ModalContent>
          <ModalHeader>
            {editingGroupId ? "Edit Course Group" : "Create Course Group"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <Input
                label="Group Name"
                placeholder="Enter a name for this group"
                value={currentGroupName}
                onChange={(e) => setCurrentGroupName(e.target.value)}
              />

              <div className="space-y-2">
                <Input
                  label="Search Courses"
                  placeholder="Search by course name or code"
                  startContent={<Search size={16} />}
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                />

                {selectedCourseIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Selected Courses:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedCourseIds.map((courseId) => {
                        const course = getCourseById(courseId);

                        return course ? (
                          <Chip
                            key={courseId}
                            color="primary"
                            variant="flat"
                            onClose={() => handleCourseSelection(courseId)}
                          >
                            {course.code} - {course.name}
                          </Chip>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="max-h-[300px] overflow-y-auto border rounded-md">
                  <Table aria-label="Available courses">
                    <TableHeader>
                      <TableColumn>SELECT</TableColumn>
                      <TableColumn>CODE</TableColumn>
                      <TableColumn>NAME</TableColumn>
                      <TableColumn>CREDITS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      <>
                        {getFilteredCourses().map(
                          (course: {
                            id: string;
                            code: string;
                            name: string;
                            credit: number;
                          }) => {
                            const isSelected: boolean =
                              selectedCourseIds.includes(course.id);
                            const isUsedInOtherGroup =
                              !isSelected &&
                              isCourseUsedInOtherGroup(course.id);

                            return (
                              <TableRow
                                key={course.id}
                                className={
                                  isSelected
                                    ? "bg-primary-50"
                                    : isUsedInOtherGroup
                                      ? "bg-gray-100"
                                      : ""
                                }
                              >
                                <TableCell>
                                  <Button
                                    isIconOnly
                                    color={isSelected ? "primary" : "default"}
                                    isDisabled={isUsedInOtherGroup}
                                    size="sm"
                                    variant={isSelected ? "solid" : "bordered"}
                                    onClick={() =>
                                      handleCourseSelection(course.id)
                                    }
                                  >
                                    {isSelected ? (
                                      <Trash size={14} />
                                    ) : (
                                      <Plus size={14} />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell>{course.code}</TableCell>
                                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                  <Tooltip
                                    content={
                                      isUsedInOtherGroup
                                        ? `${course.name} (already in another group)`
                                        : course.name
                                    }
                                  >
                                    <span
                                      className={
                                        isUsedInOtherGroup
                                          ? "text-gray-400"
                                          : ""
                                      }
                                    >
                                      {course.name}
                                      {isUsedInOtherGroup && " (assigned)"}
                                    </span>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Badge color="primary" variant="flat">
                                    {course.credit}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                        {getFilteredCourses().length === 0 && (
                          <TableRow>
                            <TableCell className="text-center py-4" colSpan={4}>
                              No courses found matching your search
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onGroupModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!currentGroupName || selectedCourseIds.length === 0}
              onPress={handleSaveCourseGroup}
            >
              {editingGroupId ? "Update Group" : "Create Group"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CourseGroupAssignment;
