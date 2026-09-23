import { CorsOptions } from 'cors';
import { env } from './env.js';

const parseAllowedOrigins = (): string[] | string | boolean => {
  if (env.CORS_ORIGIN && env.CORS_ORIGIN !== '*') {
    // Support comma-separated list of origins (e.g., "http://localhost:5173,http://localhost:3000")
    return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  }
  
  // Default development origins
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
};

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    const allowed = parseAllowedOrigins();

    // Allow requests with no origin (like Postman, Bruno, mobile apps, curl)
    if (!requestOrigin) {
      return callback(null, true);
    }

    if (Array.isArray(allowed)) {
      if (allowed.includes(requestOrigin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`Origin '${requestOrigin}' not allowed by CORS`));
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
