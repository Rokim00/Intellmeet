import client from '../client';
import type { AuthResponse, LoginDTO, SignupDTO, User } from './auth.types';

export const login = (dto: LoginDTO) =>
  client.post<AuthResponse>('/auth/login', dto);

export const register = (dto: SignupDTO) =>
  client.post<AuthResponse>('/auth/signup', dto);

export const logout = () =>
  client.post('/auth/logout');

export const refreshToken = () =>
  client.post<{ data: { accessToken: string } }>('/auth/refresh-token');

export const getMe = () =>
  client.get<{ data: User }>('/auth/me');
