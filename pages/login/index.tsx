"use client";
import React from "react";
import { Button, Card, Form, Image, Input, Spacer } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Logo } from "@/components/icons/icons";
import { useLogin } from "@/services/auth/auth.hooks";
import { loginSchema } from "@/services/auth/auth.schema";
import { useAuth } from "@/hooks/useAuth";

import "./index.scss";

export default function StudentLogin() {
  const login = useLogin();
  const { login: authLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login.mutateAsync(data);
      const token = response.data;

      // Use the auth hook to handle login
      await authLogin(token);
    } catch (error: any) {
      // Set form error
      setError("root", {
        type: "manual",
        message: error.message || "Invalid email or password",
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-orange-50 p-4">
      <Card className="w-full login-card max-w-4xl shadow-lg">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 left-side p-6 flex items-center justify-center rounded-l-lg">
            <div className="relative">
              <Image
                alt="School"
                className="object-cover"
                src="/images/graduation.png"
              />
            </div>
          </div>

          <div className="w-full right-side md:w-1/2 p-6 flex flex-col justify-center">
            <div className="flex justify-start mb-2">
              <Logo />
            </div>
            <div className="uni-name">
              <span className="font-bold text-2xl text-black">University</span>{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold text-2xl">
                Login
              </span>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              {errors.root && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.root.message}
                </div>
              )}

              <div className="full-width">
                <label className="lable-text" htmlFor="email">
                  Email
                </label>
                <Input
                  fullWidth
                  className="mb-1"
                  id="email"
                  isInvalid={!!errors.email}
                  placeholder="Enter account"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="full-width">
                <label className="lable-text mb-3" htmlFor="password">
                  Password
                </label>
                <Input
                  fullWidth
                  className="mb-1"
                  id="password"
                  isInvalid={!!errors.password}
                  placeholder="Enter password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                disabled={isSubmitting || login.isPending}
                type="submit"
              >
                {isSubmitting || login.isPending ? "Logging in..." : "Login"}
              </Button>
            </Form>
            <p className="forgot-password bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex justify-center pt-4">
              Forgot password?
            </p>

            <Spacer y={1} />

            <div className="text-center" />
          </div>
        </div>
      </Card>
    </div>
  );
}
