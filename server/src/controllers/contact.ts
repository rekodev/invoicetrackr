import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { BadRequestError } from '../utils/error';
import { resend } from '../config/resend';

export const postContactMessage = async (
  req: FastifyRequest<{
    Body: { email: string; message: string };
  }>,
  reply: FastifyReply
) => {
  const { email, message } = req.body;
  const i18n = await useI18n(req);

  const { error } = await resend.emails.send({
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    to: 'support@ruwhia8088.resend.app',
    subject: 'New Contact Message',
    text: `You have received a new contact message from ${email}:\n\n${message}`
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError(i18n.t('error.contact.unableToSendMessage'));
  }

  reply.status(200).send({
    message: i18n.t('success.contact.messageSent')
  });
};
