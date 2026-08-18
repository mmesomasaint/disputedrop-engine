// src/controllers/webhook.controller.ts
import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '../services/stripe.service';
import { cancellationQueue } from '../queues/cancellation.queue';

const prisma = new PrismaClient();

export class WebhookController {
  public async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      const event = stripeService.constructWebhookEvent(req.body, signature);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const cancellation = await prisma.cancellation.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (cancellation) {
          await prisma.cancellation.update({
            where: { id: cancellation.id },
            data: { status: 'PAID' },
          });

          // Enqueue job for background PDF generation & carrier dispatch
          await cancellationQueue.add('dispatch-cancellation', {
            cancellationId: cancellation.id,
          });

          console.log(`[Stripe Webhook] Enqueued processing for cancellation: ${cancellation.id}`);
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  }
}

export const webhookController = new WebhookController();
