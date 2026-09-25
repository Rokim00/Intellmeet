import { Request } from 'express';
import { ApiError } from './apiError.js';

/**
 * Reads the organization id from the verified JWT. Controllers should never
 * reach into `req.user` field by field — that pattern repeated in every handler
 * and made it easy to forget one.
 */
export const getRequestScope = (req: Request): { userId: string; organizationId: string } => ({
  userId: req.user?.id || '',
  organizationId: req.user?.organizationId || ''
});

/**
 * Every organization-scoped service starts with this. Replaces the same
 * hand-rolled `if (!organizationId) throw ...` guard that appeared in six
 * places with six slightly different messages.
 */
export const requireOrganizationId = (organizationId: string, action: string): string => {
  if (!organizationId) {
    throw ApiError.badRequest(`User must belong to an organization to ${action}`);
  }
  return organizationId;
};
