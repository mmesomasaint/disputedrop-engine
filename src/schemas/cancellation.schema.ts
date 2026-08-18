// src/schemas/cancellation.schema.ts
import { z } from 'zod';

export const CreateCancellationSchema = z.object({
  body: z.object({
    merchantId: z.string().uuid('Invalid Merchant ID format.'),
    customerFullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    customerEmail: z.string().email('Invalid email address.'),
    customerPhone: z.string().min(10, 'Phone number must be at least 10 digits.'),
    customerAddressLine1: z.string().min(5, 'Address Line 1 is required.'),
    customerCity: z.string().min(2, 'City is required.'),
    customerState: z.string().length(2, 'State must be a 2-letter uppercase code (e.g. CA, NY).'),
    customerPostalCode: z.string().min(5, 'Valid postal code is required.'),
    membershipId: z.string().min(1, 'Membership/Account identifier is required.'),
    accountPinOrLast4: z.string().optional(),
    reasonForLeaving: z.string().max(500).optional(),
    signatureDataUrl: z
      .string()
      .regex(/^data:image\/png;base64,/, 'Signature must be a valid PNG Data URL.'),
  }),
});

export type CreateCancellationInput = z.infer<typeof CreateCancellationSchema>['body'];
