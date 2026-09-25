import { Ref } from '@typegoose/typegoose';
import { UserClass } from '../models/user.model.js';
import { OrganizationClass } from '../models/organization.model.js';

export type ProjectStatus = 'active' | 'archived' | 'completed';

/** Role scoped to a single project. Does not affect the user's organization-wide `userRole`. */
export type ProjectRole = 'Member' | 'Host';

export interface IProject {
  _id: string;
  projectId?: string;
  name: string;
  projectName?: string;
  description?: string;
  projectDescription?: string;
  organizationId: Ref<OrganizationClass> | string;
  status: ProjectStatus;
  projectStatus?: ProjectStatus;
  hosts: (Ref<UserClass> | string)[];
  projectHosts?: (Ref<UserClass> | string)[];
  members: (Ref<UserClass> | string)[];
  projectMembers?: (Ref<UserClass> | string)[];
  createdBy: Ref<UserClass> | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProjectInput {
  name?: string;
  projectName?: string;
  description?: string;
  projectDescription?: string;
  status?: ProjectStatus;
  projectStatus?: ProjectStatus;
  hosts?: string[];
  projectHosts?: string[];
  members?: string[];
  projectMembers?: string[];
}

export interface IUpdateProjectInput {
  name?: string;
  projectName?: string;
  description?: string;
  projectDescription?: string;
  status?: ProjectStatus;
  projectStatus?: ProjectStatus;
  hosts?: string[];
  projectHosts?: string[];
  members?: string[];
  projectMembers?: string[];
}

export interface IAddProjectMembersInput {
  userIds: string[];
  projectRole?: ProjectRole;
}

export interface IUpdateProjectMemberRoleInput {
  projectRole: ProjectRole;
}

export interface IProjectMember {
  userId: string;
  projectRole: ProjectRole;
}

