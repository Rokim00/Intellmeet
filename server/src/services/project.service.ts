import { Project } from '../models/project.model.js';
import { User } from '../models/user.model.js';
import { Organization } from '../models/organization.model.js';
import { ApiError } from '../utils/apiError.js';
import {
  IAddProjectMembersInput,
  ICreateProjectInput,
  IProjectMember,
  IUpdateProjectInput,
  IUpdateProjectMemberRoleInput,
  ProjectRole
} from '../types/index.js';
import { generateProjectCode } from '../utils/codeGenerator.js';
import { getPagination, buildPaginatedResult } from '../utils/pagination.js';
import { findPaginated } from '../utils/paginatedFind.js';
import { assertObjectId, toObjectIdString } from '../utils/objectId.js';
import { requireOrganizationId } from '../utils/scope.js';
import { USER_POPULATE, USER_SELECT } from '../utils/projections.js';

export const PROJECT_MEMBER_LIMIT = 50;
export const PROJECT_HOST_LIMIT = 3;

const PROJECT_POPULATE = [
  { path: 'project_hosts', select: USER_POPULATE },
  { path: 'project_members', select: USER_POPULATE },
  { path: 'created_by', select: USER_POPULATE }
];

/** Every project lookup is tenant-scoped: an id alone never grants access. */
const findScopedProject = async (projectId: string, organizationId: string) => {
  const project = await Project.findOne({ _id: projectId, organization_id: organizationId });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }
  return project;
};

const findPopulatedProject = async (projectId: string) =>
  await Project.findById(projectId)
    .populate('project_hosts', USER_POPULATE)
    .populate('project_members', USER_POPULATE)
    .populate('created_by', USER_POPULATE);

/** Builds the project-scoped member list: every host is also a member of that project. */
const buildMemberList = (project: {
  project_hosts: unknown[];
  project_members: unknown[];
}): IProjectMember[] => {
  const hosts = new Set(project.project_hosts.map(toObjectIdString));
  const all = new Set<string>([...hosts, ...project.project_members.map(toObjectIdString)]);

  return [...all].map((userId) => ({ userId, projectRole: hosts.has(userId) ? 'Host' : 'Member' }));
};

const PROJECT_ROLES: ProjectRole[] = ['Member', 'Host'];

const assertProjectRole = (role: string): void => {
  if (!PROJECT_ROLES.includes(role as ProjectRole)) {
    throw ApiError.badRequest('projectRole must be either Member or Host', [
      { field: 'projectRole', message: 'Invalid projectRole' }
    ]);
  }
};

/** Guards the per-project roster caps. Demotions are always allowed; only growth is blocked. */
const assertRosterLimits = (memberIds: string[], hostIds: string[]) => {
  if (memberIds.length > PROJECT_MEMBER_LIMIT) {
    throw ApiError.badRequest(
      `A project can have at most ${PROJECT_MEMBER_LIMIT} members. This request would result in ${memberIds.length}.`,
      [{ field: 'userIds', message: `Member limit of ${PROJECT_MEMBER_LIMIT} exceeded` }]
    );
  }
  if (hostIds.length > PROJECT_HOST_LIMIT) {
    throw ApiError.badRequest(
      `A project can have at most ${PROJECT_HOST_LIMIT} hosts. Demote an existing host to Member before promoting another.`,
      [{ field: 'projectRole', message: `Host limit of ${PROJECT_HOST_LIMIT} exceeded` }]
    );
  }
};

const assertProjectMemberUsers = async (userIds: string[], organizationId: string) => {
  const validIds = [...new Set(userIds.map((id) => assertObjectId(id, 'userId')))];

  const found = await User.find({ _id: { $in: validIds } })
    .select(USER_SELECT)
    .lean();

  const foundIds = new Set(found.map((u) => u._id.toString()));
  const invalidIds = validIds.filter((id) => !foundIds.has(id));
  if (invalidIds.length > 0) {
    throw ApiError.badRequest('One or more users do not exist', [
      { field: 'userIds', message: `Unknown userIds: ${invalidIds.join(', ')}` }
    ]);
  }

  const crossOrgIds = found.filter((u) => !u.organization_id || u.organization_id.toString() !== organizationId);
  if (crossOrgIds.length > 0) {
    throw ApiError.badRequest('All members must belong to the same organization', [
      { field: 'userIds', message: `Users not in your organization: ${crossOrgIds.map((u) => u._id).join(', ')}` }
    ]);
  }

  return found;
};

export const getProjectMembersService = async (
  projectId: string,
  organizationId: string,
  query: Record<string, unknown> = {}
) => {
  requireOrganizationId(organizationId, 'view project members');
  assertObjectId(projectId, 'id');

  const project = await findScopedProject(projectId, organizationId);

  const allMembers = buildMemberList(project);
  const pagination = getPagination(query);
  const pageMembers = allMembers.slice(pagination.skip, pagination.skip + pagination.limit);

  const users = await User.find({ _id: { $in: pageMembers.map((m) => m.userId) } })
    .select(USER_SELECT)
    .lean();

  const userById = new Map(users.map((u) => [u._id.toString(), u]));

  return {
    ...buildPaginatedResult(
      pageMembers.map((m) => ({ ...m, user: userById.get(m.userId) ?? null })),
      allMembers.length,
      pagination
    ),
    projectId: project._id.toString(),
    projectName: project.project_name,
    memberCount: allMembers.length,
    hostCount: allMembers.filter((m) => m.projectRole === 'Host').length,
    limits: { maxMembers: PROJECT_MEMBER_LIMIT, maxHosts: PROJECT_HOST_LIMIT }
  };
};

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
    await assertProjectMemberUsers(projectHosts, organizationId);
  }

  if (projectMembers && Array.isArray(projectMembers) && projectMembers.length > 0) {
    await assertProjectMemberUsers(projectMembers, organizationId);
  }

  if (projectHosts && Array.isArray(projectHosts) && projectHosts.length > 0) {
    const hostIds = [...new Set(projectHosts)];
    const memberIds = new Set([...hostIds, ...(projectMembers ?? [])].map(String));
    assertRosterLimits([...memberIds], hostIds);
    projectData.project_hosts = hostIds;
    projectData.project_members = [...memberIds];
  } else if (projectMembers && Array.isArray(projectMembers) && projectMembers.length > 0) {
    const memberIds = [...new Set(projectMembers.map(String))];
    assertRosterLimits(memberIds, []);
    projectData.project_members = memberIds;
  }

  const project = await Project.create(projectData);

  return await Project.findById(project._id)
    .populate('project_hosts', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('project_members', 'user_name user_email avatar_url user_role is_super_admin')
    .populate('created_by', 'user_name user_email avatar_url user_role is_super_admin');
};

