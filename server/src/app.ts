import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiResponse } from './utils/apiResponse.js';
import { corsOptions } from './config/cors.js';
import { swaggerSpec } from './config/swagger.js';
import { env } from './config/env.js';
import { tolerantJsonParser } from './middlewares/tolerantJson.js';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));

// Body Parsers & Cookie Parser
// In development we accept comments and trailing commas in JSON bodies so
// credentials can be toggled in an API client without editing the payload.
if (env.NODE_ENV === 'production') {
  app.use(express.json({ limit: '16kb' }));
} else {
  app.use(tolerantJsonParser({ limit: '16kb' }));
}
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Quiet handler for automatic browser favicon requests
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// Raw OpenAPI JSON Spec Route
app.get('/api/docs/json', (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

// Dynamic Swagger / OpenAPI UI Documentation
try {
  const swaggerUi = await import('swagger-ui-express');
  app.use('/api/docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerSpec));
} catch {
  // Graceful fallback
}

// Friendly API Root Welcome Endpoints
const rootWelcomeHandler = (_req: Request, res: Response): Response => {
  return ApiResponse.success(res, 'Welcome to IntellMeet API', {
    service: 'IntellMeet Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    healthCheck: '/api/v1/health'
  });
};

app.get('/', rootWelcomeHandler);
app.get('/api', rootWelcomeHandler);

// Backwards-compatible legacy health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'IntellMeet Server is ready' });
});

// Mount Central API Router
app.use('/api', apiRouter);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
