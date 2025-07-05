import { useQuery } from "@tanstack/react-query";

import { lecturerService } from "./lecturer.service";
import { LecturerQuery } from "./lecturer.schema";

export const useLecturers = (query: LecturerQuery) => {
  return useQuery({
    queryKey: ["lecturers", query],
    queryFn: () => lecturerService.getLecturers(query),
  });
};

export const useLecturerById = (lecturerId: string | undefined) => {
  return useQuery({
    queryKey: ["lecturer", lecturerId],
    queryFn: () => lecturerService.getLecturerById(lecturerId!),
    enabled: !!lecturerId,
  });
};

export const useLecturersByMajors = (
  majorIds: string[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["lecturers-by-majors", majorIds],
    queryFn: () => lecturerService.getLecturersByMajorsDepartment(majorIds),
    enabled: enabled && majorIds.length > 0,
  });
};