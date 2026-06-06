import { FastifyReply, FastifyRequest } from 'fastify';
import type { IncomeJournalQuery, InvoiceBody } from '@invoicetrackr/types';
import { InvoiceEmail } from '@invoicetrackr/emails';
import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { useI18n } from 'fastify-i18n';

import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError
} from '../utils/error';
import {
  deleteInvoiceFromDb,
  findInvoiceById,
  findInvoiceByInvoiceId,
  getIncomeJournalRowsFromDb,
  getInvoiceFromDb,
  getInvoicesFromDb,
  getInvoicesRevenueFromDb,
  getInvoicesTotalAmountFromDb,
  getLatestInvoicesFromDb,
  getNextInvoiceNumberFromDb,
  getPublicInvoiceSigningFromDb,
  insertInvoiceInDb,
  markInvoiceSigningSentInDb,
  prepareInvoiceSigningFromDb,
  regenerateInvoiceSigningFromDb,
  revokeInvoiceSigningFromDb,
  signInvoiceByRecipientTokenInDb,
  updateInvoiceInDb,
  updateInvoiceStatusInDb
} from '../database/invoice';
import en from '../locales/en';
import { getClientsFromDb } from '../database/client';
import { getUserFromDb } from '../database/user';
import lt from '../locales/lt';
import { resend } from '../config/resend';

const locales = { en, lt };

const interpolateTranslation = (
  translation: string,
  replacements: Record<string, string>
) =>
  Object.entries(replacements).reduce(
    (value, [key, replacement]) => value.replace(`%{${key}}`, replacement),
    translation
  );

const uploadSignatureFile = async (
  signatureFile: MultipartFile,
  unableToUploadMessage: string
) => {
  const fileBuffer = await signatureFile.toBuffer();

  const uploadedSignature = await cloudinary.uploader.upload(
    `data:${signatureFile.mimetype};base64,${fileBuffer.toString('base64')}`
  );

  if (!uploadedSignature) throw new BadRequestError(unableToUploadMessage);

  return uploadedSignature.url.replace('http://', 'https://');
};

const escapeEmailHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeCsvValue = (value: string | null | undefined) =>
  `"${String(value || '').replace(/"/g, '""')}"`;

const formatCsvDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : '';

const UNSIGNED_SIGNING_LINK_VALIDITY_DAYS = 30;
const SIGNED_SIGNING_LINK_VALIDITY_DAYS = 90;
const createSigningLinkExpiration = (isSigned = false) =>
  new Date(
    Date.now() +
      (isSigned
        ? SIGNED_SIGNING_LINK_VALIDITY_DAYS
        : UNSIGNED_SIGNING_LINK_VALIDITY_DAYS) *
        24 *
        60 *
        60 *
        1000
  ).toISOString();
const isSigningLinkExpired = (expiresAt?: string | null) =>
  Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());

const assertSigningLinkAvailable = (
  invoice: Pick<
    InvoiceBody,
    'recipientSigningRevokedAt' | 'recipientSigningExpiresAt'
  >,
  i18n: Awaited<ReturnType<typeof useI18n>>
) => {
  if (invoice.recipientSigningRevokedAt)
    throw new BadRequestError(i18n.t('error.invoice.signingLinkRevoked'));
  if (isSigningLinkExpired(invoice.recipientSigningExpiresAt))
    throw new BadRequestError(i18n.t('error.invoice.signingLinkExpired'));
};

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoices = await getInvoicesFromDb(userId);

  reply.status(200).send({ invoices });
};

export const getIncomeJournal = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: IncomeJournalQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { from, to } = req.query;
  const i18n = await useI18n(req);
  const rows = await getIncomeJournalRowsFromDb({ userId, from, to });
  const currency = rows.at(0)?.currency?.toUpperCase() || 'EUR';
  const headers = [
    i18n.t('emails.incomeJournal.paymentDate'),
    i18n.t('emails.incomeJournal.invoiceDate'),
    i18n.t('emails.incomeJournal.documentNumber'),
    i18n.t('emails.incomeJournal.client'),
    i18n.t('emails.incomeJournal.clientCode'),
    i18n.t('emails.incomeJournal.services'),
    i18n.t('emails.incomeJournal.subtotal', { currency }),
    i18n.t('emails.incomeJournal.vatTotal', { currency }),
    i18n.t('emails.incomeJournal.grandTotal', { currency })
  ];
  const filename = i18n.t('emails.incomeJournal.filename');
  const csvRows = rows.map((row) =>
    [
      formatCsvDate(row.paidAt),
      row.date,
      row.invoiceId,
      row.receiverName,
      row.receiverBusinessNumber,
      row.descriptions,
      row.subtotalAmount,
      row.vatAmount,
      row.totalAmount
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header(
      'Content-Disposition',
      `attachment; filename="${filename}-${from}-${to}.csv"`
    )
    .status(200)
    .send(
      `\uFEFF${[headers.map(escapeCsvValue).join(','), ...csvRows].join('\n')}`
    );
};

export const getInvoice = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  reply.status(200).send({ invoice });
};

