import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  createProjectService,
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService
} from '../services/project.service.js';

export const createProject = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId || '';
  const userId = req.user?.id || '';

  const project = await createProjectService(req.body, orgId, userId);

  return ApiResponse.success(res, 'Project created successfully', project, 201);
};

export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId || '';
  const projects = await getProjectsService(orgId);

  return ApiResponse.success(res, 'Projects retrieved successfully', projects, 200);
};

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId || '';
  const { id } = req.params;

  const project = await getProjectByIdService(id, orgId);

  return ApiResponse.success(res, 'Project details retrieved', project, 200);
};

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId || '';
  const { id } = req.params;

  const updatedProject = await updateProjectService(id, orgId, req.body);

  return ApiResponse.success(res, 'Project updated successfully', updatedProject, 200);
};

export const deleteProject = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId || '';
  const { id } = req.params;

  await deleteProjectService(id, orgId);

  return ApiResponse.success(res, 'Project deleted successfully', null, 200);
};
