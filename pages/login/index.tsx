import React, { FormEvent, useEffect, useState } from "react";
import { Input, Button, Card, Spacer, Image, Form } from "@heroui/react";
import { Logo } from "@/components/icons/icons";

import "./index.scss";
import { on } from "node:stream";

export default function StudentLogin() {
  const [isVisible, setIsVisible] = useState(false);
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!submitted) return; // Không gọi API nếu chưa submit

    const login = async () => {
     

      try {
        const res = await fetch("https://localhost:5001/api/u/Auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitted), // Gửi dữ liệu login
        });

        if (!res.ok) throw new Error("Login failed!");

        const data = await res.json();
        
     
      } catch (err) {
      
      } finally {
     
        setSubmitted(null); // Reset tránh gọi API liên tục
      }
    };

    login();
  }, [submitted]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setSubmitted(data);
  };

  


  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
      <Card className="w-full login-card max-w-4xl shadow-lg">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 left-side p-6 flex items-center justify-center  rounded-l-lg">
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

            <Form onSubmit={onSubmit}>
              <label className="lable-text">Account</label>
              <Input
                name="email"
                errorMessage="Please enter a valid email"
                placeholder="Enter account"
                fullWidth
                required
                className="mb-4"
              />

              <label className="lable-text mb-3">Password</label>
              <Input
                name="password"
                placeholder="Enter password"
                errorMessage="Please enter a valid password"
                fullWidth
                type={isVisible ? "text" : "password"}
                required
                className="mb-6"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                Login
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
