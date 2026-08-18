// src/routes/merchant.routes.ts
import { Router } from 'express';
import { merchantController } from '../controllers/merchant.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { requireAdminAuth } from '../middlewares/auth.middleware';
import { CreateMerchantSchema, GetMerchantBySlugSchema } from '../schemas/merchant.schema';

const router = Router();

// Public: List all merchants or filter by category
router.get('/', merchantController.getMerchants);

// Public: Get merchant by unique slug
router.get('/:slug', validateRequest(GetMerchantBySlugSchema), merchantController.getMerchantBySlug);

// Admin-Protected: Register a new merchant target with statutory clauses
router.post(
  '/',
  requireAdminAuth,
  validateRequest(CreateMerchantSchema),
  merchantController.createMerchant
);

export default router;
