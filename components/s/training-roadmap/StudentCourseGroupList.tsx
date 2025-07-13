import React from "react";
import { Card, CardBody, Spinner } from "@heroui/react";

import {
  useCourseGroupsByMajorId,
  useOpenForAllCourseGroups,
} from "@/services/training-roadmap/training-roadmap.hooks";

interface StudentCourseGroupListProps {
  coursesGroupSemesters: any[];
  majorId: string;
}

const StudentCourseGroupList: React.FC<StudentCourseGroupListProps> = ({
  coursesGroupSemesters,
  majorId,
}) => {
  const { data: majorGroupsData, isLoading: loadingMajor } =
    useCourseGroupsByMajorId(majorId);
  const { data: openForAllGroupsData, isLoading: loadingOpen } =
    useOpenForAllCourseGroups();

  const allGroups = [
    ...(majorGroupsData?.data || []),
    ...(openForAllGroupsData?.data || []),
  ];

  // Only show groups referenced in the roadmap, deduplicated by group name
  const filteredGroupsRaw = (coursesGroupSemesters || []).map(
    (groupSemester) => {
      const fullGroup = allGroups.find(
        (g: any) => g.id === groupSemester.coursesGroupId
      );

      return {
        ...groupSemester,
        courses: fullGroup?.courses || [],
        credit: fullGroup?.credit ?? groupSemester.credit,
      };
    }
  );
  // Deduplicate by coursesGroupName
  const filteredGroupsMap = new Map();

  filteredGroupsRaw.forEach((group) => {
    if (!filteredGroupsMap.has(group.coursesGroupName)) {
      filteredGroupsMap.set(group.coursesGroupName, group);
    }
  });
  const filteredGroups = Array.from(filteredGroupsMap.values());

  if (loadingMajor || loadingOpen) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner color="primary" label="Loading course groups..." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGroups.map((group) => (
        <Card key={group.id} className="h-full flex flex-col">
          <CardBody className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold">{group.coursesGroupName}</h4>
              <span className="text-xs text-gray-500">
                {group.credit} credits
              </span>
            </div>
            <div className="overflow-x-auto">
              {group.courses.length > 0 ? (
                <table className="min-w-full text-sm border rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Credits
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.courses.map((course: any) => (
                      <tr key={course.id}>
                        <td className="px-3 py-2">{course.name}</td>
                        <td className="px-3 py-2">{course.credit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-400 text-sm py-4 text-center">
                  No courses in this group.
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
      {filteredGroups.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No course groups found in this roadmap.
        </div>
      )}
    </div>
  );
};

export default StudentCourseGroupList;
