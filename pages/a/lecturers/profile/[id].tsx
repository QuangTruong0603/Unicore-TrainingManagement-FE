import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Spinner, Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { addToast } from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { lecturerService } from "@/services/lecturer/lecturer.service";
import { LecturerProfileHeader } from "@/components/l/lecturer-info/LecturerProfileHeader";
import { PersonalInfoSection } from "@/components/l/lecturer-info/PersonalInfoSection";
import { AddressSection } from "@/components/l/lecturer-info/AddressSection";
import { AcademicInfoSection } from "@/components/l/lecturer-info/AcademicInfoSection";

import "./detail.scss";

interface Address {
  id: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
}

interface LecturerDetail {
  id: string;
  lecturerCode: string;
  degree: string;
  salary: number;
  departmentId: string;
  departmentName: string;
  workingStatus: number;
  joinDate: string;
  mainMajor: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  personId: string;
  status: number;
  imageUrl: string;
  applicationUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    personId: string;
    dob: string;
    phoneNumber: string;
    status: number;
    imageUrl?: string;
  };
  address: Address | null;
}

export default function LecturerDetailPage() {
  const [profile, setProfile] = useState<LecturerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  const handleUpdateImage = async (imageFile: File) => {
    if (!profile) return;
    try {
      await lecturerService.updateLecturerImage(profile.id, imageFile);
      // Update profile to get the new imageUrl
      const updatedProfile = await lecturerService.getLecturerByLecturerId(
        profile.id
      );

      setProfile(updatedProfile.data);
      addToast({
        title: "Success",
        description: "Avatar has been updated.",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Failed",
        description: "Please try again.",
        color: "danger",
      });
    }
  };

  const handleBack = () => {
    router.push("/a/lecturers");
  };

  useEffect(() => {
    if (id) {
      lecturerService
        .getLecturerByEmail(id as string)
        .then((response) => {
          // Transform the data to match component requirements
          const transformedProfile = {
            ...response.data,
            firstName: response.data.applicationUser.firstName,
            lastName: response.data.applicationUser.lastName,
            email: response.data.applicationUser.email,
            phoneNumber: response.data.applicationUser.phoneNumber,
            personId: response.data.applicationUser.personId,
            status: response.data.applicationUser.status,
            imageUrl: response.data.applicationUser.imageUrl || "",
            departmentName: "Department", // You might need to fetch this separately
            mainMajor: response.data.mainMajor || "",
            address: (response.data as any).address || null,
          };

          setProfile(transformedProfile);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to connect to server");
          setLoading(false);
        });
    }
  }, [id]);

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
      <div className="detail-page mx-auto mt-10">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            startContent={<ArrowLeft className="w-4 h-4" />}
            variant="light"
            onClick={handleBack}
          >
            Back to Lecturers
          </Button>
        </div>

        {/* Header */}
        <LecturerProfileHeader
          profile={profile}
          onUpdateImage={handleUpdateImage}
        />
        {/* Personal Info */}
        <PersonalInfoSection profile={profile} />
        {/* Address Info - Read only */}
        <AddressSection
          address={profile.address}
          onUpdate={undefined} // Disable address update
        />
        {/* Academic Info */}
        <AcademicInfoSection profile={profile} />
      </div>
    </DefaultLayout>
  );
}
