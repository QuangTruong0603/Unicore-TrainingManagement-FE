import { PaginatedResponse } from "../dto";

import { Lecturer } from "./lecturer.schema";

export interface LecturerListResponse extends PaginatedResponse<Lecturer> {}
