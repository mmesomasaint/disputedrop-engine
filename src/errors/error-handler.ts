// src/errors/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from './app-error';
import { config } from '../config';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Handle known Prisma Database Exceptions
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['field'];
      error = new AppError(`A record with this ${target.join(', ')} already exists.`, 409);
    } else if (err.code === 'P2025') {
      error = new AppError('Requested record could not be found.', 404);
    } else {
      error = new AppError('Database operation failed.', 400);
    }
  }

  // Handle Stripe Webhook Signature / API Faults
  if (err.type === 'StripeSignatureVerificationError') {
    error = new AppError(`Stripe signature validation failed: ${err.message}`, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Execution Fault.';

  if (statusCode === 500) {
    console.error('[CRITICAL ERROR]:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.env === 'development' && {
      stack: err.stack,
      rawError: err,
    }),
  });
};
