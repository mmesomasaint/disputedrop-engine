// tests/unit/pdf.service.test.ts
import fs from 'fs-extra';
import { pdfService } from '../../src/services/pdf.service';

describe('PdfService Unit Tests', () => {
  const sampleSignature =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const mockContext = {
    cancellationId: 'test-uuid-1234',
    currentDate: 'August 18, 2026',
    customerFullName: 'Jane Doe',
    customerAddressLine1: '742 Evergreen Terrace',
    customerCityStateZip: 'Springfield, OR 97477',
    customerEmail: 'jane@example.com',
    customerPhone: '5551234567',
    merchantName: 'Planet Fitness',
    merchantRecipient: 'Member Services',
    merchantAddressLine1: '400 Fox Run Rd',
    merchantCityStateZip: 'Newington, NH 03801',
    membershipId: 'PF-998811',
    statutoryClause: 'Pursuant to state consumer protection statutes, this notice terminates membership.',
    signatureDataUrl: sampleSignature,
  };

  it('should compile an HTML template into a physical PDF file on disk', async () => {
    const generatedPath = await pdfService.compileCancellationDocument(mockContext);

    expect(generatedPath).toBeDefined();
    expect(generatedPath).toContain('dispute_notice_test-uuid-1234.pdf');

    // Verify the file exists and is not empty
    const fileExists = await fs.pathExists(generatedPath);
    expect(fileExists).toBe(true);

    const stats = await fs.stat(generatedPath);
    expect(stats.size).toBeGreaterThan(1000); // Valid PDF is > 1KB

    // Cleanup artifact after test
    await fs.remove(generatedPath);
  });
});
