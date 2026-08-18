// src/middlewares/rate-limiter.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { config } from '../config';
import { AppError } from '../errors/app-error';

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  enableOfflineQueue: false,
});

redisClient.on('error', (err) => {
  console.warn('[RateLimiter] Redis connection issue; fallback in place:', err.message);
});

/**
 * Standard API rate limiter: 100 requests per 15 minutes per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - ioredis sendCommand compatibility
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  handler: (req, res, next) => {
    next(new AppError('Too many requests. Please try again in 15 minutes.', 429));
  },
});

/**
 * Strict rate limiter for cancellation creation: 5 requests per hour per IP.
 */
export const strictCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - ioredis sendCommand compatibility
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:cancellation:',
  }),
  handler: (req, res, next) => {
    next(new AppError('Hourly cancellation request limit reached for this IP.', 429));
  },
});
