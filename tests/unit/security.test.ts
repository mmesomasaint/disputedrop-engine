// tests/unit/security.test.ts
import { CreateCancellationSchema } from '../../src/schemas/cancellation.schema';

describe('Security & Schema Validation Unit Tests', () => {
  const validBasePayload = {
    merchantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    customerFullName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '5551234567',
    customerAddressLine1: '123 Main St',
    customerCity: 'New York',
    customerState: 'NY',
    customerPostalCode: '10001',
    membershipId: 'MEM-123456',
    signatureDataUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };

  it('should pass schema validation when payload is structured correctly', async () => {
    const result = await CreateCancellationSchema.safeParseAsync({ body: validBasePayload });
    expect(result.success).toBe(true);
  });

  it('should reject requests with invalid signature formats (non-PNG Base64 data URL)', async () => {
    const maliciousPayload = {
      ...validBasePayload,
      signatureDataUrl: 'https://evil.com/fake-signature.jpg', // Disallowed
    };

    const result = await CreateCancellationSchema.safeParseAsync({ body: maliciousPayload });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('signatureDataUrl');
    }
  });

  it('should reject state codes that are not exactly 2 letters', async () => {
    const invalidStatePayload = {
      ...validBasePayload,
      customerState: 'California', // Must be 2-letter uppercase ISO code e.g. "CA"
    };

    const result = await CreateCancellationSchema.safeParseAsync({ body: invalidStatePayload });
    expect(result.success).toBe(false);
  });
});
