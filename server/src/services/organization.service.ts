import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { IVerifyInviteCodeResponse } from '../types/index.js';
import { generateOrgInviteCode } from '../utils/codeGenerator.js';
import { findPaginated } from '../utils/paginatedFind.js';
import { requireOrganizationId } from '../utils/scope.js';
import { ORGANIZATION_OWNER_POPULATE, USER_LIST_SELECT } from '../utils/projections.js';

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
  requireOrganizationId(orgId, 'regenerate the invite code');

  const org = await Organization.findById(orgId);
  if (!org) {
    throw ApiError.notFound('Organization not found');
  }

  const currentCode = org.organization_invite_code;
  const newInviteCode = generateOrgInviteCode(org.organization_slug);

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
  requireOrganizationId(orgId, 'view this organization');

  const org = await Organization.findById(orgId).populate(
    'organization_owner_id',
    ORGANIZATION_OWNER_POPULATE
  );
  if (!org) {
    throw ApiError.notFound('Organization not found');
  }

  return org;
};

export const getOrganizationMembersService = async (
  orgId: string,
  query: Record<string, unknown> = {}
) => {
  requireOrganizationId(orgId, 'view organization members');

  return findPaginated(User, { organization_id: orgId }, query, {
    sort: { created_at: -1 },
    select: USER_LIST_SELECT
  });
};
