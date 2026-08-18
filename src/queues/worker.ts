// src/queues/worker.ts
import { Worker, Job } from 'bullmq';
import { PrismaClient, DispatchMethod } from '@prisma/client';
import { CANCELLATION_QUEUE_NAME } from './cancellation.queue';
import { config } from '../config';
import { pdfService } from '../services/pdf.service';
import { mailService } from '../services/mail.service';
import { faxService } from '../services/fax.service';

const prisma = new PrismaClient();

export const initWorker = () => {
  const worker = new Worker(
    CANCELLATION_QUEUE_NAME,
    async (job: Job<{ cancellationId: string }>) => {
      const { cancellationId } = job.data;
      console.log(`[Worker] Processing cancellation execution for ID: ${cancellationId}`);

      const record = await prisma.cancellation.findUnique({
        where: { id: cancellationId },
        include: { merchant: true },
      });

      if (!record) {
        throw new Error(`Cancellation record not found: ${cancellationId}`);
      }

      await prisma.cancellation.update({
        where: { id: cancellationId },
        data: { status: 'PROCESSING' },
      });

      try {
        // Generate Legally-Binding Notice Document
        const pdfPath = await pdfService.compileCancellationDocument({
          cancellationId: record.id,
          currentDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          customerFullName: record.customerFullName,
          customerAddressLine1: record.customerAddressLine1,
          customerCityStateZip: `${record.customerCity}, ${record.customerState} ${record.customerPostalCode}`,
          customerEmail: record.customerEmail,
          customerPhone: record.customerPhone,
          merchantName: record.merchant.name,
          merchantRecipient: record.merchant.recipientName,
          merchantAddressLine1: record.merchant.addressLine1,
          merchantCityStateZip: `${record.merchant.city}, ${record.merchant.state} ${record.merchant.postalCode}`,
          membershipId: record.membershipId,
          accountPinOrLast4: record.accountPinOrLast4 || undefined,
          statutoryClause: record.merchant.statutoryClause,
          reasonForLeaving: record.reasonForLeaving || undefined,
          signatureDataUrl: record.signatureDataUrl,
        });

        await prisma.cancellation.update({
          where: { id: cancellationId },
          data: { generatedPdfPath: pdfPath },
        });

        let lobResult = null;
        let faxResult = null;

        // Dispatch US Certified Mail
        if (
          record.merchant.cancellationType === DispatchMethod.CERTIFIED_MAIL ||
          record.merchant.cancellationType === DispatchMethod.HYBRID_BOTH
        ) {
          lobResult = await mailService.dispatchCertifiedMail({
            recipientName: record.merchant.recipientName,
            addressLine1: record.merchant.addressLine1,
            addressLine2: record.merchant.addressLine2 || undefined,
            city: record.merchant.city,
            state: record.merchant.state,
            postalCode: record.merchant.postalCode,
            customerName: record.customerFullName,
            customerAddress1: record.customerAddressLine1,
            customerCity: record.customerCity,
            customerState: record.customerState,
            customerZip: record.customerPostalCode,
            pdfFilePath: pdfPath,
          });
        }

        // Dispatch Facsimile Notice
        if (
          (record.merchant.cancellationType === DispatchMethod.ELECTRONIC_FAX ||
            record.merchant.cancellationType === DispatchMethod.HYBRID_BOTH) &&
          record.merchant.faxNumber
        ) {
          faxResult = await faxService.dispatchLegalFax({
            toFaxNumber: record.merchant.faxNumber,
            pdfFilePath: pdfPath,
            cancellationId: record.id,
          });
        }

        // Update Database State to Dispatched
        await prisma.cancellation.update({
          where: { id: cancellationId },
          data: {
            status: 'DISPATCHED',
            lobLetterId: lobResult?.lobLetterId || null,
            certifiedTrackingNumber: lobResult?.trackingNumber || null,
            phaxioFaxId: faxResult?.phaxioFaxId || null,
          },
        });

        console.log(`✅ Cancellation ${cancellationId} successfully dispatched.`);
      } catch (err: any) {
        console.error(`❌ Workflow failed for ${cancellationId}:`, err);
        await prisma.cancellation.update({
          where: { id: cancellationId },
          data: {
            status: 'FAILED',
            failureReason: err.message,
          },
        });
        throw err;
      }
    },
    {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
  });
};
