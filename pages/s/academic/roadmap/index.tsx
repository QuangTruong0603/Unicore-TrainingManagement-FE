import React from "react";
import Head from "next/head";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingRoadmapByMajorIdAndBatchId } from "@/services/training-roadmap/training-roadmap.hooks";
import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";
import RoadmapView from "@/components/s/training-roadmap/roadmap-view";
import StudentCourseGroupList from "@/components/s/training-roadmap/StudentCourseGroupList";

import "./index.scss";

const StudentRoadmapPage: React.FC = () => {
  const { isLoading: authLoading, studentInfo } = useAuth();

  // Get training roadmap based on student's major and batch
  const { data, isLoading, isError, refetch } =
    useTrainingRoadmapByMajorIdAndBatchId(
      studentInfo?.majorId || "",
      studentInfo?.batchId || ""
    );

  const roadmap: TrainingRoadmap | undefined = data?.data;

  const [activeTab, setActiveTab] = useState<"roadmap" | "groups">("roadmap");

  // Render loading state
  if (authLoading || isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner color="primary" label="Loading..." />
        </div>
      </DefaultLayout>
    );
  }

  // Render error state or no roadmap found
  if (isError || !roadmap) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Training Roadmap</h1>
            <p className="text-gray-600 mb-6">
              {isError
                ? "Failed to load training roadmap. Please try again later."
                : "No training roadmap found for your major and batch combination."}
            </p>
            <Button color="primary" variant="flat" onPress={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container">
        <Head>
          <title>{roadmap.name} - My Training Roadmap</title>
        </Head>

        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">{roadmap.name}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main information */}
            <Card className="lg:col-span-2">
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-medium">{roadmap.code}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Major</p>
                    <p className="font-medium">
                      {roadmap.majorData
                        ? `${roadmap.majorData.name} (${roadmap.majorData.code})`
                        : roadmap.majorId}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{roadmap.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Summary</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Semesters</p>
                    <p className="text-2xl font-bold">
                      {Math.max(
                        ...(roadmap.trainingRoadmapCourses?.map(
                          (c) => c.semesterNumber
                        ) || []),
                        ...(roadmap.coursesGroupSemesters?.map(
                          (c) => c.semesterNumber
                        ) || [])
                      ) || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold">
                      {roadmap.trainingRoadmapCourses?.length || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total Credits</p>
                    <p className="text-2xl font-bold">
                      {roadmap.trainingRoadmapCourses?.reduce((total, item) => {
                        return total + (item.course?.credit || 0);
                      }, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Pill-style Tabs for Roadmap and Course Groups */}
          {roadmap && (
            <div className="mt-5">
              <div className="flex gap-2 mb-6">
                <button
                  className={`px-4 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === "roadmap" ? "bg-primary-100 text-primary-700 shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  onClick={() => setActiveTab("roadmap")}
                >
                  Roadmap
                </button>
                <button
                  className={`px-4 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === "groups" ? "bg-primary-100 text-primary-700 shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  onClick={() => setActiveTab("groups")}
                >
                  Course Groups
                </button>
              </div>
              {activeTab === "roadmap" && <RoadmapView roadmap={roadmap} />}
              {activeTab === "groups" && (
                <StudentCourseGroupList
                  coursesGroupSemesters={roadmap.coursesGroupSemesters}
                  majorId={roadmap.majorId}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default StudentRoadmapPage;
