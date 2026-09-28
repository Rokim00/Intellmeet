import type { UserRole } from '@/types/user.types';
import type { ProjectRole } from '@/types/project.types';

export type { UserRole, ProjectRole };

export type MemberStatus = 'active' | 'invited' | 'suspended';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  joinedAt: string;
  avatarUrl?: string;
  _id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: UserRole;
  createdAt?: string;
}

export interface UpdateMemberDTO {
  role?: UserRole;
  status?: MemberStatus;
}
