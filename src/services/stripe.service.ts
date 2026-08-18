// src/services/stripe.service.ts
import Stripe from 'stripe';
import { config } from '../config';
import { AppError } from '../errors/app-error';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-04-10',
      typescript: true,
    });
  }

  /**
   * Generates a single $6.99 USD PaymentIntent for the client checkout flow.
   */
  public async createPaymentIntent(customerEmail: string, metadata: Record<string, string>) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: config.stripe.fixedPriceCents,
        currency: 'usd',
        receipt_email: customerEmail,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amountCents: paymentIntent.amount,
      };
    } catch (error: any) {
      throw new AppError(`Stripe Payment Intent Generation Error: ${error.message}`, 502);
    }
  }

  /**
   * Validates raw webhook body against Stripe HMAC signature.
   */
  public constructWebhookEvent(rawBody: Buffer | string, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error: any) {
      throw new AppError(`Stripe signature construction failure: ${error.message}`, 400);
    }
  }
}

export const stripeService = new StripeService();
