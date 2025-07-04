// Export configurations
export * from "./api-config";

// Export HTTP clients
export {
  courseClient,
  authClient,
  majorClient,
  batchClient,
  studentClient,
  locationClient,
  buildingClient,
  floorClient,
  roomClient,
} from "./http-client";
export type { ApiError } from "./http-client";

// Export standardized response type
export type { BaseResponse } from "./api-response";

// Export React hooks
export * from "./api-hooks";
