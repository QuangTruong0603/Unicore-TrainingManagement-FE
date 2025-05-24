import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import { Button, Card, Spinner } from "@heroui/react";

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
import {
  updateProfilePhone,
  updateProfileAddress,
  updateProfileGuardians,
  setProfileError,
} from "@/store/slices/studentSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const {
    studentProfile: profile,
    profileLoading: loading,
    profileError: error,
    profileUpdateData: updateData,
    hasProfileChanges: hasChanges,
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

  const handlePhoneUpdate = (phoneNumber: string) => {
    dispatch(updateProfilePhone(phoneNumber));
  };

  const handleAddressUpdate = (address: Address) => {
    dispatch(updateProfileAddress(address));
  };

  const handleGuardiansUpdate = (guardians: Guardian[]) => {
    dispatch(updateProfileGuardians(guardians));
  };

  const handleImageFileUpdate = (imageFile: File) => {
    if (!profile) return;

    dispatch(
      updateStudentProfileImage({
        studentId: profile.id,
        imageFile,
      })
    );
  };

  const handleSaveChanges = async () => {
    if (!profile || !hasChanges) return;

    try {
      const resultAction = await dispatch(
        updateStudentProfile({
          studentId: profile.id,
          data: updateData,
        })
      );

      if (updateStudentProfile.fulfilled.match(resultAction)) {
        setUpdateStatus({
          message: "Profile updated successfully!",
          type: "success",
        });
      } else {
        setUpdateStatus({
          message: "Failed to update profile. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      setUpdateStatus({
        message: "An error occurred while updating profile",
        type: "error",
      });
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

          <div className="flex items-center gap-2">
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

            {hasChanges && (
              <Button
                className="flex items-center gap-2"
                color="primary"
                disabled={loading}
                size="md"
                onClick={handleSaveChanges}
              >
                {loading ? (
                  <>
                    <Spinner color="white" size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            )}
          </div>
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
          // onUpdate={handleImageUpdate}
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