export const getNextInvoiceNumber = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: { series?: string };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const nextInvoiceNumber = await getNextInvoiceNumberFromDb(
    userId,
    req.query.series
  );

  reply.status(200).send(nextInvoiceNumber);
};

export const postInvoice = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: InvoiceBody & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoiceData = req.body;
  const signatureFile = req.body?.file;
  const i18n = await useI18n(req);

  let uploadedSignatureUrl: string | undefined;

  if (signatureFile) {
    uploadedSignatureUrl = await uploadSignatureFile(
      signatureFile,
      i18n.t('error.user.unableToUploadSignature')
    );
  }

  const foundInvoice =
    invoiceData.invoiceId && !invoiceData.invoiceSeries
      ? await findInvoiceByInvoiceId(userId, invoiceData.invoiceId)
      : null;

  if (foundInvoice)
    throw new AlreadyExistsError(i18n.t('error.invoice.alreadyExists'));

  const signatureUrl = uploadedSignatureUrl || invoiceData.senderSignature;

  const insertedInvoice = await insertInvoiceInDb(
    invoiceData,
    userId,
    signatureUrl
  );

  if (!insertedInvoice)
    throw new BadRequestError(i18n.t('error.invoice.unableToCreate'));

  reply.status(201).send({
    invoice: insertedInvoice,
    message: i18n.t('success.invoice.created')
  });
};

export const updateInvoice = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: InvoiceBody & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const invoiceData = req.body;
  const signatureFile = req.body?.file;
  const i18n = await useI18n(req);

  const foundInvoice = await getInvoiceFromDb(userId, Number(invoiceData.id));

  if (!foundInvoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if ((foundInvoice.lifecycleStatus || 'draft') !== 'draft')
    throw new BadRequestError(i18n.t('error.invoice.issuedImmutable'));

  if (invoiceData.invoiceId) {
    const existingInvoiceWithNumber = await findInvoiceByInvoiceId(
      userId,
      invoiceData.invoiceId
    );

    if (
      existingInvoiceWithNumber &&
      existingInvoiceWithNumber.id !== Number(invoiceData.id)
    )
      throw new AlreadyExistsError(i18n.t('error.invoice.alreadyExists'));
  }

  let uploadedSignatureUrl: string | undefined;

  if (signatureFile) {
    uploadedSignatureUrl = await uploadSignatureFile(
      signatureFile,
      i18n.t('error.user.unableToUploadSignature')
    );
  }

  const signatureUrl = uploadedSignatureUrl || invoiceData.senderSignature;

  const updatedInvoice = await updateInvoiceInDb(
    userId,
    id,
    invoiceData,
    signatureUrl
  );

  if (!updatedInvoice)
    throw new BadRequestError(i18n.t('error.invoice.unableToUpdate'));

  reply.status(200).send({
    invoice: updatedInvoice,
    message: i18n.t('success.invoice.updated')
  });
};

export async function updateInvoiceStatus(
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: { status: 'paid' | 'pending' | 'canceled' };
  }>,
  reply: FastifyReply
) {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const { status } = req.body;
  const i18n = await useI18n(req);

  const foundInvoice = await findInvoiceById(userId, id);

  if (!foundInvoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  const updatedInvoice = await updateInvoiceStatusInDb(userId, id, status);

  if (!updatedInvoice)
    throw new BadRequestError(i18n.t('error.invoice.unableToUpdateStatus'));

  reply.status(200).send({ message: i18n.t('success.invoice.statusUpdated') });
}

export const deleteInvoice = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if ((invoice.lifecycleStatus || 'draft') !== 'draft')
    throw new BadRequestError(i18n.t('error.invoice.issuedImmutable'));

  const deletedInvoice = await deleteInvoiceFromDb(userId, id);

  if (!deletedInvoice)
    throw new BadRequestError(i18n.t('error.invoice.unableToDelete'));

  reply.status(200).send({ message: i18n.t('success.invoice.deleted') });
};

