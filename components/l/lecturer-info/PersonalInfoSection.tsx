import React from "react";
import { User, IdCard, Calendar } from "lucide-react";
import { Card, CardHeader, CardBody } from "@heroui/react";

interface PersonalInfoSectionProps {
  profile: {
    firstName: string;
    lastName: string;
    lecturerCode: string;
    personId: string;
    joinDate: string;
    status: number;
    workingStatus: number;
  };
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
}) => {
  return (
    <Card className="mb-6 overflow-visible" radius="sm">
      <CardHeader className="flex items-center gap-2 text-purple-700 pb-2">
        <User className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Personal Information</h2>
      </CardHeader>
      <CardBody className="overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IdCard className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Lecturer Code</p>
                <p className="text-sm text-gray-800">{profile.lecturerCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <User className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm text-gray-800">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IdCard className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Personal ID</p>
                <p className="text-sm text-gray-800">{profile.personId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-gray-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500">Join Date</p>
                <p className="text-sm text-gray-800">
                  {profile.joinDate
                    ? new Date(profile.joinDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 h-4 w-4">●</span>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm text-gray-800">
                  {profile.status === 1 ? "Active" : "Inactive"} /{" "}
                  {profile.workingStatus === 1 ? "Working" : "Retired"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
