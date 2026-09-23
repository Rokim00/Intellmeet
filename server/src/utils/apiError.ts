export class ApiError extends Error {
  public statusCode: number;
  public errors: unknown[];
  public success: boolean;

  constructor(statusCode: number, message = 'Something went wrong', errors: unknown[] = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors: unknown[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource Not Found'): ApiError {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal Server Error', errors: unknown[] = []): ApiError {
    return new ApiError(500, message, errors);
  }
}
