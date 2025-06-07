import { useState } from "react";

import { classService } from "@/services/class/class.service";
import { studentService } from "@/services/student/student.service";
import { AcademicClass } from "@/services/class/class.schema";

interface StudentInfo {
  id: string;
  email: string;
  majorId: string;
  batchId: string;
  major: {
    id: string;
    name: string;
  };
  batch: {
    id: string;
    name: string;
  };
}

export const useEnrollment = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const fetchStudentInfo = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentService.getStudentByEmail(email);

      if (response.success && response.data) {
        setStudentInfo(response.data);

        // Fetch academic classes after getting student info
        if (response.data.majorId && response.data.batchId) {
          await fetchAcademicClasses(
            response.data.majorId,
            response.data.batchId
          );
        }
      } else {
        setError("Failed to fetch student information");
      }
    } catch {
      setError("An error occurred while fetching student information");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicClasses = async (majorId: string, batchId: string) => {
    try {
      setLoadingClasses(true);
      const response = await classService.getClassesByMajorAndBatch(
        majorId,
        batchId
      );

      if (response.data) {
        setAcademicClasses(response.data);
      }
    } catch {
      setError("Failed to fetch available classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  const enrollInClass = async (_classId: string) => {
    // TODO: Implement actual enrollment API call
    try {
      // This would be the actual enrollment API call
      // const response = await enrollmentService.enrollStudent(studentInfo.id, classId);
      return { success: true, message: "Successfully enrolled in class" };
    } catch {
      return { success: false, message: "Failed to enroll in class" };
    }
  };

  return {
    loading,
    error,
    studentInfo,
    academicClasses,
    loadingClasses,
    fetchStudentInfo,
    fetchAcademicClasses,
    enrollInClass,
    setError,
  };
};
