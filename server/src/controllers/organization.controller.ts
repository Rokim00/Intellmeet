import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  verifyInviteCodeService,
  regenerateInviteCodeService,
  getMyOrganizationService,
  getOrganizationMembersService
} from '../services/organization.service.js';

export const verifyInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.params;
  const result = await verifyInviteCodeService(code);
  return ApiResponse.success(res, 'Invite code verified successfully', result, 200);
};

export const regenerateInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId as string;
  const result = await regenerateInviteCodeService(orgId);
  return ApiResponse.success(
    res,
    'New invite code generated successfully. Previous invite code has been revoked.',
    result,
    200
  );
};

export const getMyOrganization = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId as string;
  const result = await getMyOrganizationService(orgId);
  return ApiResponse.success(res, 'Organization details retrieved successfully', result, 200);
};

export const getOrganizationMembers = async (req: Request, res: Response): Promise<Response> => {
  const orgId = req.user?.organizationId as string;
  const members = await getOrganizationMembersService(orgId);
  return ApiResponse.success(res, 'Organization members retrieved successfully', members, 200);
};
