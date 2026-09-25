import { Document, Types } from 'mongoose';

export type UserRole = 'SuperAdmin' | 'Member';

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
  name?: string;
  userName?: string;
  email?: string;
  userEmail?: string;
  password: string;
  isCreatingOrg?: boolean;
  organizationName?: string;
  organizationLocation?: string;
  organizationSlug?: string;
  inviteCode?: string;
  avatarUrl?: string;
  role?: UserRole;
  userRole?: UserRole;
}

export interface IUserLoginInput {
  email: string;
  password: string;
}

export interface IJwtPayload {
  id: string;
  userId?: string;
  email: string;
  userEmail?: string;
  role: UserRole;
  userRole?: UserRole;
  isSuperAdmin?: boolean;
  organizationId?: string;
}

export interface IAuthTokensResponse {
  user: Omit<IUser, 'password' | 'refreshToken'>;
  accessToken: string;
}
