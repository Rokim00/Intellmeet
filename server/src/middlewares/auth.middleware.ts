import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { IJwtPayload, UserRole } from '../types/index.js';

export const authenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired authentication token'));
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const currentRole = req.user.userRole || req.user.role;
    if (!allowedRoles.includes(currentRole)) {
      return next(ApiError.forbidden(`Role '${currentRole}' is not authorized to access this resource`));
    }

    next();
  };
};