export const getProjectsService = async (
  organizationId: string,
  query: Record<string, unknown> = {}
) => {
  requireOrganizationId(organizationId, 'view projects');

  return findPaginated(
    Project,
    { organization_id: organizationId, project_status: { $ne: 'archived' } },
    query,
    { sort: { created_at: -1 }, populate: PROJECT_POPULATE }
  );
};

export const getProjectByIdService = async (projectId: string, organizationId: string) => {
  // Scope by organization first: a bare findById would let any org read any project.
  await findScopedProject(assertObjectId(projectId, 'id'), organizationId);

  return await Project.findById(projectId)
    .populate('project_hosts', USER_POPULATE)
    .populate('project_members', USER_POPULATE)
    .populate('created_by', USER_POPULATE);
};

export const updateProjectService = async (
  projectId: string,
  organizationId: string,
  input: IUpdateProjectInput
) => {
  const project = await findScopedProject(assertObjectId(projectId, 'id'), organizationId);

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

  return findPopulatedProject(project._id.toString());
};

export const deleteProjectService = async (projectId: string, organizationId: string) => {
  const project = await Project.findOneAndDelete({ _id: projectId, organization_id: organizationId });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }
};

export const addProjectMembersService = async (
  projectId: string,
  organizationId: string,
  input: IAddProjectMembersInput
) => {
  requireOrganizationId(organizationId, 'manage project members');
  assertObjectId(projectId, 'id');

  const userIds = Array.isArray(input.userIds) ? input.userIds.filter(Boolean) : [];
  if (userIds.length === 0) {
    throw ApiError.badRequest('userIds is required and must contain at least one user', [
      { field: 'userIds', message: 'Provide at least one userId' }
    ]);
  }

  const projectRole: ProjectRole = input.projectRole ?? 'Member';
  assertProjectRole(projectRole);

  const project = await findScopedProject(projectId, organizationId);

  await assertProjectMemberUsers(userIds, organizationId);

  const members = new Set(project.project_members.map(toObjectIdString));
  const hosts = new Set(project.project_hosts.map(toObjectIdString));

  for (const userId of userIds) {
    members.add(userId);
    if (projectRole === 'Host') hosts.add(userId);
  }

  assertRosterLimits([...members], [...hosts]);

  project.project_members = [...members] as unknown as typeof project.project_members;
  project.project_hosts = [...hosts] as unknown as typeof project.project_hosts;
  await project.save();

  const populated = await findPopulatedProject(project._id.toString());
  return { project: populated, members: buildMemberList(project) };
};

export const updateProjectMemberRoleService = async (
  projectId: string,
  organizationId: string,
  userId: string,
  input: IUpdateProjectMemberRoleInput
) => {
  if (!organizationId) {
    throw ApiError.badRequest('User must belong to an organization to manage project members');
  }
  assertObjectId(projectId, 'id');
  assertObjectId(userId, 'userId');

  const projectRole: ProjectRole = input.projectRole;
  assertProjectRole(projectRole);

  const project = await findScopedProject(projectId, organizationId);

  const members = new Set(project.project_members.map(toObjectIdString));
  const hosts = new Set(project.project_hosts.map(toObjectIdString));

  if (!members.has(userId) && !hosts.has(userId)) {
    throw ApiError.notFound('User is not a member of this project');
  }

  members.add(userId);
  if (projectRole === 'Host') {
    hosts.add(userId);
  } else {
    hosts.delete(userId);
  }

  assertRosterLimits([...members], [...hosts]);

  project.project_members = [...members] as unknown as typeof project.project_members;
  project.project_hosts = [...hosts] as unknown as typeof project.project_hosts;
  await project.save();

  const populated = await findPopulatedProject(project._id.toString());
  return {
    project: populated,
    members: buildMemberList(project),
    member: { userId, projectRole }
  };
};

export const removeProjectMemberService = async (
  projectId: string,
  organizationId: string,
  userId: string
) => {
  requireOrganizationId(organizationId, 'manage project members');
  assertObjectId(projectId, 'id');
  assertObjectId(userId, 'userId');

  const project = await findScopedProject(projectId, organizationId);

  const members = project.project_members.map(toObjectIdString);
  const hosts = project.project_hosts.map(toObjectIdString);

  if (!members.includes(userId) && !hosts.includes(userId)) {
    throw ApiError.notFound('User is not a member of this project');
  }

  project.project_members = members.filter((id) => id !== userId) as unknown as typeof project.project_members;
  project.project_hosts = hosts.filter((id) => id !== userId) as unknown as typeof project.project_hosts;
  await project.save();

  const populated = await findPopulatedProject(project._id.toString());
  return { project: populated, members: buildMemberList(project) };
};
