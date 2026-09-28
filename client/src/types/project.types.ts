export type ProjectRole = 'Member' | 'Host';

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface ProjectMember {
  userId: string;
  projectRole: ProjectRole;
  user?: {
    _id: string;
    user_name: string;
    user_email: string;
    avatar_url: string;
    user_role: string;
    is_super_admin: boolean;
  } | null;
}

export interface ProjectMembersResponse {
  projectId: string;
  projectName: string;
  members: ProjectMember[];
  memberCount: number;
  hostCount: number;
  limits: { maxMembers: number; maxHosts: number };
}

export interface AddProjectMembersDTO {
  userIds: string[];
  projectRole?: ProjectRole;
}

export interface UpdateProjectMemberRoleDTO {
  projectRole: ProjectRole;
}

export interface CreateProjectDTO {
  projectName: string;
  projectDescription?: string;
  projectStatus?: ProjectStatus;
  members?: string[];
  hosts?: string[];
}

export interface ProjectMutationResponse {
  project: Project;
  members: ProjectMember[];
  member?: { userId: string; projectRole: ProjectRole };
}

export interface Project {
  id?: string;
  projectId?: string;
  name?: string;
  projectName?: string;
  key?: string;
  projectCode?: string;
  description?: string;
  projectDescription?: string;
  status?: string;
  projectStatus?: string;
  hosts?: string[];
  members?: string[];
  memberCount?: number;
  meetingCount?: number;
  taskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getProjectName = (p?: Project | null): string => {
  if (!p) return 'Select Project';
  return p.projectName || p.name || 'Untitled Project';
};

export const getProjectCode = (p?: Project | null): string => {
  if (!p) return 'PRJ';
  if (p.projectCode) return p.projectCode;
  if (p.key) return p.key;
  const name = p.projectName || p.name || 'PRJ';
  return name.substring(0, 3).toUpperCase();
};

export const getProjectDesc = (p?: Project | null): string => {
  if (!p) return '';
  return p.projectDescription || p.description || '';
};

export const getProjectStatus = (p?: Project | null): string => {
  if (!p) return 'active';
  const s = p.projectStatus || p.status || 'active';
  return s.toLowerCase();
};

export const getProjectId = (p?: Project | null): string => {
  if (!p) return '';
  return p.projectId || p.id || '';
};
