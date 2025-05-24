"use client";
import React from "react";
import { addToast, Button, Card, Form, Input, Spacer } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Logo } from "@/components/icons/icons";
import { useChangePassword } from "@/services/auth/auth.hooks";
import { changePasswordSchema } from "@/services/auth/auth.schema";
import { useAuth } from "@/hooks/useAuth";

import "./index.scss";

export default function ChangePassword() {
  const changePassword = useChangePassword();
  const { isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  // Redirect if not authenticated
  const onSubmit = async (data: any) => {
    try {
      const response = await changePassword.mutateAsync(data);

      if (response.success) {
        addToast({
          title: "Success",
          description: "Password changed successfully!",
          color: "success",
        });
        router.push("/login");
      } else {
        setError("root", {
          type: "manual",
          message: response.errors![0] || "Failed to change password",
        });
      }
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message:
          error.errors[0] || "Failed to change password. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-start mb-6">
            <Logo />
            <div className="ml-2">
              <span className="font-bold text-2xl text-black">Change </span>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold text-2xl">
                Password
              </span>
            </div>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded fullWidth">
                {errors.root.message}
              </div>
            )}

            <div className="mb-4 w-full">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <Input
                fullWidth
                id="email"
                isInvalid={!!errors.email}
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="password"
              >
                Current Password
              </label>
              <Input
                fullWidth
                id="password"
                isInvalid={!!errors.password}
                placeholder="Enter current password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <Input
                fullWidth
                id="newPassword"
                isInvalid={!!errors.newPassword}
                placeholder="Enter new password"
                type="password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword.message as string}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
              disabled={isSubmitting || changePassword.isPending}
              type="submit"
            >
              {isSubmitting || changePassword.isPending
                ? "Changing Password..."
                : "Change Password"}
            </Button>
          </Form>
          <Spacer y={1} />{" "}
          <Button
            className="w-full text-sm text-gray-600"
            variant="ghost"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
