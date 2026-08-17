# Repository Directory Structure

## Map

```Plaintext
disputedrop-engine/
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── docker-compose.yml
├── jest.config.ts
├── package.json
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── @types/
│   │   └── express.d.ts
│   ├── app.ts
│   ├── config/
│   │   └── index.ts
│   ├── constants/
│   │   └── merchants.ts
│   ├── controllers/
│   │   ├── cancellation.controller.ts
│   │   ├── merchant.controller.ts
│   │   └── webhook.controller.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── error-handler.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── rate-limiter.middleware.ts
│   │   └── validate.middleware.ts
│   ├── queues/
│   │   ├── cancellation.queue.ts
│   │   └── worker.ts
│   ├── routes/
│   │   ├── cancellation.routes.ts
│   │   ├── index.ts
│   │   ├── merchant.routes.ts
│   │   └── webhook.routes.ts
│   ├── schemas/
│   │   └── cancellation.schema.ts
│   ├── server.ts
│   ├── services/
│   │   ├── fax.service.ts
│   │   ├── mail.service.ts
│   │   ├── pdf.service.ts
│   │   ├── storage.service.ts
│   │   └── stripe.service.ts
│   └── templates/
│       └── cancellation-letter.html
└── tests/
    ├── integration/
    │   ├── cancellation.test.ts
    │   └── webhook.test.ts
    └── unit/
        ├── pdf.service.test.ts
        └── security.test.ts
```
