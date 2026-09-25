import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { getRequestScope } from '../utils/scope.js';
import {
  verifyInviteCodeService,
  getMyOrganizationService,
  getOrganizationMembersService,
  regenerateInviteCodeService
} from '../services/organization.service.js';

export const verifyInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.params;
  const result = await verifyInviteCodeService(code);

  return ApiResponse.success(
    res,
    'Invite code verified successfully',
    result,
    200
  );
};

export const getMyOrganization = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const result = await getMyOrganizationService(organizationId);

  return ApiResponse.success(
    res,
    'Organization details retrieved',
    result,
    200
  );
};

export const getOrganizationMembers = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const result = await getOrganizationMembersService(organizationId, req.query as Record<string, unknown>);

  return ApiResponse.success(
    res,
    'Organization members retrieved successfully',
    result,
    200
  );
};

export const regenerateInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const { organizationId } = getRequestScope(req);
  const result = await regenerateInviteCodeService(organizationId);

  return ApiResponse.success(
    res,
    'New invite code generated successfully. Previous invite code has been revoked.',
    result,
    200
  );
};


