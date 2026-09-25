import { CookieOptions } from 'express';
import { env } from '../config/env.js';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/** Cookie config for the rotating refresh token. Secure in production only. */
export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_MAX_AGE
};

/** Clearing requires the same attributes as the set, minus maxAge. */
export const clearRefreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict'
};
