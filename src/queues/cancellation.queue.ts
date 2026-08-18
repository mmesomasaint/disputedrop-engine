// src/queues/cancellation.queue.ts
import { Queue } from 'bullmq';
import { config } from '../config';

export const CANCELLATION_QUEUE_NAME = 'cancellation-orchestration-queue';

export const cancellationQueue = new Queue(CANCELLATION_QUEUE_NAME, {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
