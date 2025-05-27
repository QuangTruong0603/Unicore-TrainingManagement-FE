import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Student, StudentQuery } from "@/services/student/student.schema";
import {
  StudentProfile,
  Address,
  Guardian,
} from "@/components/s/sutdent-info/types";
import { UpdateStudentProfileData } from "@/services/student/student.service";

export interface PaginatedResponse {
  success: boolean;
  data: {
    data: Student[];
    total: number;
  };
  errors: string[];
}

export interface ProfileResponse {
  success: boolean;
  data: StudentProfile;
  errors?: string[];
}

interface StudentState {
  students: PaginatedResponse | null;
  studentProfile: StudentProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  profileUpdateData: UpdateStudentProfileData;
  hasProfileChanges: boolean;
  query: StudentQuery;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: null,
  studentProfile: null,
  profileLoading: false,
  profileError: null,
  profileUpdateData: {},
  hasProfileChanges: false,
  query: {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    itemsPerpage: 10,
    searchQuery: "",
    by: undefined,
    isDesc: false,
  },
  total: 0,
  isLoading: false,
  error: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<PaginatedResponse>) => {
      state.students = action.payload;
      state.total = action.payload.data.total;
    },
    setQuery: (state, action: PayloadAction<StudentQuery>) => {
      state.query = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStudentProfile: (state, action: PayloadAction<StudentProfile>) => {
      state.studentProfile = {
        ...action.payload,
        guardians: action.payload.guardians || [],
        address: action.payload.address || {
          id: "",
          country: "",
          city: "",
          district: "",
          ward: "",
          addressDetail: "",
        },
        imageUrl: action.payload.imageUrl || "",
        phoneNumber: action.payload.phoneNumber || "",
        firstName: action.payload.firstName || "",
        lastName: action.payload.lastName || "",
        email: action.payload.email || "",
        studentCode: action.payload.studentCode || "",
        status: action.payload.status || "",
        majorName: action.payload.majorName || "",
        batchName: action.payload.batchName || "",
        batchYear: action.payload.batchYear || 0,
      };
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.profileLoading = action.payload;
    },
    setProfileError: (state, action: PayloadAction<string | null>) => {
      state.profileError = action.payload;
    },
    updateProfileImage: (state, action: PayloadAction<string>) => {
      if (
        state.studentProfile &&
        state.studentProfile.imageUrl !== action.payload
      ) {
        state.profileUpdateData = {
          ...state.profileUpdateData,
          imageUrl: action.payload,
        };
        state.hasProfileChanges = true;
      }
    },
    updateProfilePhone: (state, action: PayloadAction<string>) => {
      if (
        state.studentProfile &&
        state.studentProfile.phoneNumber !== action.payload
      ) {
        state.profileUpdateData = {
          ...state.profileUpdateData,
          phoneNumber: action.payload,
        };
        state.hasProfileChanges = true;
      }
    },
    updateProfileAddress: (state, action: PayloadAction<Address>) => {
      if (state.studentProfile) {
        state.profileUpdateData = {
          ...state.profileUpdateData,
          address: action.payload,
        };
        state.hasProfileChanges = true;
      }
    },
    updateProfileGuardians: (state, action: PayloadAction<Guardian[]>) => {
      if (state.studentProfile) {
        state.profileUpdateData = {
          ...state.profileUpdateData,
          guardians: action.payload,
        };
        state.hasProfileChanges = true;
      }
    },
    clearProfileChanges: (state) => {
      state.profileUpdateData = {};
      state.hasProfileChanges = false;
    },
    resetState: (state) => {
      state.students = null;
      state.query = initialState.query;
      state.total = 0;
      state.isLoading = false;
      state.error = null;
      state.studentProfile = null;
      state.profileLoading = false;
      state.profileError = null;
      state.profileUpdateData = {};
      state.hasProfileChanges = false;
    },
  },
});

export const {
  setStudents,
  setQuery,
  setTotal,
  setLoading,
  setError,
  setStudentProfile,
  setProfileLoading,
  setProfileError,
  updateProfileImage,
  updateProfilePhone,
  updateProfileAddress,
  updateProfileGuardians,
  clearProfileChanges,
  resetState,
} = studentSlice.actions;

export default studentSlice.reducer;
