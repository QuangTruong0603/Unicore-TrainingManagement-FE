import React from "react";
import { Card, Chip } from "@heroui/react";

interface LecturerProfileHeaderProps {
  profile: {
    firstName: string;
    lastName: string;
    imageUrl: string;
    status: number;
    workingStatus: number;
    lecturerCode: string;
    departmentName: string;
    email: string;
    phoneNumber: string;
  };
}

export const LecturerProfileHeader: React.FC<LecturerProfileHeaderProps> = ({
  profile,
}) => {
  return (
    <Card
      className="p-6 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-md"
      radius="lg"
    >
      <div className="avatar-container shadow-md">
        {profile.imageUrl ? (
          <img
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
            src={profile.imageUrl}
          />
        ) : (
          <span className="text-4xl text-gray-400 font-bold">
            {profile.firstName.charAt(0)}
            {profile.lastName.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {profile.firstName} {profile.lastName}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Chip
              color={profile.status === 1 ? "success" : "danger"}
              variant="flat"
            >
              {profile.status === 1 ? "Active" : "Inactive"}
            </Chip>
          </div>
        </div>
        <div>
          <Chip
            className="bg-blue-100 text-blue-800 border-none text-xs"
            color="primary"
            variant="flat"
          >
            <b>Lecturer Code:</b> {profile.lecturerCode}
          </Chip>

          <Chip className="bg-blue-100 text-orange-800 border-none text-xs">
            <b>Department:</b> {profile.departmentName}
          </Chip>
          <Chip className="bg-blue-100 text-purple-800 border-none text-xs">
            <b>Email:</b> {profile.email}
          </Chip>
          <Chip className="bg-blue-100 text-green-800 border-none text-xs">
            <b>Phone:</b> {profile.phoneNumber}
          </Chip>
        </div>
      </div>
    </Card>
  );
};
