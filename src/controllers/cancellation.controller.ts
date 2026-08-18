// src/controllers/cancellation.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { config } from '../config';
import { AppError } from '../errors/app-error';

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-04-10' });

export class CancellationController {
  public async createCancellationIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;

      const merchant = await prisma.merchant.findUnique({
        where: { id: payload.merchantId },
      });

      if (!merchant) {
        throw new AppError('Specified target merchant does not exist.', 404);
      }

      // Create Stripe PaymentIntent for $6.99
      const paymentIntent = await stripe.paymentIntents.create({
        amount: config.stripe.fixedPriceCents,
        currency: 'usd',
        receipt_email: payload.customerEmail,
        metadata: {
          merchantName: merchant.name,
          customerName: payload.customerFullName,
        },
      });

      // Store initial record in DB
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
          stripePaymentIntentId: paymentIntent.id,
          status: 'PENDING_PAYMENT',
        },
      });

      res.status(201).json({
        status: 'success',
        data: {
          cancellationId: cancellation.id,
          clientSecret: paymentIntent.client_secret,
          amountCents: config.stripe.fixedPriceCents,
        },
      });
    } catch (error) {
      next(error);
    }
  }

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
          phaxioFaxId: true,
          createdAt: true,
          updatedAt: true,
          merchant: {
            select: { name: true, category: true },
          },
        },
      });

      if (!cancellation) {
        throw new AppError('Cancellation record not found.', 404);
      }

      res.status(200).json({ status: 'success', data: { cancellation } });
    } catch (error) {
      next(error);
    }
  }
}

export const cancellationController = new CancellationController();
