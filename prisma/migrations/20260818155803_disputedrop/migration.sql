-- CreateEnum
CREATE TYPE "CancellationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "DispatchMethod" AS ENUM ('CERTIFIED_MAIL', 'ELECTRONIC_FAX', 'HYBRID_BOTH');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cancellationType" "DispatchMethod" NOT NULL DEFAULT 'HYBRID_BOTH',
    "recipientName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "faxNumber" TEXT,
    "statutoryClause" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancellation" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerFullName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddressLine1" TEXT NOT NULL,
    "customerCity" TEXT NOT NULL,
    "customerState" TEXT NOT NULL,
    "customerPostalCode" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "accountPinOrLast4" TEXT,
    "reasonForLeaving" TEXT,
    "signatureDataUrl" TEXT NOT NULL,
    "status" "CancellationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "generatedPdfPath" TEXT,
    "lobLetterId" TEXT,
    "certifiedTrackingNumber" TEXT,
    "lobTrackingUrl" TEXT,
    "phaxioFaxId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 699,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_slug_key" ON "Merchant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_stripePaymentIntentId_key" ON "Cancellation"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Cancellation_customerEmail_idx" ON "Cancellation"("customerEmail");

-- CreateIndex
CREATE INDEX "Cancellation_status_idx" ON "Cancellation"("status");

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
