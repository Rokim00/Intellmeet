import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

interface MongooseValidationError extends Error {
  errors: Record<string, { path: string; message: string }>;
}

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err.name === 'ValidationError') {
    // Mongoose Validation Error (Missing fields, regex mismatch, etc)
    const mongooseError = err as MongooseValidationError;
    const errorsArray = Object.values(mongooseError.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    error = new ApiError(400, 'Validation failed: Please check the missing or invalid fields', errorsArray, err.stack);
  } else if ('code' in err && (err as MongoDuplicateKeyError).code === 11000) {
    // Mongoose Duplicate Key Error
    const mongoDupError = err as MongoDuplicateKeyError;
    const rawField = Object.keys(mongoDupError.keyValue || {})[0] || 'field';
    const value = mongoDupError.keyValue ? mongoDupError.keyValue[rawField] : '';

    let friendlyField = rawField;
    if (rawField === 'user_email' || rawField === 'email') friendlyField = 'email';
    if (rawField === 'organization_slug' || rawField === 'slug') friendlyField = 'organizationSlug';
    if (rawField === 'organization_name' || rawField === 'name') friendlyField = 'organizationName';
    if (rawField === 'organization_invite_code' || rawField === 'inviteCode') friendlyField = 'inviteCode';
    if (rawField === 'project_name') friendlyField = 'projectName';

    const message = `A record with this ${friendlyField} '${value}' already exists. Please choose a different ${friendlyField}.`;
    const errorsArray = [{ field: friendlyField, message }];
    error = new ApiError(400, message, errorsArray, err.stack);
  } else if (err instanceof SyntaxError && 'status' in err && (err as unknown as { status: number }).status === 400 && 'body' in err) {
    // Express JSON syntax parser error (e.g. trailing commas)
    error = new ApiError(400, 'Invalid JSON payload. Please check for syntax errors such as trailing commas or malformed quotes.', [], err.stack);
  } else {
    // Generic Fallback
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
