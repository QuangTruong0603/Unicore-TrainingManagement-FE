/**
 * Standard API response format that matches backend structure
 */
export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  errors: string[];
}
