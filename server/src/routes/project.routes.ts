import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controller.js';

const router: Router = Router();

// All project routes require authentication
router.use(authenticateUser);

/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     summary: Create a New Project (SuperAdmin Only)
 *     description: Creates a project scoped to the SuperAdmin's organization.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName]
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Mobile App v2
 *               projectDescription:
 *                 type: string
 *                 example: Next generation mobile conferencing app
 *               projectStatus:
 *                 type: string
 *                 enum: [active, archived, completed]
 *                 example: active
 *               projectHosts:
 *                 type: array
 *                 items:
 *                   type: string
 *               projectMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 */
router.post('/', authorizeRoles('SuperAdmin'), asyncHandler(createProject));

/**
 * @openapi
 * /api/v1/projects:
 *   get:
 *     summary: List Organization Projects
 *     description: Returns all active projects belonging to the authenticated user's organization.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects list retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', asyncHandler(getProjects));

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get Project Details By ID
 *     description: Retrieves details of a specific project with populated host and member information.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details retrieved
 *       404:
 *         description: Project not found
 */
router.get('/:id', asyncHandler(getProjectById));

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   patch:
 *     summary: Update Project Details & Assign Hosts (SuperAdmin Only)
 *     description: Updates project metadata, status, or assigns project Hosts / Members.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 *       404:
 *         description: Project not found
 */
router.patch('/:id', authorizeRoles('SuperAdmin'), asyncHandler(updateProject));

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete Project (SuperAdmin Only)
 *     description: Permanently removes a project from the organization.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 *       404:
 *         description: Project not found
 */
router.delete('/:id', authorizeRoles('SuperAdmin'), asyncHandler(deleteProject));

export default router;
