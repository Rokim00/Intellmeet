export type UserRole = 'SuperAdmin' | 'Member';

export interface User {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  name: string;
  email: string;
  role: UserRole;
  isSuperAdmin?: boolean;
  avatarUrl?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
