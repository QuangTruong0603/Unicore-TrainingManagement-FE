import { BaseResponse } from "../dto";

import { Major } from "./major.schema";

export interface MajorListResponse extends BaseResponse<Major[]> {}
