// src/schemas/merchant.schema.ts
import { z } from 'zod';
import { DispatchMethod } from '@prisma/client';

export const CreateMerchantSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens.'),
    name: z.string().min(2, 'Merchant name is required.'),
    category: z.string().min(2, 'Category (e.g. Gym, Telecom, SaaS) is required.'),
    cancellationType: z.nativeEnum(DispatchMethod, {
      errorMap: () => ({ message: 'Cancellation type must be CERTIFIED_MAIL, ELECTRONIC_FAX, or HYBRID_BOTH.' }),
    }),
    recipientName: z.string().min(2, 'Recipient legal department/name is required.'),
    addressLine1: z.string().min(5, 'Physical address line 1 is required for certified mail.'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required.'),
    state: z.string().length(2, 'State must be a 2-letter uppercase code (e.g., CA, NY).'),
    postalCode: z.string().min(5, 'Valid postal code is required.'),
    country: z.string().default('US'),
    faxNumber: z.string().optional().nullable(),
    statutoryClause: z.string().min(20, 'Statutory legal text clause must be provided for the letter.'),
  }),
});

export const GetMerchantBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Merchant slug parameter is required.'),
  }),
});
