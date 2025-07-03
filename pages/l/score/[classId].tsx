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
} from "@heroui/react";
import { Download, Upload, FileDown, MoreVertical } from "lucide-react";
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
    if (!classId) return;
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
    if (!classId) return;
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
  const handleExportData = () => {
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
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Scores");
    XLSX.writeFile(wb, `class_score_${classId}.xlsx`);
  };

  // Import điểm từ file Excel qua modal
  const handleImportModalSubmit = async (file: File) => {
    if (!classId) return;
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
    if (!classId || edits.length === 0) return;
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
          <div>
            <h1 className="text-2xl font-bold mb-2">Class Scoreboard</h1>
            {loadingClass ? (
              <Spinner size="sm" />
            ) : classInfo ? (
              <Card className="w-full max-w-2xl mb-2">
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <b>Name:</b> {classInfo.name}
                    </div>
                    <div>
                      <b>Group:</b> {classInfo.groupNumber}
                    </div>
                    <div>
                      <b>Course:</b> {classInfo.course?.code} -{" "}
                      {classInfo.course?.name}
                    </div>
                    <div>
                      <b>Semester:</b> {classInfo.semester?.semesterNumber}/
                      {classInfo.semester?.year}
                    </div>
                    <div>
                      <b>Capacity:</b> {classInfo.capacity}
                    </div>
                    <div>
                      <b>Enrolled:</b> {classInfo.enrollmentCount}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="text-red-500 text-sm">Class info not found.</div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Button
              color="success"
              isDisabled={edits.length === 0}
              isLoading={isSaving}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly color="secondary" variant="flat">
                  <MoreVertical size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Score Actions">
                <DropdownItem
                  key="export-template"
                  startContent={<FileDown size={16} />}
                  onClick={handleExportTemplate}
                >
                  Export Template
                </DropdownItem>
                <DropdownItem
                  key="export"
                  startContent={<Download size={16} />}
                  onClick={handleExportData}
                >
                  Export
                </DropdownItem>
                <DropdownItem
                  key="import"
                  startContent={<Upload size={16} />}
                  onClick={() => setIsImportModalOpen(true)}
                >
                  Import
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <ImportScoreModal
              isOpen={isImportModalOpen}
              isSubmitting={isImporting}
              onOpenChange={() => setIsImportModalOpen(false)}
              onSubmit={handleImportModalSubmit}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
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
                      //   ...scoreTypes.map((type) => (
                      //     <TableColumn key={type.id}>
                      //       {type.name} ({type.percentage}%)
                      //     </TableColumn>
                      //   )),
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
                            // ...scoreTypes.map((type) => {
                            //   const result = sv.results.find(
                            //     (r) => r.scoreTypeId === type.id
                            //   );
                            //   return (
                            //     <TableCell
                            //       key={type.id}
                            //       className="text-center"
                            //     >
                            //       {result
                            //         ? result.score === -1
                            //           ? "-"
                            //           : result.score
                            //         : "-"}
                            //     </TableCell>
                            //   );
                            // }),
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
