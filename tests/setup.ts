// tests/setup.ts
import dotenv from 'dotenv';
import path from 'path';

// Force test environment variables before running any test suite
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

process.env.NODE_ENV = 'test';
process.env.PORT = '8001';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_123';
process.env.LOB_API_KEY = 'test_lob_key';
process.env.PHAXIO_API_KEY = 'test_phaxio_key';
process.env.PHAXIO_API_SECRET = 'test_phaxio_secret';
