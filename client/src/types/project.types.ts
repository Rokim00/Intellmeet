export type ProjectStatus = 'active' | 'archived' | 'completed' | 'planning';

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

export interface CreateProjectDTO {
  name: string;
  projectName?: string;
  description?: string;
  projectDescription?: string;
  status?: string;
  projectStatus?: string;
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
