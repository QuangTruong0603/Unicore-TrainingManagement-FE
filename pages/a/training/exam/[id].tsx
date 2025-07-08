import React from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Button,
} from "@heroui/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";

import { useExamById } from "@/services/exam/exam.hooks";
import { EnrollmentExamReadDto } from "@/services/exam/exam.schema";
import DefaultLayout from "@/layouts/default";

const examTypeMap: Record<number, string> = {
  1: "Midterm",
  2: "Final",
  3: "Quiz",
  4: "Lab",
  5: "Practical",
};

export default function ExamDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: examResponse, isLoading, error } = useExamById(id as string);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !examResponse?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">
          Failed to load exam details
        </div>
        <Button startContent={<ArrowLeft size={16} />} onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const exam = examResponse.data;

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "PPP p");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            className="mb-4"
            startContent={<ArrowLeft size={16} />}
            variant="light"
            onClick={handleBack}
          >
            Back to Exams
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Details
          </h1>
          <p className="text-gray-600">
            View detailed information about this exam
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar size={20} />
                Exam Information
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exam Type:</span>
                <Chip color="primary" variant="flat">
                  {examTypeMap[exam.type] || `Type ${exam.type}`}
                </Chip>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Group:</span>
                <Chip color="default" variant="flat">
                  Group {exam.group}
                </Chip>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date & Time:</span>
                <div className="text-right">
                  <div className="font-medium">
                    {formatDateTime(exam.examTime)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration:</span>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="font-medium">
                    {formatDuration(exam.duration)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen size={20} />
                Class & Location
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">
                  {exam.academicClass?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Room:</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="font-medium">
                    {exam.room?.name || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Seats:</span>
                <span className="font-medium">
                  {exam.room?.availableSeats || "N/A"}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Enrolled Students List */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users size={20} />
                Enrolled Students
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              {exam.enrollmentExams && exam.enrollmentExams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Student Code
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Full Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {exam.enrollmentExams.map(
                        (enrollment: EnrollmentExamReadDto, idx: number) => (
                          <tr key={enrollment.id}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {enrollment.student?.studentCode || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {enrollment.student?.user?.fullName || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {enrollment.student?.user?.email || "-"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">
                  No students enrolled in this exam.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
