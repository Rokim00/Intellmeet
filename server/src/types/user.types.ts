import { Document, Types } from 'mongoose';

export type UserRole = 'Admin' | 'Member';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface IUserRegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface IUserLoginInput {
  email: string;
  password: string;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface IAuthTokensResponse {
  user: Omit<IUser, 'password' | 'refreshToken'>;
  accessToken: string;
}
