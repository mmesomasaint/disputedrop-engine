// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    fixedPriceCents: 699, // $6.99 USD
  },
  lob: {
    apiKey: process.env.LOB_API_KEY || '',
  },
  phaxio: {
    apiKey: process.env.PHAXIO_API_KEY || '',
    apiSecret: process.env.PHAXIO_API_SECRET || '',
  },
  storage: {
    localPdfDir: path.resolve(__dirname, '../../storage/pdf'),
  }
};
