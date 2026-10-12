import { FastifyReply, FastifyRequest } from 'fastify';

import { resend } from '../config/resend';
import {
  type ProviderDeliveryStatus,
  updateDeliveryStatusFromProviderInDb
} from '../database/email-delivery';
import { BadRequestError, InternalServerError } from '../utils/error';

const DEFAULT_FORWARD_FROM_EMAIL = 'support@invoicetrackr.app';

const deliveryStatusByEvent: Record<string, ProviderDeliveryStatus> = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.failed': 'failed'
};

type ResendForwardResponse = {
  data: unknown;
  error: { message: string } | null;
};

const forwardReceivedEmail = async (
  emailId: string
): Promise<ResendForwardResponse> => {
  const to = process.env.RESEND_FORWARD_TO_EMAIL!;
  const from =
    process.env.RESEND_FORWARD_FROM_EMAIL || DEFAULT_FORWARD_FROM_EMAIL;

  const { data, error } = await resend.emails.receiving.forward({
    emailId,
    to,
    from
  });

  return {
    data,
    error: error ? { message: error.message } : null
  };
};

export const handleResendWebhook = async (
  req: FastifyRequest<{
    Body: {
      type: string;
      created_at?: string;
      data?: { email_id?: string; bounce?: { type?: string } };
    };
  }>,
  reply: FastifyReply
) => {
  const { type, created_at: createdAt, data } = req.body;
  const deliveryStatus = deliveryStatusByEvent[type];

  if (deliveryStatus && data?.email_id) {
    await updateDeliveryStatusFromProviderInDb({
      providerMessageId: data.email_id,
      status: deliveryStatus,
      failureCode: data.bounce?.type,
      occurredAt: createdAt ?? new Date().toISOString()
    });
  }

  if (type !== 'email.received') {
    return reply.status(200).send({ received: true });
  }

  const emailId = data?.email_id;

  if (!emailId) {
    throw new BadRequestError('Received email webhook is missing email_id');
  }

  const { data: forwarded, error } = await forwardReceivedEmail(emailId);

  if (error) {
    throw new InternalServerError(error.message);
  }

  return reply.status(200).send({ received: true, data: forwarded });
};
