# System Architecture & Workflow

## Architecture

```Plaintext
[ Client / Postman / Frontend ]
               │
               │  1. POST /api/v1/cancellations (Intent)
               ▼
  ┌─────────────────────────┐
  │   Express API Gateway   │ ────► Rate Limiter & Zod Schema Validation
  └────────────┬────────────┘
               │
               │  2. Creates Stripe PaymentIntent ($6.99) & Pending Cancellation Record
               ▼
  ┌─────────────────────────┐
  │   PostgreSQL Database   │
  └─────────────────────────┘
               │
               │  3. Client pays $6.99 via Stripe SDK
               ▼
  ┌─────────────────────────┐
  │ Stripe Webhook Handler  │ ────► Verifies HMAC Signature (`stripe-signature`)
  └────────────┬────────────┘
               │
               │  4. Enqueues Job: `process-cancellation`
               ▼
  ┌─────────────────────────┐
  │   Redis / BullMQ Queue  │
  └────────────┬────────────┘
               │
               │  5. Background Worker picks up job
               ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                      Async Worker Pipeline                             │
  │                                                                        │
  │  Step A: PDF Compilation                                               │
  │          - Hydrates HTML template with legal statutory clauses         │
  │          - Renders Base64 signature via Headless Chromium (Puppeteer)  │
  │          - Writes to encrypted local/S3 bucket                         │
  │                                                                        │
  │  Step B: Multi-Channel Dispatch                                        │
  │          - Primary: Certified Physical Mail via Lob API                │
  │          - Secondary: Direct Legal Fax via Phaxio / Twilio API         │
  │                                                                        │
  │  Step C: Tracking & Finalization                                       │
  │          - Stores tracking identifiers, certified carrier IDs,         │
  │            and status updates in PostgreSQL                            │
  └────────────────────────────────────────────────────────────────────────┘
```
