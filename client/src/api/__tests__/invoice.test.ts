import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '../api-instance';
import { sendInvoiceEmail } from '../invoice';

vi.mock('../api-instance', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('sendInvoiceEmail', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockResolvedValue({
      data: { message: 'sent' }
    } as never);
  });

  it('uses JSON when a draft has no PDF attachment', async () => {
    await sendInvoiceEmail({
      id: 7,
      userId: 1,
      invoiceId: 'draft',
      recipientEmail: 'client@example.com',
      subject: 'Draft invoice',
      includePublicLink: true,
      requestSignature: false,
      blob: null
    });

    expect(api.post).toHaveBeenCalledWith('/api/1/invoices/7/send-email', {
      recipientEmail: 'client@example.com',
      subject: 'Draft invoice',
      message: undefined,
      includePublicLink: true,
      requestSignature: false
    });
  });

  it('keeps multipart delivery when an issued invoice includes a PDF', async () => {
    await sendInvoiceEmail({
      id: 7,
      userId: 1,
      invoiceId: 'SF007',
      recipientEmail: 'client@example.com',
      subject: 'Invoice SF007',
      blob: new Blob(['pdf'], { type: 'application/pdf' })
    });

    const [, body, config] = vi.mocked(api.post).mock.calls.at(0)!;

    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('pdfAttachment')).toBeInstanceOf(File);
    expect(config).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  });
});
