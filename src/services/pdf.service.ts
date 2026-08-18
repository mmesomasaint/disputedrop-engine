// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config';

export interface CancellationLetterContext {
  cancellationId: string;
  currentDate: string;
  customerFullName: string;
  customerAddressLine1: string;
  customerCityStateZip: string;
  customerEmail: string;
  customerPhone: string;
  merchantName: string;
  merchantRecipient: string;
  merchantAddressLine1: string;
  merchantCityStateZip: string;
  membershipId: string;
  accountPinOrLast4?: string;
  statutoryClause: string;
  reasonForLeaving?: string;
  signatureDataUrl: string;
}

export class PdfService {
  private templatePath: string;

  constructor() {
    this.templatePath = path.resolve(__dirname, '../templates/cancellation-letter.html');
  }

  public async compileCancellationDocument(context: CancellationLetterContext): Promise<string> {
    await fs.ensureDir(config.storage.localPdfDir);
    const htmlTemplate = await fs.readFile(this.templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const hydratedHtml = compiledTemplate(context);

    const outputPath = path.join(
      config.storage.localPdfDir,
      `dispute_notice_${context.cancellationId}.pdf`
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(hydratedHtml, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: outputPath,
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        }
      });
      return outputPath;
    } finally {
      await browser.close();
    }
  }
}

export const pdfService = new PdfService();