export const getInvoicesTotalAmount = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoices = await getInvoicesTotalAmountFromDb(userId);
  const clients = await getClientsFromDb(userId);

  if (!invoices)
    throw new BadRequestError(i18n.t('error.invoice.unableToRetrieveData'));

  reply.status(200).send({ invoices, totalClients: clients?.length });
};

export const getInvoicesRevenue = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoices = await getInvoicesRevenueFromDb(userId);

  if (!invoices)
    throw new BadRequestError(i18n.t('error.invoice.unableToRetrieveData'));

  const revenueByMonth = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0
  };

  invoices.forEach((invoice) => {
    const date = new Date(invoice.date);
    revenueByMonth[date.getMonth()] += Number(invoice.totalAmount);
  });

  reply.status(200).send({ revenueByMonth });
};

export const getLatestInvoices = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoices = await getLatestInvoicesFromDb(userId);

  if (!invoices)
    throw new BadRequestError(i18n.t('error.invoice.unableToRetrieveData'));

  reply.status(200).send({ invoices });
};

export const sendInvoiceEmail = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: {
      recipientEmail: string;
      subject: string;
      message?: string;
      file?: MultipartFile;
    };
  }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const { recipientEmail, subject, message, file } = req.body;
  const i18n = await useI18n(req);

  const [invoice, user] = await Promise.all([
    getInvoiceFromDb(userId, id),
    getUserFromDb(userId)
  ]);

  if (!user) throw new NotFoundError(i18n.t('error.user.notFound'));
  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  let signingToken =
    invoice.recipientSigningToken || randomBytes(32).toString('hex');
  const shouldRotateSigningLink = Boolean(
    invoice.recipientSigningToken &&
      (invoice.recipientSigningRevokedAt ||
        isSigningLinkExpired(invoice.recipientSigningExpiresAt) ||
        (invoice.recipientSigningEmail &&
          invoice.recipientSigningEmail.toLowerCase() !==
            recipientEmail.toLowerCase()))
  );

  if (shouldRotateSigningLink) {
    signingToken = randomBytes(32).toString('hex');
    const regenerated = await regenerateInvoiceSigningFromDb({
      userId,
      id,
      token: signingToken,
      recipientEmail,
      expiresAt: createSigningLinkExpiration(Boolean(invoice.recipientSignedAt))
    });

    if (!regenerated)
      throw new BadRequestError(
        i18n.t('error.invoice.unableToRegenerateSigningLink')
      );
  } else if (invoice.recipientSigningToken) {
    assertSigningLinkAvailable(invoice, i18n);
  }

  const preparedInvoice = await prepareInvoiceSigningFromDb({
    userId,
    id,
    token: signingToken,
    recipientEmail,
    expiresAt: createSigningLinkExpiration(Boolean(invoice.recipientSignedAt))
  });

  if (!preparedInvoice?.recipientSigningToken)
    throw new BadRequestError(
      i18n.t('error.invoice.unableToCreateSigningLink')
    );

  const publicBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const signingLink = `${publicBaseUrl}/invoices/sign/${preparedInvoice.recipientSigningToken}`;

  const attachment = file
    ? await file.toBuffer().then((buffer) => buffer.toString('base64'))
    : undefined;

  const htmlContent = InvoiceEmail({
    invoiceNumber: invoice.invoiceId || '',
    amount: `${invoice.totalAmount} ${user.currency}`,
    dueDate: invoice.dueDate,
    senderName: user.name || user.email,
    message: message || i18n.t('emails.invoice.defaultMessage'),
    translations: {
      title: i18n.t('emails.invoice.title'),
      subtitle: i18n.t('emails.invoice.subtitle'),
      detailsTitle: i18n.t('emails.invoice.detailsTitle'),
      sentBy: i18n.t('emails.invoice.sentBy'),
      invoiceNumber: i18n.t('emails.invoice.invoiceNumber'),
      amount: i18n.t('emails.invoice.amount'),
      dueDate: i18n.t('emails.invoice.dueDate'),
      from: i18n.t('emails.invoice.from'),
      attachmentTitle: i18n.t('emails.invoice.attachmentTitle'),
      attachmentMessage: i18n.t('emails.invoice.attachmentMessage'),
      signingTitle: i18n.t('emails.invoice.signingTitle'),
      signingMessage: i18n.t('emails.invoice.signingMessage'),
      signingButton: i18n.t('emails.invoice.signingButton'),
      signingFallback: i18n.t('emails.invoice.signingFallback'),
      viewTitle: i18n.t('emails.invoice.viewTitle'),
      viewMessage: i18n.t('emails.invoice.viewMessage'),
      viewButton: i18n.t('emails.invoice.viewButton'),
      footer: i18n.t('emails.invoice.footer'),
      copyright: i18n.t('emails.invoice.copyright', {
        year: new Date().getFullYear()
      })
    },
    signingLink,
    isSigningAvailable: !invoice.recipientSignedAt
  });

  const { error } = await resend.emails.send({
    to: recipientEmail,
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    replyTo: user.email,
    subject,
    react: htmlContent,
    attachments:
      attachment && file?.filename
        ? [
            {
              content: attachment,
              filename: file.filename
            }
          ]
        : undefined
  });

  if (error)
    throw new BadRequestError(i18n.t('error.invoice.unableToSendEmail'));

  await markInvoiceSigningSentInDb({ userId, id });

  reply.status(200).send({ message: i18n.t('success.invoice.emailSent') });
};

