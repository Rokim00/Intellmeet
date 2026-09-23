import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
  getCurrentUserService
} from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  const result = await registerUserService(req.body);

  return ApiResponse.success(
    res,
    'User registered successfully',
    result,
    201
  );
};

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { user, accessToken, refreshToken } = await loginUserService(req.body);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return ApiResponse.success(
    res,
    'Login successful',
    { user, accessToken },
    200
  );
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<Response> => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, newRefreshToken } = await refreshAccessTokenService(incomingRefreshToken);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  return ApiResponse.success(
    res,
    'Access token refreshed successfully',
    { accessToken },
    200
  );
};

export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id || '';
  await logoutUserService(userId);

  res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

  return ApiResponse.success(res, 'Logged out successfully', null, 200);
};

export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  const user = await getCurrentUserService(userId as string);

  return ApiResponse.success(res, 'Current user profile retrieved', user, 200);
};
