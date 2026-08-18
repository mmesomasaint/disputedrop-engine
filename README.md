# DisputeDrop — Core Backend Engine

DisputeDrop is an automated cancellation and legal notice engine designed to terminate recurring gym memberships, telecom plans, and enterprise subscriptions without human retention friction.

## Key Features
- **Statutory PDF Notice Engine:** Headless Puppeteer engine builds verified legal notice documents embedded with user canvas signatures.
- **Multi-Channel Fulfillment:** Real-time integration with Lob API (US Certified Physical Mail) and Phaxio API (facsimile transmission).
- **Payment Verification:** Webhook-first Stripe checkout lifecycle for flat-rate $6.99 pay-per-dispute execution.
- **Reliable Queues:** BullMQ & Redis async queue with automated exponential backoff retries.

---

## Quick Setup (Local Dev)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-org/disputedrop-engine.git
   cd disputedrop-engine
   ```
   
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Setup Local Environment:**
   ```bash
   cp .env.example .env
   ```
4. **Start Storage, PostgreSQL & Redis:**
   ```bash
   docker-compose up postgres redis -d
   ```
5. **Run Migrations & Seed Vendors:**
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
6. **Start Dev Server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8000`. You can verify it is running by checking the health endpoint:
   
   ```bash
   curl http://localhost:8000/health
   ```

## Testing the API via CURL

1. **Retrieve Supported Merchants**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/merchants"
   ```
2. **Initiate Cancellation Intent ($6.99)**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/cancellations" \
    -H "Content-Type: application/json" \
    -d '{
      "merchantId": "<MERCHANT_UUID>",
      "customerFullName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "5551234567",
      "customerAddressLine1": "742 Evergreen Terrace",
      "customerCity": "Springfield",
      "customerState": "OR",
      "customerPostalCode": "97477",
      "membershipId": "PF-889911",
      "signatureDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }'
   ```
     Returns:
     ```JSON
     {
       "status": "success",
       "data": {
         "cancellationId": "UUID",
         "clientSecret": "pi_xxx_secret_xxx",
         "amountCents": 699
       }
     }
     ```

## Check Dispute Tracking Status

```bash
curl -X GET "http://localhost:8000/api/v1/cancellations/<CANCELLATION_UUID>"
```

## Test Configuration

```bash
# 1. Run ALL tests (Unit + Integration)
npm run test

# 2. Run ONLY Unit Tests (Fast, does not require DB or Redis)
npm run test:unit

# 3. Run ONLY Integration Tests (Requires Postgres & Redis active)
npm run test:integration

# 4. Run tests with detailed code coverage report
npm run test:coverage

```
