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
  _id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: MemberRole;
  createdAt?: string;
}

export interface UpdateMemberDTO {
  role?: MemberRole;
  status?: MemberStatus;
}
