import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Card, Spinner, addToast } from "@heroui/react";

import DefaultLayout from "../../../layouts/default";
import "./index.scss";

import AddressSection from "@/components/s/sutdent-info/AddressSection";
import { ProfileHeader } from "@/components/s/sutdent-info/ProfileHeader";
import { PersonalInfoSection } from "@/components/s/sutdent-info/PersonalInfoSection";
import { GuardiansSection } from "@/components/s/sutdent-info/GuardiansSection";
import { Address, Guardian } from "@/components/s/sutdent-info/types";
import {
  fetchStudentProfile,
  updateStudentProfile,
  updateStudentProfileImage,
} from "@/services/student/student.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setProfileError } from "@/store/slices/studentSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const {
    studentProfile: profile,
    profileLoading: loading,
    profileError: error,
  } = useAppSelector((state) => state.student);

  const [updateStatus, setUpdateStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  useEffect(() => {
    // Replace with actual student ID or fetch from auth context
    const studentId = "371db8dc-eb0d-4835-9045-ac3f9c6b3726";

    dispatch(fetchStudentProfile(studentId));
  }, [dispatch]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(setProfileError(null));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (updateStatus.type) {
      const timer = setTimeout(() => {
        setUpdateStatus({ message: "", type: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  const handlePhoneUpdate = async (phoneNumber: string): Promise<void> => {
    if (!profile) return;

    try {
      setUpdateStatus({ message: "Updating phone number...", type: null });

      const result = await dispatch(
        updateStudentProfile({
          studentId: profile.id,
          data: { phoneNumber },
        })
      );

      if (updateStudentProfile.fulfilled.match(result)) {
        addToast({
          title: "Success",
          description: "Phone number updated successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed to update phone number. Please try again.",
          description: "Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.log(err);
      addToast({
        title: "An error occurred while updating phone number",
        description: "Please try again.",
        color: "danger",
      });
      throw err; // Re-throw to propagate to the component
    }
  };

  const handleAddressUpdate = async (address: Address): Promise<void> => {
    if (!profile) return;

    try {
      setUpdateStatus({ message: "Updating address...", type: null });

      const result = await dispatch(
        updateStudentProfile({
          studentId: profile.id,
          data: { address },
        })
      );

      if (updateStudentProfile.fulfilled.match(result)) {
        addToast({
          title: "Success",
          description: "Address updated successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed to update address. Please try again.",
          description: "Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.log(err);
      addToast({
        title: "An error occurred while updating address",
        description: "Please try again.",
        color: "danger",
      });
      throw err; // Re-throw to propagate to the component
    }
  };

  const handleGuardiansUpdate = async (
    guardians: Guardian[]
  ): Promise<void> => {
    if (!profile) return;

    try {
      setUpdateStatus({ message: "Updating guardians...", type: null });

      const result = await dispatch(
        updateStudentProfile({
          studentId: profile.id,
          data: { guardians },
        })
      );

      if (updateStudentProfile.fulfilled.match(result)) {
        addToast({
          title: "Success",
          description: "Guardians updated successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed to update guardians. Please try again.",
          description: "Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.log(err);
      setUpdateStatus({
        message: "An error occurred while updating guardians",
        type: "error",
      });
      throw err; // Re-throw to propagate to the component
    }
  };

  const handleImageFileUpdate = async (imageFile: File): Promise<void> => {
    if (!profile) return;

    try {
      setUpdateStatus({ message: "Updating profile image...", type: null });

      const result = await dispatch(
        updateStudentProfileImage({
          studentId: profile.id,
          imageFile,
        })
      );

      if (updateStudentProfileImage.fulfilled.match(result)) {
        addToast({
          title: "Success",
          description: "Profile image updated successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed to update profile image. Please try again.",
          description: "Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.log(err);
      setUpdateStatus({
        message: "An error occurred while updating profile image",
        type: "error",
      });
      throw err; // Re-throw to propagate to the component
    }
  };

  if (loading && !profile) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-full">
          <Spinner color="primary" size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error && !profile) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error</div>
              <div className="text-sm">{error || "Profile not found"}</div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!profile) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error</div>
              <div className="text-sm">No profile data available</div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Card className="profile-page p-6 bg-gray-50 border-none overflow-visible">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            Student Information
          </h1>

          {updateStatus.type && (
            <div
              className={`text-sm px-3 py-1 rounded-md ${
                updateStatus.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              } flex items-center gap-1`}
            >
              {updateStatus.type === "error" && <AlertCircle size={14} />}
              {updateStatus.message}
            </div>
          )}
        </div>

        {/* Show global error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <ProfileHeader
          profile={profile}
          onUpdateImage={handleImageFileUpdate}
        />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <PersonalInfoSection profile={profile} onUpdate={handlePhoneUpdate} />
        </div>

        <AddressSection
          address={profile.address}
          onUpdate={handleAddressUpdate}
        />

        <GuardiansSection
          guardians={profile.guardians}
          onUpdate={handleGuardiansUpdate}
        />
      </Card>
    </DefaultLayout>
  );
}
