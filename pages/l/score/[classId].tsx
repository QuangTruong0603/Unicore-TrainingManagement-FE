import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { classService } from "@/services/class/class.service";
import DefaultLayout from "@/layouts/default";
import { Spinner, Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { AcademicClass } from "@/services/class/class.schema";
import { Download, Upload } from "lucide-react";

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
            <Button color="primary" startContent={<Upload size={16} />}>Import</Button>
            <Button color="secondary" startContent={<Download size={16} />}>Export</Button>
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
                    <TableColumn>Student Code</TableColumn>
                    <TableColumn>Student Name</TableColumn>
                    {scoreTypes.map((type) => (
                      <TableColumn key={type.id}>
                        {type.name} ({type.percentage}%)
                      </TableColumn>
                    ))}
                  </TableHeader>
                  <TableBody emptyContent="No students found" isLoading={loading} loadingContent={<Spinner />}>
                    {data.map((sv) => (
                      <TableRow key={sv.studentId}>
                        <TableCell>{sv.studentCode}</TableCell>
                        <TableCell>{sv.studentName}</TableCell>
                        {scoreTypes.map((type) => {
                          const result = sv.results.find((r) => r.scoreTypeId === type.id);
                          return (
                            <TableCell key={type.id} className="text-center">
                              {result ? (result.score === -1 ? "-" : result.score) : "-"}
                            </TableCell>
                          );
                        })}
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