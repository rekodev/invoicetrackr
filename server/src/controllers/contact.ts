import { ContactMessageEmail } from '@invoicetrackr/emails';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { appEmailFrom } from '../config/app';
import { resend } from '../config/resend';
import { BadRequestError } from '../utils/error';

export const postContactMessage = async (
  req: FastifyRequest<{
    Body: { email: string; message: string };
  }>,
  reply: FastifyReply
) => {
  const { email, message } = req.body;
  const i18n = await useI18n(req);

  const emailHtml = ContactMessageEmail({
    email,
    message
  });
  const contactToEmail = process.env.RESEND_FORWARD_TO_EMAIL;

  if (!contactToEmail) {
    throw new BadRequestError(i18n.t('error.contact.unableToSendMessage'));
  }

  const { error } = await resend.emails.send({
    from: appEmailFrom,
    to: contactToEmail,
    subject: 'New Contact Message',
    react: emailHtml,
    replyTo: email
  });

  if (error) {
    throw new BadRequestError(i18n.t('error.contact.unableToSendMessage'));
  }

  reply.status(200).send({
    message: i18n.t('success.contact.messageSent')
  });
};
