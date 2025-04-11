import { useQuery } from "@tanstack/react-query";
import { courseService } from "./course.service";
import { CourseQuery } from "./course.schema";

export const useCourses = (query: CourseQuery) => {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => courseService.getCourses(query)
  });
}; 