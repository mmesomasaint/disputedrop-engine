// src/routes/index.ts
import { Router } from 'express';
import merchantRoutes from './merchant.routes';
import { cancellationController } from '../controllers/cancellation.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { CreateCancellationSchema } from '../schemas/cancellation.schema';

const router = Router();

// Mount Merchant endpoints at /api/v1/merchants
router.use('/merchants', merchantRoutes);

// Mount Cancellation endpoints
router.post(
  '/cancellations',
  validateRequest(CreateCancellationSchema),
  cancellationController.createCancellationIntent
);

router.get('/cancellations/:id', cancellationController.getCancellationStatus);

export default router;
