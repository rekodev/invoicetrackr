import { renderInvoicePdf } from '@invoicetrackr/pdf/server';
import type { InvoiceEmailContent } from '@invoicetrackr/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as invoiceDb from '../../database/invoice';
import * as emailDb from '../../database/invoice-email';
import * as userDb from '../../database/user';
import { requireVerifiedEmail } from '../../middleware/auth';
import { recoverInvoiceEmailOptions, sendInvoiceEmailOptions } from '../../options/invoice';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { invoiceFromDbFactory } from '../../test/factories/invoice';
import { userFactory } from '../../test/factories/user';
import { mockCreateAuditEvent, mockResendSend } from '../../test/setup';
import { prepareInvoiceEmailPayload } from '../invoice';

vi.mock('../../database/invoice-email');
vi.mock('../../database/invoice');
vi.mock('../../database/user');
vi.mock('@invoicetrackr/pdf/server', () => ({ renderInvoicePdf: vi.fn() }));

const content: InvoiceEmailContent = { recipientEmail: 'client@example.com', subject: 'Invoice SF007',
  message: '', language: 'lt', kind: 'invoice', includePublicLink: false, requestSignature: false };
const payload = { from: 'Freelancer via InvoiceTrackr <noreply@example.com>', to: content.recipientEmail,
  replyTo: 'freelancer@example.com', subject: content.subject, html: '<p>Saved invoice</p>', text: 'Saved invoice',
  attachments: [{ filename: 'SF007.pdf', content: 'JVBERi0=' }] };
const attempt = { id: 9, userId: 2, invoiceId: 7, provider: 'resend', providerMessageId: null,
  attemptKey: '5138c5b6-3792-424f-8a25-ca47bd0c2d76', content, kind: content.kind, recipient: content.recipientEmail,
  status: 'unknown', createdAt: '2026-09-26T10:00:00.000Z', updatedAt: '2026-09-26T10:00:00.000Z',
  sentAt: null, deliveredAt: null, failedAt: null, failureCode: null, providerPayload: payload,
  providerStartedAt: '2026-09-26T10:00:00.000Z', recoveryExpiresAt: '2099-09-27T10:00:00.000Z',
  leaseToken: 'lease', leaseUntil: null } satisfies emailDb.InvoiceEmailAttempt;

const appForEmail = () => createTestApp((app) => {
  app.post('/api/:userId/invoices/:id/send-email', { ...sendInvoiceEmailOptions,
    preHandler: [mockAuthMiddleware, requireVerifiedEmail] });
  app.post('/api/:userId/invoices/:id/email-deliveries/:deliveryId/recover', { ...recoverInvoiceEmailOptions,
    preHandler: [mockAuthMiddleware, requireVerifiedEmail] });
});
const send = { method: 'POST' as const, url: '/api/2/invoices/7/send-email', payload: { ...content, attemptKey: attempt.attemptKey } };

