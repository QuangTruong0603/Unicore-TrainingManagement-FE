import { BaseResponse, PaginatedResponse } from "../dto";

import { Student } from "./student.schema";

export interface StudentListResponse
  extends BaseResponse<PaginatedResponse<Student>> {}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  dob: string;
  personId: string;
  phoneNumber: string;
  privateEmail: string;
  batchId: string;
  majorId: string;
}

export interface CreateStudentResponse {
  studentCode: string;
  email: string;
  message: string;
}
