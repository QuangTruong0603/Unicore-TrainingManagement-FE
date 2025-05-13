import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  TrainingRoadmap,
  TrainingRoadmapQuery,
  TrainingRoadmapFilter,
} from "@/services/training-roadmap/training-roadmap.schema";

// Define the state interface
interface TrainingRoadmapState {
  roadmaps: TrainingRoadmap[];
  query: TrainingRoadmapQuery;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // New state for course assignment
  currentRoadmap: TrainingRoadmap | null;
  draftCourseAssignments: Record<string, any>[];
  draftCourseGroupAssignments: Record<string, any>[];
  unsavedChanges: boolean;
}

// Initial state
const initialState: TrainingRoadmapState = {
  roadmaps: [],
  query: {
    pageNumber: 1,
    itemsPerpage: 10,
    searchQuery: "",
    orderBy: undefined,
    isDesc: false,
    filters: {},
  },
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  // Initialize new state
  currentRoadmap: null,
  draftCourseAssignments: [],
  draftCourseGroupAssignments: [],
  unsavedChanges: false,
};

// Create the slice
const trainingRoadmapSlice = createSlice({
  name: "trainingRoadmap",
  initialState,
  reducers: {
    setRoadmaps: (state, action: PayloadAction<TrainingRoadmap[]>) => {
      state.roadmaps = action.payload;
    },
    setQuery: (state, action: PayloadAction<TrainingRoadmapQuery>) => {
      state.query = action.payload;
    },
    setFilter: (state, action: PayloadAction<TrainingRoadmapFilter>) => {
      state.query.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query.searchQuery = action.payload;
      state.query.pageNumber = 1; // Reset to first page on search
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.query.pageNumber = action.payload;
    },
    setSort: (
      state,
      action: PayloadAction<{ key: string; isDesc: boolean }>
    ) => {
      state.query.orderBy = action.payload.key;
      state.query.isDesc = action.payload.isDesc;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
      state.totalPages = Math.ceil(action.payload / state.query.itemsPerpage);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // New actions for course assignment
    setCurrentRoadmap: (state, action: PayloadAction<TrainingRoadmap>) => {
      state.currentRoadmap = action.payload;
      state.draftCourseAssignments = [];
      state.draftCourseGroupAssignments = [];
      state.unsavedChanges = false;
    },
    addCourseToSemester: (
      state,
      action: PayloadAction<{
        courseId: string;
        semesterNumber: number;
        course: any;
      }>
    ) => {
      const { courseId, semesterNumber, course } = action.payload;

      state.draftCourseAssignments.push({
        id: `draft-${Date.now()}-${courseId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        courseId,
        course,
        semesterNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    removeCourseFromSemester: (
      state,
      action: PayloadAction<{
        courseId: string;
        draftId?: string;
      }>
    ) => {
      const { courseId, draftId } = action.payload;

      // If it's a draft course, remove by draftId
      if (draftId) {
        state.draftCourseAssignments = state.draftCourseAssignments.filter(
          (course) => course.id !== draftId
        );
      } else {
        // Else remove by courseId
        state.draftCourseAssignments = state.draftCourseAssignments.filter(
          (course) => course.courseId !== courseId
        );
      }

      state.unsavedChanges = true;
    },
    // Replace a course with another in the same semester
    replaceCourseInSemester: (
      state,
      action: PayloadAction<{
        oldCourseId: string;
        oldDraftId?: string;
        newCourseId: string;
        semesterNumber: number;
        newCourse: any;
      }>
    ) => {
      const {
        oldCourseId,
        oldDraftId,
        newCourseId,
        semesterNumber,
        newCourse,
      } = action.payload;

      // First, remove the old course
      if (oldDraftId) {
        state.draftCourseAssignments = state.draftCourseAssignments.filter(
          (course) => course.id !== oldDraftId
        );
      } else {
        state.draftCourseAssignments = state.draftCourseAssignments.filter(
          (course) => course.courseId !== oldCourseId
        );
      }

      // Then add the new course to the same semester
      state.draftCourseAssignments.push({
        id: `draft-${Date.now()}-${newCourseId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        courseId: newCourseId,
        course: newCourse,
        semesterNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    editCourseSemester: (
      state,
      action: PayloadAction<{
        draftId: string;
        newSemester: number;
      }>
    ) => {
      const { draftId, newSemester } = action.payload;

      state.draftCourseAssignments = state.draftCourseAssignments.map(
        (course) => {
          if (course.id === draftId) {
            return {
              ...course,
              semesterNumber: newSemester,
              updatedAt: new Date().toISOString(),
            };
          }

          return course;
        }
      );

      state.unsavedChanges = true;
    },
    addCourseGroupToSemester: (
      state,
      action: PayloadAction<{
        coursesGroupId: string;
        semesterNumber: number;
        coursesGroup: any;
      }>
    ) => {
      const { coursesGroupId, semesterNumber, coursesGroup } = action.payload;

      state.draftCourseGroupAssignments.push({
        id: `draft-group-${Date.now()}-${coursesGroupId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        coursesGroupId,
        semesterNumber,
        coursesGroup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    removeCourseGroupFromSemester: (
      state,
      action: PayloadAction<{
        coursesGroupId: string;
        draftId?: string;
      }>
    ) => {
      const { coursesGroupId, draftId } = action.payload;

      // If it's a draft course group, remove by draftId
      if (draftId) {
        state.draftCourseGroupAssignments =
          state.draftCourseGroupAssignments.filter(
            (group) => group.id !== draftId
          );
      } else {
        // Else remove by coursesGroupId
        state.draftCourseGroupAssignments =
          state.draftCourseGroupAssignments.filter(
            (group) => group.coursesGroupId !== coursesGroupId
          );
      }

      state.unsavedChanges = true;
    },
    replaceCourseGroupInSemester: (
      state,
      action: PayloadAction<{
        oldCoursesGroupId: string;
        oldDraftId?: string;
        newCoursesGroupId: string;
        semesterNumber: number;
        newCoursesGroup: any;
      }>
    ) => {
      const {
        oldCoursesGroupId,
        oldDraftId,
        newCoursesGroupId,
        semesterNumber,
        newCoursesGroup,
      } = action.payload;

      // First, remove the old course group
      if (oldDraftId) {
        state.draftCourseGroupAssignments =
          state.draftCourseGroupAssignments.filter(
            (group) => group.id !== oldDraftId
          );
      } else {
        state.draftCourseGroupAssignments =
          state.draftCourseGroupAssignments.filter(
            (group) => group.coursesGroupId !== oldCoursesGroupId
          );
      }

      // Then add the new course group to the same semester
      state.draftCourseGroupAssignments.push({
        id: `draft-group-${Date.now()}-${newCoursesGroupId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        coursesGroupId: newCoursesGroupId,
        semesterNumber,
        coursesGroup: newCoursesGroup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    saveRoadmapChanges: (state) => {
      // This will be handled by the thunk action, this just resets the unsaved flag
      state.draftCourseAssignments = [];
      state.draftCourseGroupAssignments = [];
      state.unsavedChanges = false;
    },
    clearDraftAssignments: (state) => {
      state.draftCourseAssignments = [];
      state.draftCourseGroupAssignments = [];
      state.unsavedChanges = false;
    },
    // New actions to handle API courses/groups
    addApiCourseToDraft: (
      state,
      action: PayloadAction<{
        courseId: string;
        semesterNumber: number;
        course: any;
      }>
    ) => {
      const { courseId, semesterNumber, course } = action.payload;

      // Add the API course to draft assignments
      state.draftCourseAssignments.push({
        id: `draft-api-${Date.now()}-${courseId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        courseId,
        course,
        semesterNumber,
        isFromApi: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    addApiCourseGroupToDraft: (
      state,
      action: PayloadAction<{
        coursesGroupId: string;
        semesterNumber: number;
        coursesGroup: any;
      }>
    ) => {
      const { coursesGroupId, semesterNumber, coursesGroup } = action.payload;

      // Add the API course group to draft assignments
      state.draftCourseGroupAssignments.push({
        id: `draft-api-group-${Date.now()}-${coursesGroupId}`,
        trainingRoadmapId: state.currentRoadmap?.id || "",
        coursesGroupId,
        semesterNumber,
        coursesGroup,
        isFromApi: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
      });

      state.unsavedChanges = true;
    },
    initializeFromApiData: (state) => {
      if (!state.currentRoadmap) return;

      // Add all API courses to draft assignments
      const apiCourses = state.currentRoadmap.trainingRoadmapCourses || [];

      apiCourses.forEach((course) => {
        state.draftCourseAssignments.push({
          id: `draft-api-${Date.now()}-${course.courseId}-${course.semesterNumber}`,
          trainingRoadmapId: state.currentRoadmap?.id || "",
          courseId: course.courseId,
          course: course.course,
          semesterNumber: course.semesterNumber,
          isFromApi: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: null,
          updatedBy: null,
        });
      });

      // Add all API course groups to draft assignments
      const apiCourseGroups = state.currentRoadmap.coursesGroupSemesters || [];

      apiCourseGroups.forEach((group) => {
        state.draftCourseGroupAssignments.push({
          id: `draft-api-group-${Date.now()}-${group.coursesGroupId}-${group.semesterNumber}`,
          trainingRoadmapId: state.currentRoadmap?.id || "",
          coursesGroupId: group.coursesGroupId,
          semesterNumber: group.semesterNumber,
          coursesGroup: group.coursesGroup,
          isFromApi: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: null,
          updatedBy: null,
        });
      });
    },
    updateRoadmapStatus: (
      state,
      action: PayloadAction<{ id: string; isActive: boolean }>
    ) => {
      const { id, isActive } = action.payload;
      const roadmap = state.roadmaps.find((r) => r.id === id);

      if (roadmap) {
        roadmap.isActive = isActive;
      }
    },
  },
});

export const {
  setRoadmaps,
  setQuery,
  setFilter,
  setSearchQuery,
  setPage,
  setSort,
  setTotal,
  setLoading,
  setError,
  setCurrentRoadmap,
  addCourseToSemester,
  removeCourseFromSemester,
  replaceCourseInSemester,
  editCourseSemester,
  addCourseGroupToSemester,
  removeCourseGroupFromSemester,
  replaceCourseGroupInSemester,
  saveRoadmapChanges,
  clearDraftAssignments,
  addApiCourseToDraft,
  addApiCourseGroupToDraft,
  initializeFromApiData,
  updateRoadmapStatus,
} = trainingRoadmapSlice.actions;

export default trainingRoadmapSlice.reducer;
