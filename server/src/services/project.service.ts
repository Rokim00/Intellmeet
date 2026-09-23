import { Project } from '../models/project.model.js';
import { Organization } from '../models/organization.model.js';
import { ApiError } from '../utils/apiError.js';
import { ICreateProjectInput, IUpdateProjectInput } from '../types/index.js';
import { generateProjectCode } from '../utils/codeGenerator.js';

export const createProjectService = async (
  input: ICreateProjectInput,
  organizationId: string,
  userId: string
) => {
  if (!organizationId) {
    throw ApiError.badRequest('User must belong to an organization to create projects');
  }

  const projectName = (input.projectName || input.name || '').trim();
  if (!projectName) {
    throw ApiError.badRequest('Project name is required', [
      { field: 'name', message: 'Project name is required' },
      { field: 'projectName', message: 'Project name is required' }
    ]);
  }

  const projectDesc = (input.projectDescription || input.description || '').trim();
  const projectStatus = input.projectStatus || input.status || 'active';
  const projectHosts = input.projectHosts || input.hosts;
  const projectMembers = input.projectMembers || input.members;

  const org = await Organization.findById(organizationId);
  const orgSlug = org?.organization_slug || 'ORG';
  const generatedProjectCode = generateProjectCode(orgSlug, projectName);

  const projectData: Record<string, unknown> = {
    project_name: projectName,
    project_code: generatedProjectCode,
    project_description: projectDesc,
    organization_id: organizationId,
    project_status: projectStatus,
    created_by: userId
  };

  if (projectHosts && Array.isArray(projectHosts) && projectHosts.length > 0) {
    projectData.project_hosts = projectHosts;
  }

  if (projectMembers && Array.isArray(projectMembers) && projectMembers.length > 0) {
    projectData.project_members = projectMembers;
  }

  const project = await Project.create(projectData);

  return await Project.findById(project._id)
    .populate('project_hosts', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('project_members', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('created_by', 'user_name user_email avatar_url user_role is_super_admin');
};

export const getProjectsService = async (organizationId: string) => {
  if (!organizationId) {
    throw ApiError.badRequest('User must belong to an organization to view projects');
  }

  return await Project.find({ organization_id: organizationId, project_status: { $ne: 'archived' } })
    .populate('project_hosts', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('project_members', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('created_by', 'user_name user_email avatar_url user_role is_super_admin')
    .sort({ createdAt: -1 });
};

export const getProjectByIdService = async (projectId: string, organizationId: string) => {
  const project = await Project.findOne({ _id: projectId, organization_id: organizationId })
    .populate('project_hosts', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('project_members', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('created_by', 'user_name user_email avatar_url user_role is_super_admin');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

export const updateProjectService = async (
  projectId: string,
  organizationId: string,
  input: IUpdateProjectInput
) => {
  const project = await Project.findOne({ _id: projectId, organization_id: organizationId });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const updatedName = input.projectName !== undefined ? input.projectName : input.name;
  if (updatedName !== undefined) project.project_name = updatedName.trim();

  const updatedDesc = input.projectDescription !== undefined ? input.projectDescription : input.description;
  if (updatedDesc !== undefined) project.project_description = updatedDesc.trim();

  const updatedStatus = input.projectStatus !== undefined ? input.projectStatus : input.status;
  if (updatedStatus !== undefined) project.project_status = updatedStatus;

  const updatedHosts = input.projectHosts !== undefined ? input.projectHosts : input.hosts;
  if (updatedHosts !== undefined) project.project_hosts = updatedHosts as unknown as typeof project.project_hosts;

  const updatedMembers = input.projectMembers !== undefined ? input.projectMembers : input.members;
  if (updatedMembers !== undefined) project.project_members = updatedMembers as unknown as typeof project.project_members;

  await project.save();

  return await Project.findById(project._id)
    .populate('project_hosts', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('project_members', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('created_by', 'user_name user_email avatar_url user_role is_super_admin');
};

export const deleteProjectService = async (projectId: string, organizationId: string) => {
  const project = await Project.findOneAndDelete({ _id: projectId, organization_id: organizationId });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }
};
