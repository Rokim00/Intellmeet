import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: User Signup & Dynamic Organization Setup
 *     description: |
 *       Creates a new user account.
 *       - **Case 1 (isCreatingOrg: true)**: Creates a new Organization, automatically generates a unique invite code, and sets user as SuperAdmin. Do NOT include `inviteCode`.
 *       - **Case 2 (isCreatingOrg: false)**: Joins an existing Organization using its `inviteCode`. Sets user as Member.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - title: Create Organization (SuperAdmin)
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - password
 *                   - isCreatingOrg
 *                   - organizationName
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Alex Morgan
 *                   email:
 *                     type: string
 *                     example: alex@acmecorp.com
 *                   password:
 *                     type: string
 *                     example: SecurePass123!
 *                   isCreatingOrg:
 *                     type: boolean
 *                     example: true
 *                   organizationName:
 *                     type: string
 *                     example: Acme Corporation
 *                   organizationLocation:
 *                     type: string
 *                     example: San Francisco, USA
 *                   organizationSlug:
 *                     type: string
 *                     example: acme
 *               - title: Join via Invite Code (Member)
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - password
 *                   - isCreatingOrg
 *                   - inviteCode
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Jane Smith
 *                   email:
 *                     type: string
 *                     example: jane@acmecorp.com
 *                   password:
 *                     type: string
 *                     example: SecurePass123!
 *                   isCreatingOrg:
 *                     type: boolean
 *                     example: false
 *                   inviteCode:
 *                     type: string
 *                     example: ACME-K9X3P7
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or invite code invalid / revoked
 */
router.post('/signup', asyncHandler(registerUser));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates user credentials, sets HTTP-only refresh cookie, and returns access token + populated organization details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: alex@acmecorp.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', asyncHandler(loginUser));

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     description: Rotates refresh token from HTTP-only cookie and generates a new 15-minute access token.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', asyncHandler(refreshAccessToken));

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Invalidates refresh token in MongoDB and clears HTTP-only cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', asyncHandler(logoutUser));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current Authenticated User Profile & Organization
 *     description: Protected route returning full user profile and populated organization information.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized / Missing token
 */
router.get('/me', authenticateUser, asyncHandler(getCurrentUser));

export default router;
