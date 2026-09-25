import { Ref } from '@typegoose/typegoose';
import { UserClass } from '../models/user.model.js';

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  location?: string;
  inviteCode: string;
  ownerId: Ref<UserClass> | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrganizationInput {
  name: string;
  slug?: string;
  location?: string;
}

export interface IVerifyInviteCodeResponse {
  valid: boolean;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  location?: string;
}
