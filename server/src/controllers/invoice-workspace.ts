import type { InvoicePaymentBody } from '@invoicetrackr/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { getInvoiceDeliveriesFromDb } from '../database/email-delivery';
import { getInvoiceFromDb } from '../database/invoice';
import {
  changeInvoicePaymentInDb,
  getInvoicePaymentsFromDb,
  PAYMENT_EXCEEDS_BALANCE,
  PAYMENT_FUTURE_DATE,
  PAYMENT_INVALID_STATE,
  PAYMENT_NOT_FOUND,
  summarizeInvoicePayments
} from '../database/invoice-payment';
import { recordRequestAudit } from '../utils/audit';
import { BadRequestError, NotFoundError } from '../utils/error';

type Params = { userId: string; id: string; paymentId: string };

const recordPaymentAudit = async (
  req: FastifyRequest,
  userId: number,
  invoiceId: number,
  action: string,
  details: unknown
) => {
  try {
    await recordRequestAudit({
      req,
      userId,
      action,
      entityType: 'invoice',
      entityId: invoiceId,
      newValue: details
    });
  } catch (error) {
    req.log.error(
      { error, invoiceId },
      'Unable to record invoice payment audit'
    );
  }
};

const handlePaymentError = async (error: unknown, req: FastifyRequest) => {
  const i18n = await useI18n(req);
  const code = error instanceof Error ? error.message : '';
  if (code === PAYMENT_NOT_FOUND)
    throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if (code === PAYMENT_INVALID_STATE)
    throw new BadRequestError(i18n.t('error.invoice.paymentRequiresIssued'));
  if (code === PAYMENT_EXCEEDS_BALANCE)
    throw new BadRequestError(i18n.t('error.invoice.paymentExceedsBalance'));
  if (code === PAYMENT_FUTURE_DATE)
    throw new BadRequestError(i18n.t('error.invoice.paymentFutureDate'));
  throw error;
};

export const getInvoiceWorkspace = async (
  req: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const invoice = await getInvoiceFromDb(userId, id);
  if (!invoice) {
    const i18n = await useI18n(req);
    throw new NotFoundError(i18n.t('error.invoice.notFound'));
  }
  const [payments, deliveries] = await Promise.all([
    getInvoicePaymentsFromDb(userId, id),
    getInvoiceDeliveriesFromDb(userId, id)
  ]);
  reply.status(200).send({
    invoice,
    canCopyPublicLink: Boolean(
      invoice.publicInvoiceToken &&
        !invoice.publicInvoiceRevokedAt &&
        (!invoice.publicInvoiceExpiresAt ||
          new Date(invoice.publicInvoiceExpiresAt).getTime() > Date.now())
    ),
    payments,
    balance: summarizeInvoicePayments(invoice.totalAmount, payments),
    deliveries
  });
};

export const createInvoicePayment = async (
  req: FastifyRequest<{ Params: Params; Body: InvoicePaymentBody }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoiceId = Number(req.params.id);
  try {
    const result = await changeInvoicePaymentInDb(userId, invoiceId, {
      payment: req.body
    });
    await recordPaymentAudit(
      req,
      userId,
      invoiceId,
      'invoice.payment_created',
      {
        paymentId: result.payment?.id,
        amount: req.body.amount,
        paymentDate: req.body.paymentDate
      }
    );
    reply.status(201).send(result);
  } catch (error) {
    await handlePaymentError(error, req);
  }
};

export const updateInvoicePayment = async (
  req: FastifyRequest<{ Params: Params; Body: InvoicePaymentBody }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoiceId = Number(req.params.id);
  try {
    const result = await changeInvoicePaymentInDb(userId, invoiceId, {
      paymentId: Number(req.params.paymentId),
      payment: req.body
    });
    await recordPaymentAudit(
      req,
      userId,
      invoiceId,
      'invoice.payment_updated',
      {
        paymentId: result.payment?.id,
        amount: req.body.amount,
        paymentDate: req.body.paymentDate
      }
    );
    reply.status(200).send(result);
  } catch (error) {
    await handlePaymentError(error, req);
  }
};

export const deleteInvoicePayment = async (
  req: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoiceId = Number(req.params.id);
  try {
    await changeInvoicePaymentInDb(userId, invoiceId, {
      paymentId: Number(req.params.paymentId),
      remove: true
    });
    await recordPaymentAudit(
      req,
      userId,
      invoiceId,
      'invoice.payment_removed',
      {
        paymentId: Number(req.params.paymentId)
      }
    );
    const i18n = await useI18n(req);
    reply
      .status(200)
      .send({ message: i18n.t('success.invoice.paymentRemoved') });
  } catch (error) {
    await handlePaymentError(error, req);
  }
};
