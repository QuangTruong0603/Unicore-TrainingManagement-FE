import React, { useState } from "react";
import { Input, Button, Card, Spacer, Image } from "@heroui/react";
import { Logo } from "@/components/icons/icons";

import "./index.scss";

export default function StudentLogin() {
  const [isVisible, setIsVisible] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    console.log("Đăng nhập với:", { registrationNumber, password });
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

            <form onSubmit={handleLogin}>
              <label className="lable-text">Account</label>
              <Input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter account"
                fullWidth
                required
                className="mb-4"
              />

              <label className="lable-text mb-3">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
            </form>
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
