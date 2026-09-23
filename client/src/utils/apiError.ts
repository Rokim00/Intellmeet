import type { AxiosError } from 'axios';
import type { ApiError, FieldError } from '@/api/auth/auth.types';

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function parseApiError(err: unknown): ParsedApiError {
  const axiosErr = err as AxiosError<ApiError>;

  if (!axiosErr.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      fieldErrors: {},
    };
  }

  const { status, data } = axiosErr.response;

  if (status >= 500) {
    return {
      message: 'A server error occurred. Please try again later.',
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (data?.errors && Array.isArray(data.errors)) {
    data.errors.forEach((item: FieldError) => {
      fieldErrors[item.field] = item.message;
    });
  }

  return {
    message: data?.message || 'Something went wrong. Please try again.',
    fieldErrors,
  };
}
