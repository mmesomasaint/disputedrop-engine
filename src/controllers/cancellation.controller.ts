// src/controllers/cancellation.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '../services/stripe.service';
import { AppError } from '../errors/app-error';

const prisma = new PrismaClient();

export class CancellationController {
  /**
   * POST /api/v1/cancellations
   * Initializes a cancellation intent and generates a Stripe clientSecret ($6.99).
   */
  public async createCancellationIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;

      const merchant = await prisma.merchant.findUnique({
        where: { id: payload.merchantId },
      });

      if (!merchant) {
        throw new AppError('Specified target merchant does not exist.', 404);
      }

      // Generate PaymentIntent via encapsulated Stripe service
      const { paymentIntentId, clientSecret, amountCents } =
        await stripeService.createPaymentIntent(payload.customerEmail, {
          merchantName: merchant.name,
          customerName: payload.customerFullName,
          membershipId: payload.membershipId,
        });

      // Persist initial record in PostgreSQL
      const cancellation = await prisma.cancellation.create({
        data: {
          merchantId: payload.merchantId,
          customerFullName: payload.customerFullName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone,
          customerAddressLine1: payload.customerAddressLine1,
          customerCity: payload.customerCity,
          customerState: payload.customerState,
          customerPostalCode: payload.customerPostalCode,
          membershipId: payload.membershipId,
          accountPinOrLast4: payload.accountPinOrLast4,
          reasonForLeaving: payload.reasonForLeaving,
          signatureDataUrl: payload.signatureDataUrl,
          stripePaymentIntentId: paymentIntentId,
          amountPaidCents: amountCents,
          status: 'PENDING_PAYMENT',
        },
      });

      res.status(201).json({
        status: 'success',
        data: {
          cancellationId: cancellation.id,
          clientSecret,
          amountCents,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/cancellations/:id
   * Queries real-time fulfillment and tracking status.
   */
  public async getCancellationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cancellation = await prisma.cancellation.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          certifiedTrackingNumber: true,
          lobLetterId: true,
          lobTrackingUrl: true,
          phaxioFaxId: true,
          failureReason: true,
          createdAt: true,
          updatedAt: true,
          merchant: {
            select: { name: true, category: true, slug: true },
          },
        },
      });

      if (!cancellation) {
        throw new AppError('Cancellation record not found.', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { cancellation },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cancellationController = new CancellationController();
