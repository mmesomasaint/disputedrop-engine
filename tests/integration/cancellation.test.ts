// tests/integration/cancellation.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /api/v1/cancellations Intent Flow', () => {
  let merchantId: string;

  beforeAll(async () => {
    const merchant = await prisma.merchant.findFirst();
    if (merchant) {
      merchantId = merchant.id;
    }
  });

  it('should return 400 when invalid payload is passed', async () => {
    const res = await request(app)
      .post('/api/v1/cancellations')
      .send({ customerEmail: 'not-an-email' });

    assertValidationFailure(res);
  });

  it('should create a Stripe PaymentIntent and return a clientSecret', async () => {
    const payload = {
      merchantId,
      customerFullName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      customerPhone: '5551234567',
      customerAddressLine1: '123 Main St',
      customerCity: 'New York',
      customerState: 'NY',
      customerPostalCode: '10001',
      membershipId: 'PF-998822-X',
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    const res = await request(app).post('/api/v1/cancellations').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('clientSecret');
    expect(res.body.data.amountCents).toBe(699);
  });
});

function assertValidationFailure(res: request.Response) {
  expect(res.status).toBe(400);
  expect(res.body.status).toBe('error');
  expect(res.body).toHaveProperty('errors');
}
