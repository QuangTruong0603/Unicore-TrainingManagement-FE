import { useQuery } from "@tanstack/react-query";

import { studentScoresService } from "./student-scores.service";

export const useStudentScores = (studentId: string, semesterId: string) => {
  return useQuery({
    queryKey: ["student-scores", studentId, semesterId],
    queryFn: () => studentScoresService.getStudentScores(studentId, semesterId),
    enabled: !!studentId && !!semesterId,
  });
};
