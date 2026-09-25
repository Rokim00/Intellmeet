import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateProject,
  deleteProject,
  addProjectMembers,
  updateProjectMemberRole,
  removeProjectMember
} from '../controllers/project.controller.js';

const router: Router = Router();

// All project routes require authentication
router.use(authenticateUser);

/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     summary: Create a New Project (SuperAdmin Only)
 *     description: Creates a project scoped to the SuperAdmin's organization. Supports both `projectName` (or `name`), `projectDescription` (or `description`), `projectStatus` (or `status`). Optionally seeds the roster via `members` (default role `Member`) and `hosts` (role `Host`); both arrays are validated against the organization and against the 50-member / 3-host caps.
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
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Mobile App v2
 *               name:
 *                 type: string
 *                 example: Mobile App v2
 *               projectDescription:
 *                 type: string
 *                 example: Next generation mobile conferencing app
 *               description:
 *                 type: string
 *                 example: Next generation mobile conferencing app
 *               projectStatus:
 *                 type: string
 *                 enum: [active, archived, completed]
 *                 example: active
 *               status:
 *                 type: string
 *                 enum: [active, archived, completed]
 *                 example: active
 *               projectHosts:
 *                 type: array
 *                 items:
 *                   type: string
 *               hosts:
 *                 type: array
 *                 items:
 *                   type: string
 *               projectMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *               members:
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
 *         example: 6742a1b2c3d4e5f678901234
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mobile App v2 (Production)
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived, completed]
 *               hosts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of User ObjectIds assigned as Hosts for this project
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
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
 * /api/v1/projects/{id}/members:
 *   get:
 *     summary: List Project Members
 *     description: Returns every member of the project with their project-scoped role (`Host` or `Member`), plus roster counts and the enforced caps (max 50 members, max 3 hosts).
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
 *         description: Project members retrieved successfully
 *       400:
 *         description: Validation failed (invalid project id)
 *       404:
 *         description: Project not found
 */
router.get('/:id/members', asyncHandler(getProjectMembers));

/**
 * @openapi
 * /api/v1/projects/{id}/members:
 *   post:
 *     summary: Add / Assign Members to Project (SuperAdmin Only)
 *     description: Adds organization members to a specific project with a project-scoped role (`Member` or `Host`). Accepts a single userId or a bulk multi-select of many at once. Does not change the user's global organization role. All users must belong to the same organization as the project. A project may hold at most 50 members and 3 hosts; exceeding either cap is rejected with a message telling the client to demote someone first.
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
 *         example: 6742a1b2c3d4e5f678901234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f000000000000000000001", "65f000000000000000000002"]
 *               projectRole:
 *                 type: string
 *                 enum: [Member, Host]
 *                 default: Member
 *                 example: Member
 *     responses:
 *       200:
 *         description: Members added to project successfully
 *       400:
 *         description: Validation failed (invalid ObjectId or cross-organization user)
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 *       404:
 *         description: Project not found
 */
router.post('/:id/members', authorizeRoles('SuperAdmin'), asyncHandler(addProjectMembers));

/**
 * @openapi
 * /api/v1/projects/{id}/members/{userId}/role:
 *   patch:
 *     summary: Assign or Revoke Project Host Role (SuperAdmin Only)
 *     description: Sets the project-scoped role of an existing project member. `Host` grants hosting rights for this project only; `Member` revokes them. The user's global organization role is untouched. A project may have at most 3 hosts, so promoting a 4th host is rejected until an existing host is demoted.
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectRole]
 *             properties:
 *               projectRole:
 *                 type: string
 *                 enum: [Host, Member]
 *                 example: Host
 *     responses:
 *       200:
 *         description: Project member role updated successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 *       404:
 *         description: Project or project member not found
 */
router.patch(
  '/:id/members/:userId/role',
  authorizeRoles('SuperAdmin'),
  asyncHandler(updateProjectMemberRole)
);

/**
 * @openapi
 * /api/v1/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove Member from Project (SuperAdmin Only)
 *     description: Removes a member from the project and revokes any project-scoped Host role they held in that project.
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed from project successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden (SuperAdmin role required)
 *       404:
 *         description: Project or project member not found
 */
router.delete('/:id/members/:userId', authorizeRoles('SuperAdmin'), asyncHandler(removeProjectMember));

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
