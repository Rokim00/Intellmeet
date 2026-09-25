export type MemberRole = 'SuperAdmin' | 'Admin' | 'Host' | 'Member';
export type MemberStatus = 'Active' | 'Pending' | 'Suspended';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  avatarUrl?: string;
}

export interface UpdateMemberDTO {
  role?: MemberRole;
  status?: MemberStatus;
}
