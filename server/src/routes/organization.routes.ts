import { Router } from 'express';
import {
  verifyInviteCode,
  regenerateInviteCode,
  getMyOrganization,
  getOrganizationMembers
} from '../controllers/organization.controller.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware.js';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/organizations/invite/{code}:
 *   get:
 *     summary: Verify Organization Invite Code
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite code valid
 *       400:
 *         description: Code revoked or invalid format
 *       404:
 *         description: Organization not found
 */
router.get('/invite/:code', verifyInviteCode);

/**
 * @openapi
 * /api/v1/organizations/invite/regenerate:
 *   post:
 *     summary: Regenerate Organization Invite Code (SuperAdmin Only)
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fresh invite code generated and previous code revoked
 */
router.post('/invite/regenerate', authenticateUser, authorizeRoles('SuperAdmin'), regenerateInviteCode);

/**
 * @openapi
 * /api/v1/organizations/me:
 *   get:
 *     summary: Get My Organization Details
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details
 */
router.get('/me', authenticateUser, getMyOrganization);

/**
 * @openapi
 * /api/v1/organizations/members:
 *   get:
 *     summary: Get Organization Members
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of members in organization
 */
router.get('/members', authenticateUser, getOrganizationMembers);

export default router;
