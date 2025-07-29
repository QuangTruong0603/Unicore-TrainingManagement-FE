import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Spinner,
  Button,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@heroui/react";
import {
  Download,
  Upload,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { addToast } from "@heroui/react";

import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { classService } from "@/services/class/class.service";
import DefaultLayout from "@/layouts/default";
import { AcademicClass } from "@/services/class/class.schema";
import { ImportScoreModal } from "@/components/a/material/import-score-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  startEdit,
  cancelEdit,
  updateScoreField,
  saveEdit,
  clearAllEdits,
} from "@/store/slices/scoreEditSlice";

interface StudentResult {
  studentId: string;
  studentCode: string;
  studentName: string;
  results: {
    id: string;
    score: number;
    scoreTypeId: string;
    scoreTypeName: string;
    scoreTypePercentage: number;
  }[];
}

export default function ClassScorePage() {
  const router = useRouter();
  const { classId } = router.query;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scoreTypes, setScoreTypes] = useState<
    { id: string; name: string; percentage: number }[]
  >([]);
  const [classInfo, setClassInfo] = useState<AcademicClass | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const dispatch = useAppDispatch();
  const { editingStudentCode, edits } = useAppSelector(
    (state) => state.scoreEdit
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!classId || typeof window === "undefined") return;
    setLoadingClass(true);
    classService
      .getClassById(classId as string)
      .then((res) => {
        setClassInfo(res.data);
      })
      .catch(() => setClassInfo(null))
      .finally(() => setLoadingClass(false));
  }, [classId]);

  useEffect(() => {
    if (!classId || typeof window === "undefined") return;
    setLoading(true);
    enrollmentService
      .getStudentResultsByClassId(classId as string)
      .then((res) => {
        if (res.success) {
          setData(res.data);
          // Get all unique score types
          const allTypes: { id: string; name: string; percentage: number }[] =
            [];

          res.data.forEach((sv: StudentResult) => {
            sv.results.forEach((r) => {
              if (!allTypes.find((t) => t.id === r.scoreTypeId)) {
                allTypes.push({
                  id: r.scoreTypeId,
                  name: r.scoreTypeName,
                  percentage: r.scoreTypePercentage,
                });
              }
            });
          });
          setScoreTypes(allTypes.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          setError("Failed to fetch data.");
        }
      })
      .catch(() => setError("API error."))
      .finally(() => setLoading(false));
  }, [classId]);

  // Export Template: Student Code + score columns (empty), no Student Name
  const handleExportTemplate = () => {
    const wsData: any[] = [];
    // Header
    const header = [
      "Student Code",
      ...scoreTypes.map((type) => `${type.name} (${type.percentage}%)`),
    ];

    wsData.push(header);
    // Body
    data.forEach((sv) => {
      wsData.push([sv.studentCode, ...scoreTypes.map(() => "")]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `class_score_template_${classId}.xlsx`);
  };

  // Export Data: Student Code, Student Name, score columns (actual value)
  const handleExportData = (format: "excel" | "pdf") => {
    const wsData: any[] = [];
    // Header
    const header = [
      "Student Code",
      "Student Name",
      ...scoreTypes.map((type) => `${type.name} (${type.percentage}%)`),
    ];

    wsData.push(header);
    // Body
    data.forEach((sv) => {
      wsData.push([
        sv.studentCode,
        sv.studentName,
        ...scoreTypes.map((type) => {
          const result = sv.results.find((r) => r.scoreTypeId === type.id);

          return result ? (result.score === -1 ? "" : result.score) : "";
        }),
      ]);
    });

    switch (format) {
      case "excel":
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Scores");
        XLSX.writeFile(wb, `class_score_${classId}.xlsx`);
        break;
      case "pdf":
        // For PDF, we'll create a simple HTML table and print it
        const htmlContent = `
          <html>
            <head>
              <title>Class Score Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Class Score Report</h1>
                <p>Class: ${classInfo?.name || "N/A"}</p>
                <p>Course: ${classInfo?.course?.name || "N/A"}</p>
                <p>Semester: ${classInfo?.semester?.semesterNumber}/${classInfo?.semester?.year || "N/A"}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    ${header.map((h) => `<th>${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${wsData
                    .slice(1)
                    .map(
                      (row) =>
                        `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join("")}</tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `;

        if (typeof window !== "undefined") {
          const printWindow = window.open("", "_blank");

          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
          }
        }
        break;
    }
  };

  // Import điểm từ file Excel qua modal
  const handleImportModalSubmit = async (file: File) => {
    if (!classId || typeof window === "undefined") return;
    setIsImporting(true);
    try {
      const res = await enrollmentService.importStudentResults(
        classId as string,
        file
      );

      if (res.success) {
        addToast({ title: "Import scores successfully!", color: "success" });
        // Reload data
        enrollmentService
          .getStudentResultsByClassId(classId as string)
          .then((res) => {
            if (res.success) {
              setData(res.data);
              // Update scoreTypes
              const allTypes: {
                id: string;
                name: string;
                percentage: number;
              }[] = [];

              res.data.forEach((sv: StudentResult) => {
                sv.results.forEach((r) => {
                  if (!allTypes.find((t) => t.id === r.scoreTypeId)) {
                    allTypes.push({
                      id: r.scoreTypeId,
                      name: r.scoreTypeName,
                      percentage: r.scoreTypePercentage,
                    });
                  }
                });
              });
              setScoreTypes(
                allTypes.sort((a, b) => a.name.localeCompare(b.name))
              );
            }
          });
        setIsImportModalOpen(false);
      } else {
        addToast({ title: "Import failed!", color: "danger" });
      }
    } catch {
      addToast({ title: "Import failed!", color: "danger" });
    } finally {
      setIsImporting(false);
    }
  };

  // Handler for Save Changes
  const handleSaveChanges = async () => {
    if (!classId || edits.length === 0 || typeof window === "undefined") return;
    setIsSaving(true);
    try {
      const res = await enrollmentService.updateStudentScores(
        classId as string,
        { scores: edits }
      );

      if (res.success) {
        addToast({ title: "Scores updated successfully!", color: "success" });
        // Reload data
        enrollmentService
          .getStudentResultsByClassId(classId as string)
          .then((res) => {
            if (res.success) {
              setData(res.data);
              // Update scoreTypes
              const allTypes: {
                id: string;
                name: string;
                percentage: number;
              }[] = [];

              res.data.forEach((sv: StudentResult) => {
                sv.results.forEach((r) => {
                  if (!allTypes.find((t) => t.id === r.scoreTypeId)) {
                    allTypes.push({
                      id: r.scoreTypeId,
                      name: r.scoreTypeName,
                      percentage: r.scoreTypePercentage,
                    });
                  }
                });
              });
              setScoreTypes(
                allTypes.sort((a, b) => a.name.localeCompare(b.name))
              );
            }
          });
        dispatch(clearAllEdits());
      } else {
        addToast({ title: "Update failed!", color: "danger" });
      }
    } catch {
      addToast({ title: "Update failed!", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Class Scoreboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and update student scores
                </p>
              </div>
            </div>

            {loadingClass ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500">
                  Loading class information...
                </span>
              </div>
            ) : classInfo ? (
              <Card className="w-full max-w-4xl">
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          CLASS NAME
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {classInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          GROUP
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          Group {classInfo.groupNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          SEMESTER
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {classInfo.semester?.semesterNumber}/
                          {classInfo.semester?.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          COURSE
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {classInfo.course?.code} - {classInfo.course?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          CAPACITY
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {classInfo.capacity} students
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          ENROLLED
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">
                            {classInfo.enrollmentCount}
                          </p>
                          <Badge
                            color={
                              classInfo.enrollmentCount >= classInfo.capacity
                                ? "danger"
                                : "success"
                            }
                            size="sm"
                            variant="flat"
                          >
                            {classInfo.enrollmentCount >= classInfo.capacity
                              ? "Full"
                              : "Available"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="w-full max-w-2xl">
                <CardBody>
                  <div className="flex items-center gap-3 text-red-500">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Class information not found
                      </p>
                      <p className="text-xs text-gray-500">
                        Please check the class ID and try again
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                color="success"
                isDisabled={edits.length === 0}
                isLoading={isSaving}
                startContent={<Download className="w-4 h-4" />}
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    color="primary"
                    startContent={<Download className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Export Data
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Export Format"
                  onAction={(key) => {
                    if (key === "excel" || key === "pdf") {
                      handleExportData(key);
                    }
                  }}
                >
                  <DropdownItem
                    key="excel"
                    startContent={<FileSpreadsheet className="w-4 h-4" />}
                  >
                    Export as Excel
                  </DropdownItem>
                  <DropdownItem
                    key="pdf"
                    startContent={<FileText className="w-4 h-4" />}
                  >
                    Export as PDF
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                color="warning"
                startContent={<Upload className="w-4 h-4" />}
                variant="bordered"
                onClick={() => setIsImportModalOpen(true)}
              >
                Import
              </Button>
            </div>

            <ImportScoreModal
              isOpen={isImportModalOpen}
              isSubmitting={isImporting}
              onExportTemplate={handleExportTemplate}
              onOpenChange={() => setIsImportModalOpen(false)}
              onSubmit={handleImportModalSubmit}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : (
          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <Table isHeaderSticky isStriped aria-label="Score table">
                  <TableHeader>
                    {[
                      <TableColumn key="code">Student Code</TableColumn>,
                      <TableColumn key="name">Student Name</TableColumn>,
                      <TableColumn key="theory">Theory</TableColumn>,
                      <TableColumn key="practice">Practice</TableColumn>,
                      <TableColumn key="midterm">Midterm</TableColumn>,
                      <TableColumn key="final">Final</TableColumn>,
                      <TableColumn key="actions">Actions</TableColumn>,
                    ]}
                  </TableHeader>
                  <TableBody
                    emptyContent="No students found"
                    isLoading={loading}
                    loadingContent={<Spinner />}
                  >
                    {data.map((sv) => {
                      const isEditing = editingStudentCode === sv.studentCode;
                      // Helper to get score from results by typeName
                      const getScore = (
                        sv: StudentResult,
                        typeName: string
                      ) => {
                        const result = sv.results.find(
                          (r) => r.scoreTypeName === typeName
                        );

                        return result
                          ? result.score === -1
                            ? null
                            : result.score
                          : null;
                      };
                      const editItem = edits.find(
                        (e) => e.studentCode === sv.studentCode
                      ) || {
                        studentCode: sv.studentCode,
                        theoryScore: getScore(sv, "1"),
                        practiceScore: getScore(sv, "2"),
                        midtermScore: getScore(sv, "3"),
                        finalScore: getScore(sv, "4"),
                      };

                      return (
                        <TableRow key={sv.studentId}>
                          {[
                            <TableCell key="code">{sv.studentCode}</TableCell>,
                            <TableCell key="name">{sv.studentName}</TableCell>,
                            <TableCell key="theory">
                              {isEditing ? (
                                <input
                                  className="border rounded px-1 py-0.5 w-16"
                                  max={10}
                                  min={0}
                                  placeholder={
                                    editItem.theoryScore?.toString() ?? ""
                                  }
                                  type="number"
                                  value={editItem.theoryScore ?? ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateScoreField({
                                        studentCode: sv.studentCode,
                                        field: "theoryScore",
                                        value:
                                          e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                        current: {
                                          theoryScore: editItem.theoryScore,
                                          practiceScore: editItem.practiceScore,
                                          midtermScore: editItem.midtermScore,
                                          finalScore: editItem.finalScore,
                                        },
                                      })
                                    )
                                  }
                                />
                              ) : (
                                getScore(sv, "1")
                              )}
                            </TableCell>,
                            <TableCell key="practice">
                              {isEditing ? (
                                <input
                                  className="border rounded px-1 py-0.5 w-16"
                                  max={10}
                                  min={0}
                                  placeholder={
                                    editItem.practiceScore?.toString() ?? ""
                                  }
                                  type="number"
                                  value={editItem.practiceScore ?? ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateScoreField({
                                        studentCode: sv.studentCode,
                                        field: "practiceScore",
                                        value:
                                          e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                        current: {
                                          theoryScore: editItem.theoryScore,
                                          practiceScore: editItem.practiceScore,
                                          midtermScore: editItem.midtermScore,
                                          finalScore: editItem.finalScore,
                                        },
                                      })
                                    )
                                  }
                                />
                              ) : (
                                getScore(sv, "2")
                              )}
                            </TableCell>,
                            <TableCell key="midterm">
                              {isEditing ? (
                                <input
                                  className="border rounded px-1 py-0.5 w-16"
                                  max={10}
                                  min={0}
                                  placeholder={
                                    editItem.midtermScore?.toString() ?? ""
                                  }
                                  type="number"
                                  value={editItem.midtermScore ?? ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateScoreField({
                                        studentCode: sv.studentCode,
                                        field: "midtermScore",
                                        value:
                                          e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                        current: {
                                          theoryScore: editItem.theoryScore,
                                          practiceScore: editItem.practiceScore,
                                          midtermScore: editItem.midtermScore,
                                          finalScore: editItem.finalScore,
                                        },
                                      })
                                    )
                                  }
                                />
                              ) : (
                                getScore(sv, "3")
                              )}
                            </TableCell>,
                            <TableCell key="final">
                              {isEditing ? (
                                <input
                                  className="border rounded px-1 py-0.5 w-16"
                                  max={10}
                                  min={0}
                                  placeholder={
                                    editItem.finalScore?.toString() ?? ""
                                  }
                                  type="number"
                                  value={editItem.finalScore ?? ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateScoreField({
                                        studentCode: sv.studentCode,
                                        field: "finalScore",
                                        value:
                                          e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                        current: {
                                          theoryScore: editItem.theoryScore,
                                          practiceScore: editItem.practiceScore,
                                          midtermScore: editItem.midtermScore,
                                          finalScore: editItem.finalScore,
                                        },
                                      })
                                    )
                                  }
                                />
                              ) : (
                                getScore(sv, "4")
                              )}
                            </TableCell>,
                            <TableCell key="actions">
                              {isEditing ? (
                                <>
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() => {
                                      dispatch(saveEdit());
                                      // Update UI immediately
                                      const updated = edits.find(
                                        (e) => e.studentCode === sv.studentCode
                                      );

                                      if (updated) {
                                        setData((prevData) =>
                                          prevData.map((item) => {
                                            if (
                                              item.studentCode ===
                                              sv.studentCode
                                            ) {
                                              // Update 4 trường điểm vào results (theo mapping scoreTypeName)
                                              const newResults =
                                                item.results.map((r) => {
                                                  if (r.scoreTypeName === "1")
                                                    return {
                                                      ...r,
                                                      score:
                                                        updated.theoryScore ??
                                                        -1,
                                                    };
                                                  if (r.scoreTypeName === "2")
                                                    return {
                                                      ...r,
                                                      score:
                                                        updated.practiceScore ??
                                                        -1,
                                                    };
                                                  if (r.scoreTypeName === "3")
                                                    return {
                                                      ...r,
                                                      score:
                                                        updated.midtermScore ??
                                                        -1,
                                                    };
                                                  if (r.scoreTypeName === "4")
                                                    return {
                                                      ...r,
                                                      score:
                                                        updated.finalScore ??
                                                        -1,
                                                    };

                                                  return r;
                                                });

                                              return {
                                                ...item,
                                                results: newResults,
                                              };
                                            }

                                            return item;
                                          })
                                        );
                                      }
                                    }}
                                  >
                                    Done
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    variant="flat"
                                    onClick={() => dispatch(cancelEdit())}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  color="secondary"
                                  disabled={classInfo?.enrollmentStatus === 7}
                                  size="sm"
                                  onClick={() =>
                                    dispatch(startEdit(sv.studentCode))
                                  }
                                >
                                  Edit
                                </Button>
                              )}
                            </TableCell>,
                          ]}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DefaultLayout>
  );
}
