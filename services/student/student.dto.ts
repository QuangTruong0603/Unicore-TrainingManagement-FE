import { BaseResponse, PaginatedResponse } from "../dto";

import { Student } from "./student.schema";

export interface StudentListResponse
  extends BaseResponse<PaginatedResponse<Student>> {}
