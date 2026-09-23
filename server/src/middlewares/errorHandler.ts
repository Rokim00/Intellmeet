import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else {
    const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Log error stack trace on the server for debugging
  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} ${error.message}`, error.stack);

  // Clean public response without leaking stack traces
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    timestamp: new Date().toISOString()
  };

  return res.status(error.statusCode).json(response);
};
