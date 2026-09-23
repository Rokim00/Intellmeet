import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { validateRequired } from '../utils/validation.js';
import { env } from '../config/env.js';
import {
  IUserRegisterInput,
  IUserLoginInput,
  IAuthTokensResponse,
  IUser,
} from '../types/index.js';

const sanitizeUser = (userObj: Record<string, unknown>): Omit<IUser, 'password' | 'refreshToken'> => {
  const safe = { ...userObj };
  delete safe.password;
  delete safe.refreshToken;
  return safe as unknown as Omit<IUser, 'password' | 'refreshToken'>;
};

export const registerUserService = async (input: IUserRegisterInput): Promise<IAuthTokensResponse> => {
  validateRequired(input, ['name', 'email', 'password']);

  const { name, email, password, role, avatarUrl } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists');
  }

  const user = new User({
    name,
    email,
    password,
    role: role || 'Member',
    avatarUrl: avatarUrl || ''
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: sanitizeUser(user.toObject() as unknown as Record<string, unknown>),
    accessToken
  };
};

export const loginUserService = async (input: IUserLoginInput): Promise<IAuthTokensResponse & { refreshToken: string }> => {
  const { email, password } = input;

  validateRequired(input, ['email', 'password']);

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: sanitizeUser(user.toObject() as unknown as Record<string, unknown>),
    accessToken,
    refreshToken
  };
};

export const refreshAccessTokenService = async (incomingRefreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> => {
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    newRefreshToken
  };
};

export const logoutUserService = async (userId: string): Promise<void> => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }
};

export const getCurrentUserService = async (userId: string): Promise<Omit<IUser, 'password' | 'refreshToken'>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toObject() as unknown as Omit<IUser, 'password' | 'refreshToken'>;
};
