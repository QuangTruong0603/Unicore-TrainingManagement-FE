'use client'
import React, { FormEvent, useState } from "react";
import { Input, Button, Card, Spacer, Image, Form } from "@heroui/react";
import { Logo } from "@/components/icons/icons";
import { useLogin } from "@/services/auth/auth.hooks";
import { loginSchema } from "@/services/auth/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import "./index.scss";

export default function StudentLogin() {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      const response = await login.mutateAsync(data);
      localStorage.setItem('token', response.token);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
      <Card className="w-full login-card max-w-4xl shadow-lg">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 left-side p-6 flex items-center justify-center rounded-l-lg">
            <div className="relative">
              <Image
                src="/images/graduation.png"
                alt="School"
                className="object-cover"
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
              <label className="lable-text">Email</label>
              <Input
                {...register("email")}
                errorMessage={errors.email?.message as string}
                placeholder="Enter account"
                fullWidth
                required
                className="mb-4"
              />

              <label className="lable-text mb-3">Password</label>
              <Input
                {...register("password")}
                placeholder="Enter password"
                errorMessage={errors.password?.message as string}
                fullWidth
                type={isVisible ? "text" : "password"}
                required
                className="mb-6"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                disabled={login.isPending}
              >
                {login.isPending ? "Logging in..." : "Login"}
              </Button>
            </Form>
            <p className="forgot-password bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex justify-center pt-4">
              Forgot password?
            </p>

            <Spacer y={1} />

            <div className="text-center"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
