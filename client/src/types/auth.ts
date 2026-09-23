export interface FieldError {
  field: string;
  message: string;
}

export interface OrganizationInfo {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLocation?: string;
  organizationDescription?: string;
  inviteCode: string;
  revokedInviteCodes?: string[];
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'SuperAdmin' | 'Member';
  isSuperAdmin: boolean;
  avatarUrl?: string;
  organizationId?: string | OrganizationInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  isCreatingOrg?: boolean;
  organizationName?: string;
  organizationLocation?: string;
  organizationSlug?: string;
  inviteCode?: string;
  avatarUrl?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
  timestamp?: string;
}
