// src/server.ts
import app from './app';
import { config } from './config';
import { initWorker } from './queues/worker';

const server = app.listen(config.port, () => {
  console.log(`
   DisputeDrop Orchestration Engine Active
  ===========================================
   HTTP Server Port   : ${config.port}
   Mode               : ${config.env}
   Redis Host         : ${config.redis.host}:${config.redis.port}
  ===========================================
  `);

  // Start background worker
  initWorker();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server terminated.');
    process.exit(0);
  });
});
