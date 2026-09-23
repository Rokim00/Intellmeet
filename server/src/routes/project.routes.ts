import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controller.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware.js';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     summary: Create New Project (SuperAdmin Only)
 *     tags: [Projects]
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
 *               projectDescription:
 *                 type: string
 *               projectStatus:
 *                 type: string
 *                 enum: [active, archived, completed]
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
 *         description: Project created
 *   get:
 *     summary: List Organization Projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.post('/', authenticateUser, authorizeRoles('SuperAdmin'), createProject);
router.get('/', authenticateUser, getProjects);

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get Project Details
 *     tags: [Projects]
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
 *         description: Project details
 *   patch:
 *     summary: Update Project / Assign Hosts & Members (SuperAdmin Only)
 *     tags: [Projects]
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
 *         description: Project updated
 *   delete:
 *     summary: Delete Project (SuperAdmin Only)
 *     tags: [Projects]
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
 *         description: Project deleted
 */
router.get('/:id', authenticateUser, getProjectById);
router.patch('/:id', authenticateUser, authorizeRoles('SuperAdmin'), updateProject);
router.delete('/:id', authenticateUser, authorizeRoles('SuperAdmin'), deleteProject);

export default router;
