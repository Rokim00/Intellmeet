export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Member' | 'Host';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
}