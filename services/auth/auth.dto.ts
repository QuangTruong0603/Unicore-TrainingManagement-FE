import { BaseResponse } from "../dto";

export interface LoginResponseData {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginResponse extends BaseResponse<string> {}

export interface ChangePasswordResponseData {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse
  extends BaseResponse<ChangePasswordResponseData> {}