describe('invoice email routes', () => {
  beforeEach(() => {
    vi.mocked(userDb.getUserEmailVerificationStatusFromDb).mockResolvedValue({ emailVerifiedAt: '2026-09-01T00:00:00Z' } as never);
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockResolvedValue({ attempt, claimed: true });
    vi.mocked(emailDb.finishInvoiceEmailAttemptInDb).mockImplementation(async (row, status, providerMessageId, failureCode) => ({
      ...row, status, providerMessageId: providerMessageId || null, failureCode: failureCode || null,
      sentAt: status === 'sent' ? '2026-09-26T10:00:01.000Z' : null
    }));
  });

  it('rejects an unverified account before reserving or sending', async () => {
    vi.mocked(userDb.getUserEmailVerificationStatusFromDb).mockResolvedValueOnce({ emailVerifiedAt: null } as never);
    const app = await appForEmail();
    expect((await app.inject(send)).statusCode).toBe(403);
    expect(emailDb.reserveInvoiceEmailAttemptInDb).not.toHaveBeenCalled();
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it.each([
    { recipientEmail: 'invalid' }, { subject: ' ' }, { subject: 'Invoice\r\nBcc: other@example.com' },
    { kind: 'reminder', requestSignature: true }, { requestSignature: true, includePublicLink: false },
    { attemptKey: 'invalid' }, { language: 'fr' }
  ])('validates JSON before creating an attempt: %j', async (invalid) => {
    const app = await appForEmail();
    expect((await app.inject({ ...send, payload: { ...send.payload, ...invalid } })).statusCode).toBe(400);
    expect(emailDb.reserveInvoiceEmailAttemptInDb).not.toHaveBeenCalled();
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it.each([
    ['email-invoice-not-found', 404], ['email-attempt-not-found', 404], ['email-requires-issued', 400],
    ['email-reminder-paid', 400], ['email-recovery-expired', 409], ['email-unresolved-attempt', 409]
  ])('returns the domain error %s without sending', async (code, status) => {
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockRejectedValueOnce(new Error(code));
    const app = await appForEmail();
    expect((await app.inject(send)).statusCode).toBe(status);
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it('reuses a recorded accepted result and never sends the duplicate request', async () => {
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockResolvedValueOnce({
      attempt: { ...attempt, status: 'sent', providerMessageId: 'accepted-id' }, claimed: false
    });
    const app = await appForEmail();
    const response = await app.inject(send);
    expect(response.statusCode).toBe(200);
    expect(response.json().delivery.providerMessageId).toBe('accepted-id');
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it('returns in-progress for a concurrent request without contacting Resend', async () => {
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockResolvedValueOnce({
      attempt: { ...attempt, status: 'queued' }, claimed: false
    });
    const app = await appForEmail();
    expect((await app.inject(send)).json().delivery.status).toBe('queued');
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it('recovers using the stored payload and original key without rendering or changing content', async () => {
    const app = await appForEmail();
    const response = await app.inject({ method: 'POST', url: '/api/2/invoices/7/email-deliveries/9/recover' });
    expect(response.statusCode).toBe(200);
    expect(emailDb.reserveInvoiceEmailAttemptInDb).toHaveBeenCalledWith({ userId: 2, invoiceId: 7, deliveryId: 9 });
    expect(mockResendSend).toHaveBeenCalledWith(payload, { idempotencyKey: `invoice-email/2/7/${attempt.attemptKey}` });
    expect(emailDb.saveInvoiceEmailPayloadInDb).not.toHaveBeenCalled();
    expect(response.json().delivery.providerPayload).toBeUndefined();
    await app.close();
  });

  it('records a transport timeout as unknown, keeping the same payload recoverable', async () => {
    mockResendSend.mockRejectedValueOnce(new Error('timeout'));
    const app = await appForEmail();
    const response = await app.inject(send);
    expect(response.json().delivery.status).toBe('unknown');
    expect(emailDb.finishInvoiceEmailAttemptInDb).toHaveBeenCalledWith(attempt, 'unknown', undefined, 'provider-unknown');
    await app.close();
  });

  it('records an explicit rejection as failed', async () => {
    mockResendSend.mockResolvedValueOnce({ data: null, error: { name: 'validation_error', message: 'private provider details' } });
    const app = await appForEmail();
    const response = await app.inject(send);
    expect(response.json().delivery.status).toBe('failed');
    expect(response.body).not.toContain('private provider details');
    await app.close();
  });

  it('reports acceptance even if outcome persistence and audit fail afterwards', async () => {
    vi.mocked(emailDb.finishInvoiceEmailAttemptInDb).mockRejectedValueOnce(new Error('database unavailable'));
    mockCreateAuditEvent.mockRejectedValueOnce(new Error('audit unavailable'));
    const app = await appForEmail();
    const response = await app.inject(send);
    expect(response.statusCode).toBe(200);
    expect(response.json().delivery.status).toBe('sent');
    expect(response.json().delivery.providerMessageId).toBe('mock-email-id');
    expect(mockResendSend).toHaveBeenCalledTimes(1);
    await app.close();
  });

  it('a reminder never changes the acknowledgment state', async () => {
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockResolvedValueOnce({ claimed: true,
      attempt: { ...attempt, kind: 'reminder', content: { ...content, kind: 'reminder' } }
    });
    const app = await appForEmail();
    await app.inject({ ...send, payload: { ...send.payload, kind: 'reminder' } });
    expect(invoiceDb.revokeInvoiceSigningFromDb).not.toHaveBeenCalled();
    expect(invoiceDb.issueInvoiceInDb).not.toHaveBeenCalled();
    await app.close();
  });

  it('records a PDF preparation failure before creating links or contacting Resend', async () => {
    vi.mocked(emailDb.reserveInvoiceEmailAttemptInDb).mockResolvedValueOnce({
      claimed: true, attempt: { ...attempt, status: 'queued', providerPayload: null }
    });
    vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValueOnce(invoiceFromDbFactory.build({ lifecycleStatus: 'issued' }));
    vi.mocked(userDb.getUserFromDb).mockResolvedValueOnce(userFactory.build());
    vi.mocked(renderInvoicePdf).mockRejectedValueOnce(new Error('PDF failed'));
    const app = await appForEmail();
    const response = await app.inject(send);
    expect(response.json().delivery.status).toBe('failed');
    expect(response.json().delivery.failureCode).toBe('preparation-failed');
    expect(invoiceDb.preparePublicInvoiceFromDb).not.toHaveBeenCalled();
    expect(mockResendSend).not.toHaveBeenCalled();
    await app.close();
  });

  it('uses the saved PDF data even when the email language and current profile differ', async () => {
    const invoice = invoiceFromDbFactory.build({ lifecycleStatus: 'issued', documentLanguage: 'lt', currency: 'eur',
      sender: { name: 'Saved freelancer, IV' }, totalAmount: '121.00' });
    vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValueOnce(invoice);
    vi.mocked(userDb.getUserFromDb).mockResolvedValueOnce(userFactory.build({ name: 'Changed name',
      invoiceEmail: 'business@example.com', currency: 'usd' }));
    vi.mocked(renderInvoicePdf).mockResolvedValueOnce(Buffer.from('%PDF-saved-lt'));
    const email = await prepareInvoiceEmailPayload(2, 7, { ...content, language: 'en' });
    expect(renderInvoicePdf).toHaveBeenCalledWith(invoice);
    expect(email.html).toContain('Invoice Details');
    expect(email.html).toContain('Saved freelancer');
    expect(email.html).not.toContain('Changed name');
    expect(email.html).toContain('121.00 EUR');
    expect(email.replyTo).toBe('business@example.com');
    expect(email.from).toMatch(/^"Saved freelancer, IV via InvoiceTrackr" </);
    expect(Buffer.from(email.attachments[0].content, 'base64').toString()).toBe('%PDF-saved-lt');
    expect(email.text).not.toContain('Please find your invoice attached.');
  });
});
