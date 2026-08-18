// src/services/fax.service.ts
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../config';
import { AppError } from '../errors/app-error';

export interface FaxDispatchPayload {
  toFaxNumber: string;
  pdfFilePath: string;
  cancellationId: string;
}

export class FaxService {
  private baseUrl = 'https://api.phaxio.com/v2.1';

  public async dispatchLegalFax(payload: FaxDispatchPayload): Promise<{ phaxioFaxId: string }> {
    if (!config.phaxio.apiKey || !config.phaxio.apiSecret) {
      console.warn('⚠️ Phaxio credentials missing. Simulating fax dispatch in DEV mode.');
      return { phaxioFaxId: `mock_fax_${Date.now()}` };
    }

    try {
      const form = new FormData();
      form.append('to', payload.toFaxNumber);
      form.append('file', fs.createReadStream(payload.pdfFilePath));
      form.append('tag[cancellation_id]', payload.cancellationId);

      const response = await axios.post(`${this.baseUrl}/faxes`, form, {
        headers: form.getHeaders(),
        auth: {
          username: config.phaxio.apiKey,
          password: config.phaxio.apiSecret,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return { phaxioFaxId: response.data.data.id.toString() };
    } catch (error: any) {
      throw new AppError(`Phaxio Fax Dispatch Failure: ${error.message}`, 502);
    }
  }
}

export const faxService = new FaxService();
