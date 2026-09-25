import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  verifyInviteCode,
  getMyOrganization,
  getOrganizationMembers,
  regenerateInviteCode
} from '../controllers/organization.controller.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware.js';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/organizations/invite/{code}:
 *   get:
 *     summary: Verify Organization Invite Code Real-time
 *     description: Public endpoint used by the frontend signup toggle to verify invite codes in real-time and retrieve the organization name and location.
 *     tags:
 *       - Organizations
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The 6-character organization invite code
 *         example: ACME-4821
 *     responses:
 *       200:
 *         description: Invite code is valid and organization details returned
 *       400:
 *         description: Invite code has been revoked
 *       404:
 *         description: Invalid invite code. Organization not found
 */
router.get('/invite/:code', asyncHandler(verifyInviteCode));

/**
 * @openapi
 * /api/v1/organizations/invite/regenerate:
 *   post:
 *     summary: Regenerate Organization Invite Code (SuperAdmin Only)
 *     description: Generates a new random invite code for the organization and revokes the previous code so it can no longer be used.
 *     tags:
 *       - Organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New invite code generated successfully and previous code revoked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 */
router.post('/invite/regenerate', authenticateUser, authorizeRoles('SuperAdmin'), asyncHandler(regenerateInviteCode));

/**
 * @openapi
 * /api/v1/organizations/me:
 *   get:
 *     summary: Get My Organization Profile
 *     description: Returns organization details and owner information for the authenticated user.
 *     tags:
 *       - Organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User does not belong to an organization
 */
router.get('/me', authenticateUser, asyncHandler(getMyOrganization));

/**
 * @openapi
 * /api/v1/organizations/members:
 *   get:
 *     summary: List All Organization Members
 *     description: Returns all team members belonging to the authenticated user's organization (for populating members table & assigning hosts/members to projects).
 *     tags:
 *       - Organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organization members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: User does not belong to any organization
 */
router.get('/members', authenticateUser, asyncHandler(getOrganizationMembers));

export default router;


