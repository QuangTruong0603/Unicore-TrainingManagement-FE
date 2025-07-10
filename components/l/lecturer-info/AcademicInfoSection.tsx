import React from "react";
import { BookOpen, DollarSign, Briefcase } from "lucide-react";
import { Card, CardHeader, CardBody } from "@heroui/react";

interface AcademicInfoSectionProps {
  profile: {
    degree: string;
    salary: number;
    departmentName: string;
    mainMajor: string;
  };
}

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({ profile }) => {
  return (
    <Card className="mb-6 overflow-visible" radius="sm">
      <CardHeader className="flex items-center gap-2 text-purple-700 pb-2">
        <BookOpen className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Academic Information</h2>
      </CardHeader>
      <CardBody className="overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm text-gray-800">{profile.departmentName || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Main Major</p>
                <p className="text-sm text-gray-800">{profile.mainMajor || "-"}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Degree</p>
                <p className="text-sm text-gray-800">{profile.degree || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Salary</p>
                <p className="text-sm text-gray-800">{profile.salary?.toLocaleString() || "-"} VND</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}; 