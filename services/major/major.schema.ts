export interface Major {
  id: string;
  name: string;
  code: string;
}

export interface MajorResponse {
  success: boolean;
  data: Major[];
  errors: null | string;
} 