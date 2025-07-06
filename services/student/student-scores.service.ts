import { enrollmentClient } from "../api/http-client";
import { API_ENDPOINTS } from "../api/api-config";

export interface ComponentScore {
  scoreTypeId: string;
  scoreType: number;
  score: number;
  percentage: number;
}

export interface PracticeScore {
  scoreTypeId: string;
  scoreType: number;
  score: number;
  percentage: number;
}

export interface StudentScore {
  id: string;
  studentId: string;
  academicClassId: string;
  academicClassName: string;
  courseName: string;
  courseCode: string;
  overallScore: number;
  isPassed: boolean;
  componentScores: ComponentScore[];
  practiceScores: PracticeScore[];
  totalCredits: number;
}

export interface StudentScoresResponse {
  success: boolean;
  data: StudentScore[];
  errors: string[] | null;
}

export const studentScoresService = {
  getStudentScores: async (
    studentId: string,
    semesterId: string
  ): Promise<StudentScoresResponse> => {
    return enrollmentClient.get(
      `${API_ENDPOINTS.ENROLLMENTS}/student/${studentId}/scores?semesterId=${semesterId}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  },
};
