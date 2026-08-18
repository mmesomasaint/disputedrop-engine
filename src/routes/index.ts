// src/routes/index.ts
import { Router } from 'express';
import { cancellationController } from '../controllers/cancellation.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { CreateCancellationSchema } from '../schemas/cancellation.schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Merchant listing for frontend dropdown population
router.get('/merchants', async (req, res, next) => {
  try {
    const merchants = await prisma.merchant.findMany({
      select: { id: true, name: true, slug: true, category: true },
      orderBy: { name: 'asc' },
    });
    res.json({ status: 'success', data: { merchants } });
  } catch (err) {
    next(err);
  }
});

// Cancellation Endpoints
router.post(
  '/cancellations',
  validateRequest(CreateCancellationSchema),
  cancellationController.createCancellationIntent
);

router.get('/cancellations/:id', cancellationController.getCancellationStatus);

export default router;
