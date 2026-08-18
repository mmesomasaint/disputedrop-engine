// src/controllers/webhook.controller.ts
import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { cancellationQueue } from '../queues/cancellation.queue';

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-04-10' });

export class WebhookController {
  public async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature validation failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

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

        // Enqueue job for background processing
        await cancellationQueue.add('dispatch-cancellation', {
          cancellationId: cancellation.id,
        });

        console.log(`[Stripe Webhook] Enqueued processing for cancellation: ${cancellation.id}`);
      }
    }

    res.status(200).json({ received: true });
  }
}

export const webhookController = new WebhookController();
