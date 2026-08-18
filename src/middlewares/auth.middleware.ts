// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-admin-key'] as string;
  const configuredAdminKey = process.env.ADMIN_API_KEY;

  if (!configuredAdminKey) {
    return next(new AppError('Admin authentication key is not configured on the server.', 500));
  }

  if (!apiKey || apiKey !== configuredAdminKey) {
    return next(new AppError('Unauthorized: Invalid or missing X-Admin-Key header.', 401));
  }

  next();
};
