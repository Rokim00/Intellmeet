import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { getRequestScope } from '../utils/scope.js';
import {
  createProjectService,
  getProjectsService,
  getProjectByIdService,
  getProjectMembersService,
  updateProjectService,
  deleteProjectService,
  addProjectMembersService,
  updateProjectMemberRoleService,
  removeProjectMemberService
} from '../services/project.service.js';

export const createProject = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId, userId } = getRequestScope(req);

  const project = await createProjectService(req.body, organizationId, userId);

  return ApiResponse.success(res, 'Project created successfully', project, 201);
};

export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const projects = await getProjectsService(organizationId, req.query as Record<string, unknown>);

  return ApiResponse.success(res, 'Projects retrieved successfully', projects, 200);
};

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id } = req.params;

  const project = await getProjectByIdService(id, organizationId);

  return ApiResponse.success(res, 'Project details retrieved', project, 200);
};

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id } = req.params;

  const updatedProject = await updateProjectService(id, organizationId, req.body);

  return ApiResponse.success(res, 'Project updated successfully', updatedProject, 200);
};

export const deleteProject = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id } = req.params;

  await deleteProjectService(id, organizationId);

  return ApiResponse.success(res, 'Project deleted successfully', null, 200);
};


export const getProjectMembers = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id } = req.params;

  const result = await getProjectMembersService(id, organizationId, req.query as Record<string, unknown>);

  return ApiResponse.success(res, 'Project members retrieved successfully', result, 200);
};

export const addProjectMembers = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id } = req.params;

  const result = await addProjectMembersService(id, organizationId, req.body);

  return ApiResponse.success(res, 'Members added to project successfully', result, 200);
};

export const updateProjectMemberRole = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id, userId } = req.params;

  const result = await updateProjectMemberRoleService(id, organizationId, userId, req.body);

  return ApiResponse.success(res, 'Project member role updated successfully', result, 200);
};

export const removeProjectMember = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const { id, userId } = req.params;

  const result = await removeProjectMemberService(id, organizationId, userId);

  return ApiResponse.success(res, 'Member removed from project successfully', result, 200);
};
