import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/hooks/useAuth";
import { lecturerService } from "@/services/lecturer/lecturer.service";
import { LecturerProfileHeader } from "@/components/l/lecturer-info/LecturerProfileHeader";
import { PersonalInfoSection } from "@/components/l/lecturer-info/PersonalInfoSection";
import { AddressSection } from "@/components/l/lecturer-info/AddressSection";
import { AcademicInfoSection } from "@/components/l/lecturer-info/AcademicInfoSection";

import "./index.scss";
import { addToast } from "@heroui/react";

interface Address {
  id: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
}

interface LecturerProfile {
  id: string;
  userId: string;
  lecturerCode: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  personId: string;
  status: number;
  imageUrl: string;
  degree: string;
  salary: number;
  departmentId: string;
  departmentName: string;
  workingStatus: number;
  joinDate: string;
  mainMajor: string;
  address: Address | null;
}

export default function LecturerProfilePage() {
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lecturerInfo } = useAuth();

  const handleUpdateAddress = async (newAddress: Address) => {
    if (!profile) return;
    try {
      await lecturerService.updateLecturerAddress(profile.id, newAddress);
      setProfile({ ...profile, address: newAddress });
      addToast({
        title: "Cập nhật địa chỉ thành công!",
        description: "Địa chỉ đã được cập nhật.",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Cập nhật địa chỉ thất bại!",
        description: "Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  const handleUpdateImage = async (imageFile: File) => {
    if (!profile) return;
    try {
      await lecturerService.updateLecturerImage(profile.id, imageFile);
      // Cập nhật lại profile để lấy imageUrl mới
      const updatedProfile = await lecturerService.getLecturerByLecturerId(
        profile.id
      );
      setProfile(updatedProfile.data);
      addToast({
        title: "Cập nhật avatar thành công!",
        description: "Avatar đã được cập nhật.",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Cập nhật avatar thất bại!",
        description: "Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    if (lecturerInfo?.id) {
      lecturerService
        .getLecturerByLecturerId(lecturerInfo.id)
        .then((response) => {
          setProfile(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to connect to server");
          setLoading(false);
        });
    }
  }, [lecturerInfo?.id]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-full">
          <Spinner color="primary" size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error || !profile) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center gap-2">
            <span className="font-medium">{error || "No data available"}</span>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="profile-page mx-auto mt-10">
        {/* Header */}
        <LecturerProfileHeader
          profile={profile}
          onUpdateImage={handleUpdateImage}
        />
        {/* Personal Info */}
        <PersonalInfoSection profile={profile} />
        {/* Address Info */}
        <AddressSection
          address={profile.address}
          onUpdate={handleUpdateAddress}
        />
        {/* Academic Info */}
        <AcademicInfoSection profile={profile} />
      </div>
    </DefaultLayout>
  );
}
