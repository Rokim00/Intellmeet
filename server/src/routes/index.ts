import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import organizationRouter from './organization.routes.js';
import projectRouter from './project.routes.js';

const router: Router = Router();

// Version 1 API routes
router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);
router.use('/v1/organizations', organizationRouter);
router.use('/v1/projects', projectRouter);

export default router;
