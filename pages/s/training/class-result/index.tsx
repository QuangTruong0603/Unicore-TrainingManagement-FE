import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Button,
  Progress,
} from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";
import { useStudentScores } from "@/services/student/student-scores.hooks";
import { useSemesters } from "@/services/semester/semester.hooks";
import { SemesterQuery } from "@/services/semester/semester.schema";
import { StudentScore } from "@/services/student/student-scores.service";
import DefaultLayout from "@/layouts/default";
import "./index.scss";

const ClassResultPage = () => {
  const { user, studentInfo } = useAuth();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  // Fetch semesters for dropdown
  const semesterQuery: SemesterQuery = {
    pageNumber: 1,
    itemsPerpage: 100, // Get all semesters
    isDesc: true,
    orderBy: "year",
  };

  const { data: semestersResponse, isLoading: isLoadingSemesters } =
    useSemesters(semesterQuery);

  // Fetch student scores
  const {
    data: scoresResponse,
    isLoading: isLoadingScores,
    error: scoresError,
    refetch: refetchScores,
  } = useStudentScores(studentInfo?.id || "", selectedSemesterId || "");

  // Set default semester (current active semester)
  useEffect(() => {
    if (semestersResponse?.data?.data && !selectedSemesterId) {
      const activeSemester = semestersResponse.data.data.find(
        (semester) => semester.isActive
      );

      if (activeSemester) {
        setSelectedSemesterId(activeSemester.id);
      }
    }
  }, [semestersResponse, selectedSemesterId]);

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
  };

  const handleRefresh = () => {
    refetchScores();
  };

  // const getScoreTypeName = (scoreType: number) => {
  //   switch (scoreType) {
  //     case 1:
  //       return "Theory";
  //     case 2:
  //       return "Practice";
  //     case 3:
  //       return "Midterm";
  //     case 4:
  //       return "Final";
  //     default:
  //       return "Unknown";
  //   }
  // };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "success";
    if (score >= 7.0) return "primary";
    if (score >= 5.5) return "warning";

    return "danger";
  };

  const getPassedStatusColor = (isPassed: boolean) => {
    return isPassed ? "success" : "danger";
  };

  const getPassedStatusText = (isPassed: boolean) => {
    return isPassed ? "Passed" : "Failed";
  };

  const formatScore = (score: number) => {
    return score.toFixed(1);
  };

  const getComponentScore = (scores: any[], scoreType: number) => {
    const score = scores.find((s) => s.scoreType === scoreType);

    return score ? score.score : null;
  };

  // Calculate semester GPA based on credits
  const calculateSemesterGPA = (scores: StudentScore[]) => {
    if (!scores || scores.length === 0) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    scores.forEach((score) => {
      if (score.isPassed) {
        // Convert score to grade points (assuming 10-point scale)
        let gradePoints = 0;

        if (score.overallScore >= 8.5) gradePoints = 4.0;
        else if (score.overallScore >= 7.0) gradePoints = 3.0;
        else if (score.overallScore >= 5.5) gradePoints = 2.0;
        else if (score.overallScore >= 4.0) gradePoints = 1.0;
        else gradePoints = 0.0;

        totalGradePoints += gradePoints * score.totalCredits;
        totalCredits += score.totalCredits;
      }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  };

  // Calculate total credits for the semester
  const calculateTotalCredits = (scores: StudentScore[]) => {
    return scores.reduce((total, score) => total + score.totalCredits, 0);
  };

  if (!user || !studentInfo) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <p>Please login to view academic results</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Academic Results</h1>
              <p className="text-gray-600 mt-1">
                View your academic performance for each semester
              </p>
            </div>
          </div>

          <Select
            isLoading={isLoadingSemesters}
            label="Select Semester"
            placeholder="Choose a semester"
            selectedKeys={selectedSemesterId ? [selectedSemesterId] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;

              handleSemesterChange(selectedKey);
            }}
          >
            {semestersResponse?.data?.data?.map((semester) => (
              <SelectItem key={semester.id}>
                {`Semester ${semester.semesterNumber} - ${semester.year} ${
                  semester.isActive ? "(Active)" : ""
                }`}
              </SelectItem>
            )) || []}
          </Select>

          {/* Academic Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold">Academic Performance</h2>
                {scoresResponse?.data && (
                  <Chip color="primary" variant="flat">
                    {scoresResponse.data.length} courses
                  </Chip>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {isLoadingScores ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : scoresError ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Error loading academic data</p>
                  <Button
                    className="mt-4"
                    color="primary"
                    variant="ghost"
                    onPress={handleRefresh}
                  >
                    Try Again
                  </Button>
                </div>
              ) : !scoresResponse?.data || scoresResponse.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No academic data found for the selected semester
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    isHeaderSticky
                    isStriped
                    aria-label="Academic results table"
                  >
                    <TableHeader>
                      <TableColumn>COURSE CODE</TableColumn>
                      <TableColumn>COURSE NAME</TableColumn>
                      <TableColumn>CLASS</TableColumn>
                      <TableColumn>CREDITS</TableColumn>
                      <TableColumn>THEORY</TableColumn>
                      <TableColumn>PRACTICE</TableColumn>
                      <TableColumn>MIDTERM</TableColumn>
                      <TableColumn>FINAL</TableColumn>
                      <TableColumn>OVERALL</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {scoresResponse.data.map((score: StudentScore) => (
                        <TableRow key={score.id}>
                          <TableCell>
                            <div className="font-medium">
                              {score.courseCode}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">
                                {score.courseName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {score.academicClassName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip color="secondary" size="sm" variant="flat">
                              {score.totalCredits} credits
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const theoryScore = getComponentScore(
                                score.componentScores,
                                1
                              );

                              return theoryScore !== null ? (
                                <Chip
                                  color={getScoreColor(theoryScore)}
                                  size="sm"
                                  variant="flat"
                                >
                                  {formatScore(theoryScore)}
                                </Chip>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const practiceScore = getComponentScore(
                                score.componentScores,
                                2
                              );

                              return practiceScore !== null ? (
                                <Chip
                                  color={getScoreColor(practiceScore)}
                                  size="sm"
                                  variant="flat"
                                >
                                  {formatScore(practiceScore)}
                                </Chip>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const midtermScore = getComponentScore(
                                score.componentScores,
                                3
                              );

                              return midtermScore !== null ? (
                                <Chip
                                  color={getScoreColor(midtermScore)}
                                  size="sm"
                                  variant="flat"
                                >
                                  {formatScore(midtermScore)}
                                </Chip>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const finalScore = getComponentScore(
                                score.componentScores,
                                4
                              );

                              return finalScore !== null ? (
                                <Chip
                                  color={getScoreColor(finalScore)}
                                  size="sm"
                                  variant="flat"
                                >
                                  {formatScore(finalScore)}
                                </Chip>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Chip
                                color={getScoreColor(score.overallScore)}
                                size="sm"
                                variant="flat"
                              >
                                {formatScore(score.overallScore)}
                              </Chip>
                              <Progress
                                className="w-16"
                                color={getScoreColor(score.overallScore)}
                                size="sm"
                                value={score.overallScore * 10}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={getPassedStatusColor(score.isPassed)}
                              size="sm"
                              variant="flat"
                            >
                              {getPassedStatusText(score.isPassed)}
                            </Chip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Summary Statistics */}
          {scoresResponse?.data && scoresResponse.data.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Summary</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {scoresResponse.data.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {
                        scoresResponse.data.filter((score) => score.isPassed)
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Passed Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {
                        scoresResponse.data.filter((score) => !score.isPassed)
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Failed Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {calculateTotalCredits(scoresResponse.data)}
                    </p>
                    <p className="text-sm text-gray-600">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-info">
                      {(
                        scoresResponse.data.reduce(
                          (sum, score) => sum + score.overallScore,
                          0
                        ) / scoresResponse.data.length
                      ).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {calculateSemesterGPA(scoresResponse.data).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Semester GPA</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ClassResultPage;
