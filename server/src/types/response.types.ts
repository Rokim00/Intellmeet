export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
}

export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
  timestamp: string;
  stack?: string;
}
