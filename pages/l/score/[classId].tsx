import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { classService } from "@/services/class/class.service";
import DefaultLayout from "@/layouts/default";
import { Spinner, Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { AcademicClass } from "@/services/class/class.schema";
import { Download, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { addToast } from "@heroui/react";
import { ImportScoreModal } from "@/components/a/material/import-score-modal";

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
  const [scoreTypes, setScoreTypes] = useState<{ id: string; name: string; percentage: number }[]>([]);
  const [classInfo, setClassInfo] = useState<AcademicClass | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!classId) return;
    setLoadingClass(true);
    classService.getClassById(classId as string)
      .then((res) => {
        setClassInfo(res.data);
      })
      .catch(() => setClassInfo(null))
      .finally(() => setLoadingClass(false));
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    enrollmentService.getStudentResultsByClassId(classId as string)
      .then((res) => {
        if (res.success) {
          setData(res.data);
          // Get all unique score types
          const allTypes: { id: string; name: string; percentage: number }[] = [];
          res.data.forEach((sv: StudentResult) => {
            sv.results.forEach((r) => {
              if (!allTypes.find((t) => t.id === r.scoreTypeId)) {
                allTypes.push({ id: r.scoreTypeId, name: r.scoreTypeName, percentage: r.scoreTypePercentage });
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
    const header = ["Student Code", ...scoreTypes.map(type => `${type.name} (${type.percentage}%)`)];
    wsData.push(header);
    // Body
    data.forEach(sv => {
      wsData.push([
        sv.studentCode,
        ...scoreTypes.map(() => "")
      ]);
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
    const header = ["Student Code", "Student Name", ...scoreTypes.map(type => `${type.name} (${type.percentage}%)`)];
    wsData.push(header);
    // Body
    data.forEach(sv => {
      wsData.push([
        sv.studentCode,
        sv.studentName,
        ...scoreTypes.map(type => {
          const result = sv.results.find(r => r.scoreTypeId === type.id);
          return result ? (result.score === -1 ? "" : result.score) : "";
        })
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
      const res = await enrollmentService.importStudentResults(classId as string, file);
      if (res.success) {
        addToast({ title: "Import scores successfully!", color: "success" });
        // Reload data
        enrollmentService.getStudentResultsByClassId(classId as string)
          .then((res) => {
            if (res.success) {
              setData(res.data);
              // Update scoreTypes
              const allTypes: { id: string; name: string; percentage: number }[] = [];
              res.data.forEach((sv: StudentResult) => {
                sv.results.forEach((r) => {
                  if (!allTypes.find((t) => t.id === r.scoreTypeId)) {
                    allTypes.push({ id: r.scoreTypeId, name: r.scoreTypeName, percentage: r.scoreTypePercentage });
                  }
                });
              });
              setScoreTypes(allTypes.sort((a, b) => a.name.localeCompare(b.name)));
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
                    <div><b>Name:</b> {classInfo.name}</div>
                    <div><b>Group:</b> {classInfo.groupNumber}</div>
                    <div><b>Course:</b> {classInfo.course?.code} - {classInfo.course?.name}</div>
                    <div><b>Semester:</b> {classInfo.semester?.semesterNumber}/{classInfo.semester?.year}</div>
                    <div><b>Capacity:</b> {classInfo.capacity}</div>
                    <div><b>Enrolled:</b> {classInfo.enrollmentCount}</div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="text-red-500 text-sm">Class info not found.</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button color="success" startContent={<FileDown size={16} />} onClick={handleExportTemplate}>
              Export Template
            </Button>
            <Button color="secondary" startContent={<Download size={16} />} onClick={handleExportData}>
              Export
            </Button>
            <Button color="primary" startContent={<Upload size={16} />} onClick={() => setIsImportModalOpen(true)}>Import</Button>
            <ImportScoreModal
              isOpen={isImportModalOpen}
              onOpenChange={() => setIsImportModalOpen(false)}
              onSubmit={handleImportModalSubmit}
              isSubmitting={isImporting}
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
                <Table aria-label="Score table" isStriped isHeaderSticky>
                  <TableHeader>
                    {[
                      <TableColumn key="code">Student Code</TableColumn>,
                      <TableColumn key="name">Student Name</TableColumn>,
                      ...scoreTypes.map(type => (
                        <TableColumn key={type.id}>{type.name} ({type.percentage}%)</TableColumn>
                      ))
                    ]}
                  </TableHeader>
                  <TableBody emptyContent="No students found" isLoading={loading} loadingContent={<Spinner />}>
                    {data.map((sv) => (
                      <TableRow key={sv.studentId}>
                        {[
                          <TableCell key="code">{sv.studentCode}</TableCell>,
                          <TableCell key="name">{sv.studentName}</TableCell>,
                          ...scoreTypes.map(type => {
                            const result = sv.results.find((r) => r.scoreTypeId === type.id);
                            return (
                              <TableCell key={type.id} className="text-center">
                                {result ? (result.score === -1 ? "-" : result.score) : "-"}
                              </TableCell>
                            );
                          })
                        ]}
                      </TableRow>
                    ))}
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