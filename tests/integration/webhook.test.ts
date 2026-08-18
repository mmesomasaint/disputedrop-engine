// tests/integration/webhook.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { config } from '../../src/config';
import { cancellationQueue } from '../../src/queues/cancellation.queue';

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-04-10' });

describe('POST /api/v1/webhooks/stripe Integration Test', () => {
  let cancellationId: string;
  const mockPaymentIntentId = `pi_test_${Date.now()}`;

  beforeAll(async () => {
    // Seed prerequisite merchant
    const merchant = await prisma.merchant.upsert({
      where: { slug: 'test-gym' },
      update: {},
      create: {
        slug: 'test-gym',
        name: 'Test Gym Club',
        category: 'Gym',
        recipientName: 'Disputes Dept',
        addressLine1: '100 Fitness Way',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        statutoryClause: 'Standard legal clause.',
      },
    });

    // Create a pending cancellation record tied to the mock paymentIntentId
    const record = await prisma.cancellation.create({
      data: {
        merchantId: merchant.id,
        customerFullName: 'Webhook Tester',
        customerEmail: 'webhook@test.com',
        customerPhone: '5550001111',
        customerAddressLine1: '456 Test Lane',
        customerCity: 'Austin',
        customerState: 'TX',
        customerPostalCode: '78701',
        membershipId: 'WH-887766',
        signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        stripePaymentIntentId: mockPaymentIntentId,
        status: 'PENDING_PAYMENT',
      },
    });

    cancellationId = record.id;
  });

  afterAll(async () => {
    await prisma.cancellation.deleteMany({ where: { customerEmail: 'webhook@test.com' } });
    await prisma.$disconnect();
    await cancellationQueue.close();
  });

  it('should reject webhook requests with missing or invalid Stripe signatures', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks/stripe')
      .set('stripe-signature', 'invalid_signature')
      .send({ type: 'payment_intent.succeeded' });

    expect(res.status).toBe(400);
  });

  it('should process payment_intent.succeeded, update status to PAID, and enqueue the job', async () => {
    const payload = JSON.stringify({
      id: `evt_test_${Date.now()}`,
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: mockPaymentIntentId,
          amount: 699,
          status: 'succeeded',
        },
      },
    });

    // Generate valid test signature using Stripe test SDK
    const header = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: config.stripe.webhookSecret,
    });

    const res = await request(app)
      .post('/api/v1/webhooks/stripe')
      .set('stripe-signature', header)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    // Verify DB state transitioned to PAID
    const updated = await prisma.cancellation.findUnique({ where: { id: cancellationId } });
    expect(updated?.status).toBe('PAID');
  });
});