export const revokeInvoiceSigning = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if (!invoice.recipientSigningToken)
    throw new BadRequestError(
      i18n.t('error.invoice.unableToCreateSigningLink')
    );

  const revoked = await revokeInvoiceSigningFromDb({
    userId,
    id
  });

  if (!revoked) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  reply
    .status(200)
    .send({ message: i18n.t('success.invoice.signingLinkRevoked') });
};

export const regenerateInvoiceSigning = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: { recipientEmail: string };
  }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  const regenerated = await regenerateInvoiceSigningFromDb({
    userId,
    id,
    token: randomBytes(32).toString('hex'),
    recipientEmail: req.body.recipientEmail,
    expiresAt: createSigningLinkExpiration(Boolean(invoice.recipientSignedAt))
  });

  if (!regenerated)
    throw new BadRequestError(
      i18n.t('error.invoice.unableToRegenerateSigningLink')
    );

  reply.status(200).send({
    message: i18n.t('success.invoice.signingLinkRegenerated')
  });
};

export const getPublicInvoiceSigning = async (
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const signing = await getPublicInvoiceSigningFromDb(req.params.token);

  if (!signing) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  assertSigningLinkAvailable(signing.invoice, i18n);

  reply.status(200).send({
    signing: {
      token: req.params.token,
      invoice: signing.invoice,
      currency: signing.currency,
      language: signing.language,
      preferredInvoiceLanguage: signing.preferredInvoiceLanguage
    }
  });
};

export const signPublicInvoice = async (
  req: FastifyRequest<{
    Params: { token: string };
    Body: { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const signatureFile = req.body?.file;

  if (!signatureFile)
    throw new BadRequestError(i18n.t('error.user.unableToUploadSignature'));

  const signing = await getPublicInvoiceSigningFromDb(req.params.token);

  if (!signing) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  assertSigningLinkAvailable(signing.invoice, i18n);
  if (signing.invoice.recipientSignedAt)
    throw new BadRequestError(i18n.t('error.invoice.alreadySigned'));

  const signatureUrl = await uploadSignatureFile(
    signatureFile,
    i18n.t('error.user.unableToUploadSignature')
  );
  const invoice = await signInvoiceByRecipientTokenInDb({
    token: req.params.token,
    receiverSignature: signatureUrl
  });

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  if (invoice?.sender?.email) {
    const invoiceId = invoice.invoiceId || String(invoice.id);
    const locale =
      locales[signing.language as keyof typeof locales] || locales.en;
    const translations = locale.emails.invoice.signedNotification;
    const receiverName = invoice?.receiver?.name || translations.recipient;
    const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invoices/sign/${req.params.token}`;
    const notificationMessage = interpolateTranslation(translations.message, {
      receiverName,
      invoiceId
    });
    const subject = interpolateTranslation(translations.subject, {
      invoiceId
    });
    const reviewMessage = translations.review;

    await resend.emails
      .send({
        to: invoice.sender.email,
        from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
        subject,
        html: `
          <p>${escapeEmailHtml(notificationMessage)}</p>
          <p>${escapeEmailHtml(reviewMessage)}</p>
          <p><a href="${escapeEmailHtml(downloadLink)}">${escapeEmailHtml(downloadLink)}</a></p>
        `,
        text: [notificationMessage, '', reviewMessage, downloadLink].join('\n')
      })
      .catch((error) => {
        req.log.error(
          { error, invoiceId: invoice.id },
          'Unable to send invoice signed notification'
        );
      });
  }

  reply.status(200).send({
    invoice,
    message: i18n.t('success.invoice.signed')
  });
};
