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
 *     summary: User Signup / Registration
 *     description: Creates a new user account with hashed password and returns access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan
 *               email:
 *                 type: string
 *                 example: alex@intellmeet.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [Admin, Member]
 *                 example: Member
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/signup', asyncHandler(registerUser));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates user credentials, sets HTTP-only refresh cookie, and returns access token.
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
 *                 example: alex@intellmeet.com
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
 *     description: Rotates refresh token and generates a new 15-minute access token.
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
 *     description: Invalidates refresh token and clears HTTP-only cookie.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', asyncHandler(logoutUser));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current Authenticated User Profile
 *     description: Protected route returning profile information for the Bearer-authenticated user.
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
