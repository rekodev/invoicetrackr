import { invoiceEmailContentSchema, type SendInvoiceEmailBody } from '@invoicetrackr/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { analyticsEvents } from '../analytics/events';
import { captureAnalyticsEventForUser } from '../analytics/posthog';
import { markPublicInvoiceSentInDb, revokeInvoiceSigningFromDb } from '../database/invoice';
import {
  finishInvoiceEmailAttemptInDb,
  reserveInvoiceEmailAttemptInDb,
  saveInvoiceEmailPayloadInDb
} from '../database/invoice-email';
import { recordRequestAudit } from '../utils/audit';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/error';
import { publicInvoiceEmailAttempt, submitInvoiceEmailAttempt } from '../utils/invoice-email';
import { prepareInvoiceEmailPayload } from './invoice';

type Params = { userId: string; id: string; deliveryId?: string };

const deliver = async (
  req: FastifyRequest<{ Params: Params; Body: SendInvoiceEmailBody }>,
  reply: FastifyReply,
  recovery = false
) => {
  const userId = Number(req.params.userId);
  const invoiceId = Number(req.params.id);
  const i18n = await useI18n(req);
  const logError = (error: unknown) => req.log.error({ error, invoiceId }, 'Invoice email attempt persistence failed');
  let reserved: Awaited<ReturnType<typeof reserveInvoiceEmailAttemptInDb>>;
  try {
    reserved = await reserveInvoiceEmailAttemptInDb(recovery ? {
      userId, invoiceId, deliveryId: Number(req.params.deliveryId)
    } : {
      userId, invoiceId, attemptKey: req.body.attemptKey,
      content: invoiceEmailContentSchema.parse(req.body),
      replacesDeliveryId: req.body.replacesDeliveryId,
      confirmPossibleDuplicate: req.body.confirmPossibleDuplicate
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (['email-invoice-not-found', 'email-attempt-not-found'].includes(code))
      throw new NotFoundError(i18n.t('error.invoice.notFound'));
    if (code === 'email-requires-issued') throw new BadRequestError(i18n.t('error.invoice.emailRequiresIssued'));
    if (code === 'email-reminder-paid') throw new BadRequestError(i18n.t('error.invoice.reminderRequiresBalance'));
    if (code === 'email-recovery-expired') throw new ConflictError(i18n.t('error.invoice.emailRecoveryExpired'));
    if (code === 'email-unresolved-attempt') throw new ConflictError(i18n.t('error.invoice.emailUnresolvedAttempt'));
    if (['email-attempt-conflict', 'email-attempt-not-recoverable'].includes(code))
      throw new ConflictError(i18n.t('error.invoice.emailAttemptConflict'));
    throw error;
  }
  let attempt = reserved.attempt;
  if (reserved.claimed) {
    if (!attempt.providerPayload) {
      try {
        const payload = await prepareInvoiceEmailPayload(userId, invoiceId, attempt.content!);
        const saved = await saveInvoiceEmailPayloadInDb(attempt, payload);
        // Another request acquired the lease while preparation was in progress.
        if (!saved) return reply.status(200).send({
          message: i18n.t('success.invoice.emailQueued'), delivery: publicInvoiceEmailAttempt(attempt)
        });
        attempt = saved;
      } catch (error) {
        req.log.error({ error, invoiceId }, 'Unable to prepare invoice email');
        const failed = await finishInvoiceEmailAttemptInDb(attempt, 'failed', undefined, 'preparation-failed');
        attempt = failed || { ...attempt, status: 'failed', failureCode: 'preparation-failed' };
        return reply.status(200).send({ message: i18n.t('error.invoice.emailPreparationFailed'),
          delivery: publicInvoiceEmailAttempt(attempt) });
      }
    }
    if (!attempt.recoveryExpiresAt || new Date(attempt.recoveryExpiresAt).getTime() <= Date.now())
      throw new ConflictError(i18n.t('error.invoice.emailRecoveryExpired'));
    attempt = await submitInvoiceEmailAttempt(attempt, logError);
    if (attempt.status === 'sent') {
      // Delivery is already accepted. These bookkeeping operations are retryable
      // independently and cannot change the response into a send failure.
      const effects = await Promise.allSettled([
        ...(attempt.content?.includePublicLink ? [markPublicInvoiceSentInDb({ userId, id: invoiceId,
          requestSignature: attempt.content.kind === 'invoice' && attempt.content.requestSignature })] : []),
        ...(attempt.content?.kind === 'invoice' && !attempt.content.requestSignature
          ? [revokeInvoiceSigningFromDb({ userId, id: invoiceId, onlyUnsigned: true })] : []),
        captureAnalyticsEventForUser({ userId, event: analyticsEvents.invoiceEmailed,
          properties: { kind: attempt.kind, include_public_link: attempt.content?.includePublicLink,
            request_signature: attempt.content?.requestSignature, has_attachment: true } }),
        recordRequestAudit({ req, userId, action: 'invoice.email_sent', entityType: 'invoice', entityId: invoiceId,
          newValue: { deliveryId: attempt.id, kind: attempt.kind, recipientEmail: attempt.recipient } })
      ]);
      effects.forEach((result) => { if (result.status === 'rejected') logError(result.reason); });
    }
  }
  const messageKey = attempt.status === 'sent' || attempt.status === 'delivered'
    ? 'success.invoice.emailAccepted'
    : attempt.status === 'failed' || attempt.status === 'bounced'
      ? 'error.invoice.unableToSendEmail'
      : attempt.status === 'unknown' ? 'success.invoice.emailUnknown' : 'success.invoice.emailQueued';
  return reply.status(200).send({ message: i18n.t(messageKey), delivery: publicInvoiceEmailAttempt(attempt) });
};

export const sendInvoiceEmail = (
  req: FastifyRequest<{ Params: Params; Body: SendInvoiceEmailBody }>, reply: FastifyReply
) => deliver(req, reply);

export const recoverInvoiceEmail = (
  req: FastifyRequest<{ Params: Params; Body: SendInvoiceEmailBody }>, reply: FastifyReply
) => deliver(req, reply, true);
