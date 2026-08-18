// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { webhookController } from './controllers/webhook.controller';
import { apiRateLimiter } from './middlewares/rate-limiter.middleware';
import { errorHandler } from './errors/error-handler';
import { AppError } from './errors/app-error';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// RAW parser requirement for Stripe Webhooks signature verification
app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

// Standard JSON parser for application payloads
app.use(express.json({ limit: '10mb' }));

// Global Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount Application Routes with Redis-backed Rate Limiter
app.use('/api/v1', apiRateLimiter, routes);

// 404 Catch-All Route
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot locate requested route: ${req.originalUrl}`, 404));
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;
