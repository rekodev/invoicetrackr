import { FastifyReply, FastifyRequest } from 'fastify';

import { forwardSupportEmail } from '../services/support-forwarding';
import { BadRequestError, InternalServerError } from '../utils/error';

export const handleResendWebhook = async (
  req: FastifyRequest<{
    Body: {
      type?: string;
      data?: { email_id?: string };
    };
  }>,
  reply: FastifyReply
) => {
  if (req.body.type !== 'email.received') {
    return reply.status(200).send({ received: true });
  }

  const emailId = req.body.data?.email_id;

  if (!emailId) {
    throw new BadRequestError('Received email webhook is missing email_id');
  }

  const { data, error } = await forwardSupportEmail(emailId);

  if (error) {
    throw new InternalServerError(error.message);
  }

  return reply.status(200).send({ received: true, data });
};
