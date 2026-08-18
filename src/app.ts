// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { webhookController } from './controllers/webhook.controller';
import { AppError } from './errors/app-error';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// RAW parser requirement for Stripe Webhooks verification
app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

// Standard JSON parser for all standard routes
app.use(express.json({ limit: '10mb' }));

// Mount Application Routes
app.use('/api/v1', routes);

// Global Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot locate specified route ${req.originalUrl}`, 404));
});

// Global Exception Filter
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Execution Fault.';
  
  if (statusCode === 500) {
    console.error('CRITICAL INTERNAL ERROR:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

export default app;
