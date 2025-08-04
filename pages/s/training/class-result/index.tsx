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

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined || score === -1) return "default";
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

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined || score === -1) {
      return "-";
    }

    return score.toFixed(1);
  };

  const getComponentScore = (scores: any[], scoreType: number) => {
    if (!scores || scores.length === 0) return null;

    const score = scores.find((s) => s.scoreType === scoreType);

    return score && score.score !== -1 ? score.score : null;
  };

  // Group scores by course and merge them
  const groupScoresByCourse = (scores: StudentScore[]) => {
    const courseGroups = new Map<string, StudentScore[]>();

    scores.forEach((score) => {
      const courseKey = `${score.courseCode}-${score.courseName}`;

      if (!courseGroups.has(courseKey)) {
        courseGroups.set(courseKey, []);
      }
      courseGroups.get(courseKey)!.push(score);
    });

    return Array.from(courseGroups.entries()).map(
      ([courseKey, courseScores]) => {
        const [courseCode, courseName] = courseKey.split("-", 2);

        // Merge all component scores from all classes of this course
        const allComponentScores = courseScores.flatMap(
          (score) => score.componentScores || []
        );

        // Get the best overall score (highest non-null score)
        const validOverallScores = courseScores
          .map((score) => score.overallScore)
          .filter(
            (score) => score !== null && score !== undefined && score !== -1
          );

        const bestOverallScore =
          validOverallScores.length > 0
            ? Math.max(...validOverallScores)
            : null;

        // Determine if passed (passed if any class is passed)
        const isPassed = courseScores.some((score) => score.isPassed);

        // Get total credits (should be the same for all classes of the same course)
        const totalCredits = courseScores[0]?.totalCredits || 0;

        return {
          id: courseKey,
          courseCode,
          courseName,
          totalCredits,
          overallScore: bestOverallScore,
          isPassed,
          componentScores: allComponentScores,
          academicClassName: courseScores
            .map((s) => s.academicClassName)
            .join(", "),
        };
      }
    );
  };

  // Calculate semester GPA based on credits
  const calculateSemesterGPA = (scores: any[]) => {
    if (!scores || scores.length === 0) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    scores.forEach((score) => {
      if (
        score.isPassed &&
        score.overallScore !== null &&
        score.overallScore !== undefined &&
        score.overallScore !== -1
      ) {
        // Convert score to grade points (assuming 10-point scale)
        let gradePoints = 0;

        if (score.overallScore >= 8.5) gradePoints = 4.0;
        else if (score.overallScore >= 7.0) gradePoints = 3.0;
        else if (score.overallScore >= 5.5) gradePoints = 2.0;
        else if (score.overallScore >= 4.0) gradePoints = 1.0;
        else gradePoints = 0.0;

        totalGradePoints += gradePoints * (score.totalCredits || 0);
        totalCredits += score.totalCredits || 0;
      }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
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
                    {groupScoresByCourse(scoresResponse.data).length} courses
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
                      <TableColumn>THEORY</TableColumn>
                      <TableColumn>PRACTICE</TableColumn>
                      <TableColumn>MIDTERM</TableColumn>
                      <TableColumn>FINAL</TableColumn>
                      <TableColumn>OVERALL</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {groupScoresByCourse(scoresResponse.data).map(
                        (score: any) => (
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
                                  value={
                                    score.overallScore !== null &&
                                    score.overallScore !== undefined &&
                                    score.overallScore !== -1
                                      ? score.overallScore * 10
                                      : 0
                                  }
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
                        )
                      )}
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
                      {groupScoresByCourse(scoresResponse.data).length}
                    </p>
                    <p className="text-sm text-gray-600">Total Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {
                        groupScoresByCourse(scoresResponse.data).filter(
                          (score) => score.isPassed
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Passed Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {
                        groupScoresByCourse(scoresResponse.data).filter(
                          (score) => !score.isPassed
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Failed Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {groupScoresByCourse(scoresResponse.data).reduce(
                        (total, score) => total + (score.totalCredits || 0),
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-info">
                      {groupScoresByCourse(scoresResponse.data).length > 0
                        ? (() => {
                            const validScores = groupScoresByCourse(
                              scoresResponse.data
                            ).filter(
                              (score) =>
                                score.overallScore !== null &&
                                score.overallScore !== undefined &&
                                score.overallScore !== -1
                            );

                            return validScores.length > 0
                              ? (
                                  validScores.reduce(
                                    (sum, score) =>
                                      sum + (score.overallScore || 0),
                                    0
                                  ) / validScores.length
                                ).toFixed(1)
                              : "0.0";
                          })()
                        : "0.0"}
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {calculateSemesterGPA(
                        groupScoresByCourse(scoresResponse.data)
                      ).toFixed(2)}
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
