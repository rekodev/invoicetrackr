import type { InvoiceEmailDelivery } from '@invoicetrackr/types';

import { resend } from '../config/resend';
import { finishInvoiceEmailAttemptInDb, type InvoiceEmailAttempt } from '../database/invoice-email';

export type InvoiceEmailProviderPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  attachments: Array<{ filename: string; content: string }>;
};

export const publicInvoiceEmailAttempt = (attempt: InvoiceEmailAttempt): InvoiceEmailDelivery => ({
  id: attempt.id,
  recipient: attempt.recipient,
  kind: attempt.kind,
  status: attempt.status,
  createdAt: attempt.createdAt,
  sentAt: attempt.sentAt,
  failedAt: attempt.failedAt,
  providerMessageId: attempt.providerMessageId,
  failureCode: attempt.failureCode,
  content: attempt.content,
  recoveryExpiresAt: attempt.recoveryExpiresAt
});

// Persist the outcome separately from the provider call. A persistence error after
// acceptance must never be treated as a provider rejection or trigger another send.
export const submitInvoiceEmailAttempt = async (
  attempt: InvoiceEmailAttempt,
  logError: (error: unknown) => void
) => {
  const payload = attempt.providerPayload;
  if (!payload || !attempt.attemptKey) throw new Error('Missing invoice email payload');
  let status: 'sent' | 'failed' | 'unknown' = 'unknown';
  let providerMessageId: string | undefined;
  let failureCode: string | undefined;
  try {
    const result = await resend.emails.send(payload, {
      idempotencyKey: `invoice-email/${attempt.userId}/${attempt.invoiceId}/${attempt.attemptKey}`
    });
    if (result.data?.id && !result.error) {
      status = 'sent';
      providerMessageId = result.data.id;
    } else if (result.error) {
      // Server errors and in-flight idempotency conflicts may have an uncertain
      // outcome. Only an explicit client-side rejection is a definitive failure.
      const code = result.error.name;
      const rejected = ['validation_error', 'missing_required_field', 'invalid_access',
        'restricted_api_key', 'invalid_api_key', 'missing_api_key', 'rate_limit_exceeded',
        'daily_quota_exceeded', 'monthly_quota_exceeded', 'invalid_idempotency_key',
        'invalid_attachment', 'invalid_from_address', 'invalid_parameter', 'invalid_region',
        'security_error', 'method_not_allowed', 'not_found'].includes(code);
      status = rejected ? 'failed' : 'unknown';
      failureCode = rejected ? 'provider-rejected' : 'provider-unknown';
    } else {
      failureCode = 'provider-unknown';
    }
  } catch {
    failureCode = 'provider-unknown';
  }
  const now = new Date().toISOString();
  let completed: InvoiceEmailAttempt = { ...attempt, status,
    providerMessageId: providerMessageId || null, failureCode: failureCode || null,
    sentAt: status === 'sent' ? now : null, failedAt: status === 'failed' ? now : null };
  try {
    completed = await finishInvoiceEmailAttemptInDb(attempt, status, providerMessageId, failureCode) || completed;
  } catch (error) {
    logError(error);
  }
  return completed;
};
