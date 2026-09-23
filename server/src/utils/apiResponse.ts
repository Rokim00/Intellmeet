import { Response } from 'express';
import { IApiResponse } from '../types/index.js';

export class ApiResponse<T = unknown> implements IApiResponse<T> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T | null;
  public timestamp: string;

  constructor(statusCode: number, message = 'Success', data: T | null = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(res: Response, message = 'Success', data: T | null = null, statusCode = 200): Response {
    return res.status(statusCode).json(new ApiResponse<T>(statusCode, message, data));
  }
}
