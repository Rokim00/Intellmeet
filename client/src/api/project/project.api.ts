import client from '../client';
import type { Project, CreateProjectDTO } from '@/types/project.types';

export const getProjects = () =>
  client.get<{ data: Project[] }>('/projects');

export const getProjectById = (id: string) =>
  client.get<{ data: Project }>(`/projects/${id}`);

export const createProject = (data: CreateProjectDTO) =>
  client.post<{ data: Project }>('/projects', {
    projectName: data.projectName || data.name,
    name: data.name || data.projectName,
    projectDescription: data.projectDescription || data.description || '',
    description: data.description || data.projectDescription || '',
    projectStatus: data.projectStatus || data.status || 'active',
    status: data.status || data.projectStatus || 'active',
  });

export const updateProject = (id: string, data: Partial<CreateProjectDTO>) =>
  client.patch<{ data: Project }>(`/projects/${id}`, data);

export const deleteProject = (id: string) =>
  client.delete(`/projects/${id}`);
