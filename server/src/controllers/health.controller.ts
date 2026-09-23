import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { getDBStatus } from '../config/db.js';
import { env } from '../config/env.js';
import { IHealthData, IReadinessData } from '../types/index.js';

export const getHealth = (_req: Request, res: Response): Response => {
  const healthData: IHealthData = {
    service: 'IntellMeet Backend API',
    status: 'healthy',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
    memory: {
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  };

  return ApiResponse.success<IHealthData>(res, 'IntellMeet Server is healthy', healthData, 200);
};

export const getReadiness = (_req: Request, res: Response): Response => {
  const dbStatus = getDBStatus();
  const isReady = dbStatus === 'connected' || env.NODE_ENV !== 'production';

  const readinessData: IReadinessData = {
    ready: isReady,
    database: dbStatus,
    timestamp: new Date().toISOString()
  };

  const statusCode = isReady ? 200 : 503;
  return ApiResponse.success<IReadinessData>(
    res,
    isReady ? 'Server is ready' : 'Server is not ready',
    readinessData,
    statusCode
  );
};
