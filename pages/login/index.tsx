"use client";
import React from "react";
import { Button, Card, Form, Image, Input, Spacer } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { Logo } from "@/components/icons/icons";
import { useLogin } from "@/services/auth/auth.hooks";
import { loginSchema } from "@/services/auth/auth.schema";

import "./index.scss";

export default function StudentLogin() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login.mutateAsync(data);

      localStorage.setItem("token", response.token);
      router.push("/");
    } catch (_error) {
      // Error handling as needed
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
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
              <label className="lable-text" htmlFor="email">
                Email
              </label>
              <Input
                fullWidth
                required
                className="mb-4"
                errorMessage={errors.email?.message as string}
                id="email"
                placeholder="Enter account"
                {...register("email")}
              />

              <label className="lable-text mb-3" htmlFor="password">
                Password
              </label>
              <Input
                fullWidth
                required
                className="mb-6"
                errorMessage={errors.password?.message as string}
                id="password"
                placeholder="Enter password"
                type="password"
                {...register("password")}
              />

              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                disabled={login.isPending}
                type="submit"
              >
                {login.isPending ? "Logging in..." : "Login"}
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
