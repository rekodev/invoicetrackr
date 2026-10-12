import { FastifyReply, FastifyRequest } from 'fastify';

import {
  type ProviderDeliveryStatus,
  updateDeliveryStatusFromProviderInDb
} from '../database/email-delivery';
import { forwardSupportEmail } from '../services/support-forwarding';
import { BadRequestError, InternalServerError } from '../utils/error';

const deliveryStatusByEvent: Record<string, ProviderDeliveryStatus> = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.failed': 'failed'
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

  const { data: forwarded, error } = await forwardSupportEmail(emailId);

  if (error) {
    throw new InternalServerError(error.message);
  }

  return reply.status(200).send({ received: true, data: forwarded });
};
