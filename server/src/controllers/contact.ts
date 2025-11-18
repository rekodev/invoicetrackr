import { FastifyReply, FastifyRequest } from 'fastify';
import { ContactMessageEmail } from '@invoicetrackr/emails';
import { render } from '@react-email/render';
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
  console.log('Received contact message request', { email, message });
  const i18n = await useI18n(req);
  console.log('i18n initialized');

  console.log('Preparing to send contact message email');
  const emailHtml = await render(
    ContactMessageEmail({
      email,
      message
    })
  );
  console.log('Email HTML rendered');

  console.log({ resendApiKey: process.env.RESEND_EMAIL_API_KEY });
  const { error } = await resend.emails.send({
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    to: 'support@ruwhia8088.resend.app',
    subject: 'New Contact Message',
    html: emailHtml
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError(i18n.t('error.contact.unableToSendMessage'));
  }

  reply.status(200).send({
    message: i18n.t('success.contact.messageSent')
  });
};
