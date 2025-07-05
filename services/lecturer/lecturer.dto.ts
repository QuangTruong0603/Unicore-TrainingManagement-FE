import { PaginatedResponse } from "../dto";
import { BaseResponse } from "../api/api-response";

import { Lecturer } from "./lecturer.schema";

export interface LecturerListResponse extends PaginatedResponse<Lecturer> {}

export interface LecturerResponse extends BaseResponse<Lecturer> {}

export interface LecturersByMajorsResponse extends BaseResponse<Lecturer[]> {}
