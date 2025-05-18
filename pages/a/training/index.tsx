import React from "react";
import Head from "next/head";
import { Button } from "@heroui/react";
import { useRoutePrefix } from "@/hooks/useRoutePrefix";

import DefaultLayout from "../../../layouts/default";

const TrainingPage = () => {
  const { push } = useRoutePrefix();

  return (
    <>
      <Head>
        <title>Training Portal</title>
      </Head>
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Training Portal</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Courses</h2>
              <p className="text-gray-600 mb-4">
                Browse and manage all university courses.
              </p>
              <Button color="primary" onPress={() => push("/training/courses")}>
                View Courses
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Class Schedule</h2>
              <p className="text-gray-600 mb-4">
                View and manage class schedules.
              </p>
              <Button
                color="primary"
                onPress={() => push("/training/class-schedule")}
              >
                View Schedule
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Exam Schedule</h2>
              <p className="text-gray-600 mb-4">
                Access exam schedules and details.
              </p>
              <Button
                color="primary"
                onPress={() => push("/training/exam-schedule")}
              >
                View Exams
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <p className="text-gray-600 mb-4">
                Access educational documents and resources.
              </p>
              <Button
                color="primary"
                onPress={() => push("/training/documents")}
              >
                View Documents
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">
                Program Specification
              </h2>
              <p className="text-gray-600 mb-4">
                View program and curriculum details.
              </p>
              <Button
                color="primary"
                onPress={() => push("/training/program-specification")}
              >
                View Details
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Majors</h2>
              <p className="text-gray-600 mb-4">
                Explore academic majors and specializations.
              </p>
              <Button color="primary" onPress={() => push("/training/majors")}>
                View Majors
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Students</h2>
              <p className="text-gray-600 mb-4">
                Explore academic majors and specializations.
              </p>
              <Button
                color="primary"
                onPress={() => push("/training/students")}
              >
                View Students
              </Button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default TrainingPage;
