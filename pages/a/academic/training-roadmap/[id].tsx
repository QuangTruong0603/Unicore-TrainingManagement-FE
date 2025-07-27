import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Button, Card, CardBody, Spinner, Tabs, Tab } from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { useTrainingRoadmap } from "@/services/training-roadmap/training-roadmap.hooks";
import { TrainingRoadmap } from "@/services/training-roadmap/training-roadmap.schema";
import CourseAssignment from "@/components/a/training-roadmap/course-assignment";
import CourseGroupAssignment from "@/components/a/training-roadmap/course-group-assignment";
import "./index.scss";

const TrainingRoadmapDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isError, refetch } = useTrainingRoadmap(
    id as string
  );
  const roadmap: TrainingRoadmap = data?.data;

  // Render loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner color="primary" label="Loading..." />
        </div>
      </DefaultLayout>
    );
  }

  // Render error state
  if (isError || !roadmap) {
    return (
      <DefaultLayout>
        <div className="p-6 text-center" />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div>
        <Head>
          <title>{roadmap.name} - Training Roadmap</title>
        </Head>

        <div className="container mx-auto py-6 px-4">
          <div className="mb-6">
            <Link passHref href="/a/academic/training-roadmap">
              <Button color="default" variant="flat">
                Back to Training Roadmaps
              </Button>
            </Link>
          </div>

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
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold">
                      {roadmap.trainingRoadmapCourses.length || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total Credits</p>
                    <p className="text-2xl font-bold">
                      {roadmap.trainingRoadmapCourses.reduce((total, item) => {
                        return total + (item.course?.credit || 0);
                      }, 0)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tabs for Course Assignment and Course Group Assignment */}
          <div className="mt-5">
            <Tabs aria-label="Training Roadmap Management">
              <Tab key="courses" title="Course Assignment">
                <CourseAssignment roadmap={roadmap} onUpdate={refetch} />
              </Tab>
              <Tab key="groups" title="Course Group Management">
                <CourseGroupAssignment roadmap={roadmap} onUpdate={refetch} />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TrainingRoadmapDetailPage;
