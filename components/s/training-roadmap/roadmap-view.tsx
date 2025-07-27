import React, { useState } from "react";
import { Card, CardBody, Chip, Badge, Button } from "@heroui/react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";

interface RoadmapViewProps {
  roadmap: TrainingRoadmap;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get all unique semester numbers
  const allSemesterNumbers = [
    ...(roadmap.trainingRoadmapCourses?.map((c) => c.semesterNumber) || []),
    ...(roadmap.coursesGroupSemesters?.map((c) => c.semesterNumber) || []),
  ];
  const uniqueSemesters = Array.from(new Set(allSemesterNumbers)).sort(
    (a, b) => a - b
  );

  // Group courses by semester
  const coursesBySemester = uniqueSemesters.map((semesterNumber) => {
    const courses =
      roadmap.trainingRoadmapCourses?.filter(
        (c) => c.semesterNumber === semesterNumber
      ) || [];
    const courseGroups =
      roadmap.coursesGroupSemesters?.filter(
        (c) => c.semesterNumber === semesterNumber
      ) || [];
    const totalCredits = [
      ...courses.map((course) => course.course?.credit || 0),
      ...courseGroups.map((group) => group.credit || 0),
    ].reduce((a, b) => a + b, 0);

    return {
      semesterNumber,
      courses,
      courseGroups,
      totalCredits,
    };
  });

  // Group semesters into slides of 3
  const slides = [];

  for (let i = 0; i < coursesBySemester.length; i += 3) {
    const semesterGroup = coursesBySemester.slice(i, i + 3);

    slides.push({
      type: "semesterGroup",
      title: `Semesters ${semesterGroup.map((s) => s.semesterNumber).join(", ")}`,
      content: semesterGroup,
    });
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative">
      {/* Navigation Buttons (no dots) */}
      <div className="flex justify-between items-center mb-6">
        <Button
          isIconOnly
          color="default"
          disabled={slides.length <= 1}
          variant="flat"
          onPress={prevSlide}
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="flex-1" />
        <Button
          isIconOnly
          color="default"
          disabled={slides.length <= 1}
          variant="flat"
          onPress={nextSlide}
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Slide Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentSlideData.content.map((semester) => (
            <Card
              key={semester.semesterNumber}
              className="h-full flex flex-col"
            >
              <CardBody className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Semester {semester.semesterNumber}
                  </h4>
                  <Badge color="primary" size="sm" variant="flat">
                    {semester.totalCredits} credits
                  </Badge>
                </div>

                {/* Courses */}
                {semester.courses.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-sm font-medium text-gray-600 mb-1">
                      Courses
                    </h5>
                    <div className="space-y-2">
                      {semester.courses.map((courseItem) => (
                        <div
                          key={courseItem.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {courseItem.course?.name}
                            </p>
                            <p className="text-xs text-gray-500 mb-0.5">
                              {courseItem.course?.credit || 0} credits
                            </p>
                          </div>
                          <Chip color="warning" size="sm" variant="flat">
                            Course
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups */}
                {semester.courseGroups.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">
                      Groups
                    </h5>
                    <div className="space-y-2">
                      {semester.courseGroups.map((courseGroup) => (
                        <div
                          key={courseGroup.id}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {courseGroup.coursesGroupName}
                            </p>
                            <p className="text-xs text-gray-500 mb-0.5">
                              {courseGroup.credit || 0} credits
                            </p>
                          </div>
                          <Chip color="secondary" size="sm" variant="flat">
                            Group
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {semester.courses.length === 0 &&
                  semester.courseGroups.length === 0 && (
                    <div className="text-center py-4">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">No courses</p>
                    </div>
                  )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
