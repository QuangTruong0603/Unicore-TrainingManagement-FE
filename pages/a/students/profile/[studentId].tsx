import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Spinner, Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";

import DefaultLayout from "@/layouts/default";
import {
  studentService,
  updateStudentProfileImage,
} from "@/services/student/student.service";
import { ProfileHeader } from "@/components/s/sutdent-info/ProfileHeader";
import { PersonalInfoSection } from "@/components/s/sutdent-info/PersonalInfoSection";
import AddressSection from "@/components/s/sutdent-info/AddressSection";
import { GuardiansSection } from "@/components/s/sutdent-info/GuardiansSection";
import { AppDispatch } from "@/store/store";

import "./profile.scss";

export default function StudentProfileAdminPage() {
  const router = useRouter();
  const { studentId } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let isMounted = true;

    if (studentId) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

        studentService
          .getStudentProfile(studentId as string)
          .then((res) => {
            if (!isMounted) return;

            if (res.success) {
              setProfile(res.data);
              setError(null);
            } else {
              setError("Failed to fetch student profile");
            }
            setLoading(false);
          })
          .catch((error) => {
            if (!isMounted) return;

            // Don't show error for canceled requests
            if (
              error?.name === "CanceledError" ||
              error?.message?.includes("canceled")
            ) {
              console.log("Request was canceled");

              return;
            }

            console.error("Error fetching student profile:", error);
            setError("Failed to fetch student profile");
            setLoading(false);
          });
      }, 100); // 100ms delay

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Hàm update cho PersonalInfoSection và AddressSection (không update guardians)
  const handleUpdate = async (data: any) => {
    if (!profile) return;
    try {
      await studentService.updateStudentProfile(profile.id, data);
      // Có thể show toast thành công nếu muốn
    } catch (err) {
      // Có thể show toast lỗi nếu muốn
    }
  };

  const handleUpdateImage = async (imageFile: File) => {
    if (!profile) return;
    try {
      await dispatch(
        updateStudentProfileImage({ studentId: profile.id, imageFile })
      );
    } catch (err) {}
  };

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
      <div className="profile-page p-4  mx-auto mt-10">
        <Button
          className="mb-4"
          color="primary"
          startContent={<ArrowLeft className="w-4 h-4" />}
          variant="light"
          onClick={() => router.push("/a/students")}
        >
          Back to Student Management
        </Button>
        <ProfileHeader profile={profile} onUpdateImage={handleUpdateImage} />
        <PersonalInfoSection profile={profile} onUpdate={handleUpdate} />
        <AddressSection
          address={profile.address || null}
          onUpdate={handleUpdate}
        />
        {/* Không cho edit người nhà */}
        <GuardiansSection guardians={profile.guardians} onUpdate={undefined} />
      </div>
    </DefaultLayout>
  );
}
