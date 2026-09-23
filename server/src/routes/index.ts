import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';

const router: Router = Router();

// Version 1 API routes
router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);

export default router;
