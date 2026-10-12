import { resend } from '../config/resend';

const DEFAULT_FORWARD_FROM_EMAIL = 'support@invoicetrackr.app';

type ForwardResult = {
  data: unknown;
  error: { message: string } | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const forwardSupportEmail = async (
  emailId: string
): Promise<ForwardResult> => {
  const to = process.env.RESEND_FORWARD_TO_EMAIL!;
  const from =
    process.env.RESEND_FORWARD_FROM_EMAIL || DEFAULT_FORWARD_FROM_EMAIL;

  const { data: email, error: getError } =
    await resend.emails.receiving.get(emailId);

  if (getError || !email) {
    return {
      data: null,
      error: { message: getError?.message ?? 'Received email not found' }
    };
  }

  const sender = email.reply_to?.length ? email.reply_to : [email.from];
  const senderLine = `From: ${email.from}`;
  const attachments: { filename: string; content: string }[] = [];

  if (email.raw?.download_url) {
    const raw = await fetch(email.raw.download_url);

    if (raw.ok) {
      attachments.push({
        filename: 'original-message.eml',
        content: Buffer.from(await raw.arrayBuffer()).toString('base64')
      });
    }
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: sender,
    subject: email.subject || '(no subject)',
    text: `${senderLine}\n\n${email.text ?? ''}`,
    html: `<p><strong>${escapeHtml(senderLine)}</strong></p><hr />${
      email.html ?? `<pre>${escapeHtml(email.text ?? '')}</pre>`
    }`,
    attachments: attachments.length ? attachments : undefined
  });

  return {
    data,
    error: error ? { message: error.message } : null
  };
};
