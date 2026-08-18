// src/services/mail.service.ts
import Lob from 'lob';
import fs from 'fs';
import { config } from '../config';
import { AppError } from '../errors/app-error';

export interface MailDispatchPayload {
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  customerName: string;
  customerAddress1: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  pdfFilePath: string;
}

export interface MailDispatchResult {
  lobLetterId: string;
  trackingNumber: string;
  carrier: string;
  expectedDeliveryDate: string;
}

export class MailService {
  private lobClient: any;

  constructor() {
    // @ts-ignore
    this.lobClient = new Lob({ apiKey: config.lob.apiKey });
  }

  public async dispatchCertifiedMail(payload: MailDispatchPayload): Promise<MailDispatchResult> {
    try {
      const response = await this.lobClient.letters.create({
        description: `DisputeDrop Notice for ${payload.customerName}`,
        to: {
          name: payload.recipientName,
          address_line1: payload.addressLine1,
          address_line2: payload.addressLine2 || '',
          address_city: payload.city,
          address_state: payload.state,
          address_zip: payload.postalCode,
          address_country: 'US',
        },
        from: {
          name: payload.customerName,
          address_line1: payload.customerAddress1,
          address_city: payload.customerCity,
          address_state: payload.customerState,
          address_zip: payload.customerZip,
          address_country: 'US',
        },
        file: fs.createReadStream(payload.pdfFilePath),
        color: false,
        extra_service: 'certified', // US Certified Mail Tracking
        double_sided: false,
      });

      return {
        lobLetterId: response.id,
        trackingNumber: response.tracking_number || 'PENDING_INDICATION',
        carrier: response.carrier,
        expectedDeliveryDate: response.expected_delivery_date,
      };
    } catch (error: any) {
      throw new AppError(`Lob API Mail Dispatch Error: ${error.message}`, 502);
    }
  }
}

export const mailService = new MailService();
