import { Router } from 'express';
import { getHealth, getReadiness } from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: System Health Check
 *     description: Returns current service status, uptime, memory metrics, and MongoDB connection state.
 *     tags:
 *       - System Health
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: IntellMeet Server is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                       example: IntellMeet Backend API
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     environment:
 *                       type: string
 *                       example: development
 *                     uptimeSeconds:
 *                       type: integer
 *                       example: 120
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     database:
 *                       type: string
 *                       example: connected
 */
router.get('/', asyncHandler(getHealth));

/**
 * @openapi
 * /api/v1/health/ready:
 *   get:
 *     summary: System Readiness Check
 *     description: Checks if the service and database are ready to process incoming traffic.
 *     tags:
 *       - System Health
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', asyncHandler(getReadiness));

export default router;
