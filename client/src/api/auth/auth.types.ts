// Exact shape from server toJSON transform (user.model.ts)
export interface User {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'SuperAdmin' | 'Admin' | 'Member';
  isSuperAdmin: boolean;
  avatarUrl: string;
  organizationId?: string | OrganizationSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationSummary {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLocation?: string;
  organizationDescription?: string;
  inviteCode: string;
  ownerId?: string;
}

// Matches IUserLoginInput on server
export interface LoginDTO {
  email: string;
  password: string;
}

// Matches IUserRegisterInput on server (accepts both name/userName, email/userEmail)
export interface SignupDTO {
  name: string;           // server reads: input.userName || input.name
  email: string;          // server reads: input.userEmail || input.email
  password: string;
  isCreatingOrg: boolean;
  organizationName?: string;
  organizationLocation?: string;
  organizationSlug?: string;
  inviteCode?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: User;           // password is select:false — never returned
    accessToken: string;
  };
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: FieldError[];
  timestamp: string;
}
