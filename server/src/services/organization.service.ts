import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { IVerifyInviteCodeResponse } from '../types/index.js';
import { generateOrgInviteCode } from '../utils/codeGenerator.js';

export const verifyInviteCodeService = async (inviteCode: string): Promise<IVerifyInviteCodeResponse> => {
  if (!inviteCode || inviteCode.trim() === '') {
    throw ApiError.badRequest('Invite code is required', [
      { field: 'inviteCode', message: 'Invite code is required' }
    ]);
  }

  const cleanCode = inviteCode.trim().toUpperCase();

  // Check if code was previously revoked
  const revokedOrg = await Organization.findOne({ revoked_invite_codes: cleanCode });
  if (revokedOrg) {
    throw ApiError.badRequest('This invite code has been revoked. Please request an updated invite code from your SuperAdmin.', [
      { field: 'inviteCode', message: 'Invite code is revoked' }
    ]);
  }

  const org = await Organization.findOne({ organization_invite_code: cleanCode });

  if (!org) {
    throw ApiError.notFound('Invalid invite code. Organization not found');
  }

  return {
    valid: true,
    organizationId: org._id.toString(),
    organizationName: org.organization_name,
    organizationSlug: org.organization_slug,
    location: org.organization_location || ''
  };
};

export const regenerateInviteCodeService = async (orgId: string) => {
  if (!orgId) {
    throw ApiError.badRequest('User must belong to an organization to regenerate invite code');
  }

  const org = await Organization.findById(orgId);
  if (!org) {
    throw ApiError.notFound('Organization not found');
  }

  const currentCode = org.organization_invite_code;
  const newInviteCode = generateOrgInviteCode(org.organization_slug);

  // Initialize array if needed and revoke the old code
  if (!org.revoked_invite_codes) {
    org.revoked_invite_codes = [];
  }

  if (currentCode && !org.revoked_invite_codes.includes(currentCode)) {
    org.revoked_invite_codes.push(currentCode);
  }

  org.organization_invite_code = newInviteCode;
  await org.save();

  return {
    organizationId: org._id.toString(),
    organizationName: org.organization_name,
    newInviteCode,
    previousInviteCode: currentCode,
    revokedInviteCodes: org.revoked_invite_codes
  };
};

export const getMyOrganizationService = async (orgId: string) => {
  if (!orgId) {
    throw ApiError.badRequest('User does not belong to any organization');
  }

  const org = await Organization.findById(orgId).populate(
    'organization_owner_id',
    'user_name user_email avatar_url user_role is_super_admin created_at updated_at'
  );
  if (!org) {
    throw ApiError.notFound('Organization not found');
  }

  return org;
};

export const getOrganizationMembersService = async (orgId: string) => {
  if (!orgId) {
    throw ApiError.badRequest('User does not belong to any organization');
  }

  return await User.find({ organization_id: orgId })
    .select('_id user_name user_email user_role is_super_admin avatar_url created_at updated_at')
    .sort({ createdAt: -1 });
};
