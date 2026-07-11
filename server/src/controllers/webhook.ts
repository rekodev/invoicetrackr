import { FastifyReply, FastifyRequest } from 'fastify';

import { resend } from '../config/resend';
import { BadRequestError, InternalServerError } from '../utils/error';

const DEFAULT_FORWARD_FROM_EMAIL = 'support@invoicetrackr.app';

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

  const { data, error } = await forwardReceivedEmail(emailId);

  if (error) {
    throw new InternalServerError(error.message);
  }

  return reply.status(200).send({ received: true, data });
};
