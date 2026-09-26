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

  it('sends email content as JSON for the server to attach the saved PDF', async () => {
    const body = {
      recipientEmail: 'client@example.com',
      subject: 'Invoice SF007',
      message: '',
      language: 'lt' as const,
      kind: 'invoice' as const,
      includePublicLink: true,
      requestSignature: false,
      attemptKey: '11111111-1111-4111-8111-111111111111',
      confirmPossibleDuplicate: false
    };
    await sendInvoiceEmail(1, 7, body);

    expect(api.post).toHaveBeenCalledWith('/api/1/invoices/7/send-email', body);
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
