import client from '../client';
import type {
  Project,
  CreateProjectDTO,
  ProjectMembersResponse,
  AddProjectMembersDTO,
  UpdateProjectMemberRoleDTO,
  ProjectMutationResponse,
} from '@/types/project.types';

export const getProjects = () =>
  client.get<{ data: Project[] }>('/projects');

export const getProjectById = (id: string) =>
  client.get<{ data: Project }>(`/projects/${id}`);

export const createProject = (data: CreateProjectDTO) =>
  client.post<{ data: Project }>('/projects', {
    projectName: data.projectName,
    projectDescription: data.projectDescription || '',
    projectStatus: data.projectStatus || 'active',
    members: data.members,
    hosts: data.hosts,
  });

export const updateProject = (id: string, data: Partial<CreateProjectDTO>) =>
  client.patch<{ data: Project }>(`/projects/${id}`, data);

export const deleteProject = async (projectId: string): Promise<null> => {
  await client.delete(`/projects/${projectId}`);
  return null;
};

export const getProjectMembers = async (projectId: string): Promise<ProjectMembersResponse> => {
  const response = await client.get<{ data: ProjectMembersResponse }>(`/projects/${projectId}/members`);
  return response.data.data;
};

export const addProjectMembers = async (
  projectId: string,
  dto: AddProjectMembersDTO
): Promise<ProjectMutationResponse> => {
  const response = await client.post<{ data: ProjectMutationResponse }>(`/projects/${projectId}/members`, dto);
  return response.data.data;
};

export const updateProjectMemberRole = async (
  projectId: string,
  userId: string,
  dto: UpdateProjectMemberRoleDTO
): Promise<ProjectMutationResponse> => {
  const response = await client.patch<{ data: ProjectMutationResponse }>(
    `/projects/${projectId}/members/${userId}/role`,
    dto
  );
  return response.data.data;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string
): Promise<ProjectMutationResponse> => {
  const response = await client.delete<{ data: ProjectMutationResponse }>(
    `/projects/${projectId}/members/${userId}`
  );
  return response.data.data;
};
