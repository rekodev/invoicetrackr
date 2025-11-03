import { FastifyReply, FastifyRequest } from 'fastify';
import { resend } from '../config/resend';
import { BadRequestError } from '../utils/errors';

export const postContactMessage = async (
  req: FastifyRequest<{
    Body: { email: string; message: string };
  }>,
  reply: FastifyReply
) => {
  const { email, message } = req.body;

  const { error } = await resend.emails.send({
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    to: 'support@ruwhia8088.resend.app',
    subject: 'New Contact Message',
    html: `<p>You have received a new message from ${email}:</p><p>${message}</p>`
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError('Failed to send message');
  }

  reply.status(200).send({
    message: 'Message sent successfully'
  });
};
