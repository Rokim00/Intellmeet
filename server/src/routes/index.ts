import { Router } from 'express';
import healthRouter from './health.routes.js';

const router: Router = Router();

// Version 1 API routes
router.use('/v1/health', healthRouter);

export default router;
