import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '../api-instance';
import { sendInvoiceEmail, submitRecipientDetails } from '../invoice';

vi.mock('../api-instance', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn()
  }
}));

const receiver = {
  name: 'Client UAB',
  businessType: 'business' as const,
  businessNumber: '123456789',
  vatNumber: '',
  address: 'Vilnius',
  email: 'client@example.com',
  type: 'receiver' as const
};

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

describe('submitRecipientDetails', () => {
  beforeEach(() => {
    vi.mocked(api.put).mockResolvedValue({
      data: {
        invoiceId: 'SF001',
        publicInvoiceToken: 'public-token',
        message: 'issued'
      }
    } as never);
  });

  it('uses JSON when the acknowledgement has no signature', async () => {
    await submitRecipientDetails('details-token', receiver);

    expect(api.put).toHaveBeenCalledWith(
      '/api/invoices/details/details-token',
      receiver
    );
  });

  it('uses multipart data when the receiver adds a signature', async () => {
    const signature = new File(['signature'], 'signature.png', {
      type: 'image/png'
    });

    await submitRecipientDetails('details-token', receiver, signature);

    const [, body] = vi.mocked(api.put).mock.calls.at(0)!;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(signature);
  });
});
