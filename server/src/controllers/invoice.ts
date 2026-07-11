import {
  DEFAULT_CURRENCY,
  type IncomeJournalQuery,
  type InvoiceBody,
  type PublicInvoice,
  invoiceBodySchema
} from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  InvoiceEmail,
  InvoiceSignedNotificationEmail
} from '@invoicetrackr/emails';
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
  type InvoiceFromDb,
  deleteInvoiceFromDb,
  findInvoiceByInvoiceId,
  getIncomeJournalRowsFromDb,
  getInvoiceFromDb,
  getInvoicesFromDb,
  getInvoicesRevenueFromDb,
  getInvoicesTotalAmountFromDb,
  getLatestInvoicesFromDb,
  getNextInvoiceNumberFromDb,
  getPublicInvoiceFromDb,
  getPublicInvoiceSigningFromDb,
  insertInvoiceInDb,
  markPublicInvoiceSentInDb,
  prepareInvoiceSigningFromDb,
  preparePublicInvoiceFromDb,
  regenerateInvoiceSigningFromDb,
  regeneratePublicInvoiceFromDb,
  revokeInvoiceSigningFromDb,
  revokePublicInvoiceFromDb,
  signInvoiceByRecipientTokenInDb,
  updateInvoiceInDb,
  updateInvoiceStatusInDb
} from '../database/invoice';
import { appEmailFrom, getAppUrl } from '../config/app';
import { analyticsEvents } from '../analytics/events';
import { captureAnalyticsEventForUser } from '../analytics/posthog';
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

const escapeCsvValue = (value: string | null | undefined) =>
  `"${String(value || '').replace(/"/g, '""')}"`;

const formatCsvDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : '';

const UNSIGNED_SIGNING_LINK_VALIDITY_DAYS = 30;
const SIGNED_SIGNING_LINK_VALIDITY_DAYS = 90;
const PUBLIC_INVOICE_LINK_VALIDITY_DAYS = 90;
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
const createPublicInvoiceExpiration = () =>
  new Date(
    Date.now() + PUBLIC_INVOICE_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
const isSigningLinkExpired = (expiresAt?: string | null) =>
  Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
const isPublicInvoiceLinkExpired = (expiresAt?: string | null) =>
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

const assertPublicInvoiceLinkAvailable = (
  invoice: Pick<
    InvoiceBody,
    'publicInvoiceRevokedAt' | 'publicInvoiceExpiresAt'
  >,
  i18n: Awaited<ReturnType<typeof useI18n>>
) => {
  if (invoice.publicInvoiceRevokedAt)
    throw new BadRequestError(i18n.t('error.invoice.publicLinkRevoked'));
  if (isPublicInvoiceLinkExpired(invoice.publicInvoiceExpiresAt))
    throw new BadRequestError(i18n.t('error.invoice.publicLinkExpired'));
};

const isInvoicePayable = (invoice: InvoiceBody) =>
  invoice.status === 'pending' &&
  (invoice.lifecycleStatus || 'draft') !== 'voided' &&
  !invoice.publicInvoiceRevokedAt &&
  !isPublicInvoiceLinkExpired(invoice.publicInvoiceExpiresAt);

const getManualPaymentReference = (invoice: InvoiceBody) =>
  invoice.manualPaymentReference?.trim() ||
  invoice.invoiceId ||
  String(invoice.id || '');

const resolvePublicInvoicePayment = ({
  invoice,
  token
}: {
  invoice: InvoiceBody;
  token: string;
}) => {
  const configuredMode = invoice.paymentMode || 'manual';
  const canShowPayment =
    token === invoice.publicInvoiceToken && isInvoicePayable(invoice);
  const hasManualPaymentDetails = Boolean(
    invoice.bankingInformation?.name &&
      invoice.bankingInformation.code &&
      invoice.bankingInformation.accountNumber
  );
  const resolvedMode =
    !canShowPayment ||
    configuredMode === 'disabled' ||
    !hasManualPaymentDetails
      ? 'disabled'
      : configuredMode === 'manual'
        ? 'manual'
        : 'disabled';

  return {
    configuredMode,
    resolvedMode,
    available: false,
    provider: null,
    manualReference: getManualPaymentReference(invoice)
  } as const;
};

const toInvoiceBody = (invoice: InvoiceFromDb): InvoiceBody => {
  if (!invoice.sender || !invoice.receiver || !invoice.services?.length)
    throw new Error('Invoice is missing required public response data');

  return invoiceBodySchema.parse({
    ...invoice,
    sender: invoice.sender,
    receiver: invoice.receiver,
    bankingInformation: invoice.bankingInformation?.name
      ? invoice.bankingInformation
      : undefined,
    services: invoice.services.map((service) => ({
      ...service,
      amount: Number(service.amount),
      quantity: Number(service.quantity),
      vatRate:
        service.vatRate === null || service.vatRate === undefined
          ? undefined
          : Number(service.vatRate)
    }))
  });
};

const buildPublicInvoicePayload = async ({
  token,
  publicInvoice
}: {
  token: string;
  publicInvoice: Awaited<ReturnType<typeof getPublicInvoiceFromDb>>;
}): Promise<PublicInvoice> => {
  if (!publicInvoice) throw new Error('Public invoice not found');

  const invoice = toInvoiceBody(publicInvoice.invoice);
  const isSigningToken = token === invoice.recipientSigningToken;
  const signingRequested = Boolean(
    (invoice.recipientSigningRequestedAt &&
      !invoice.recipientSigningRevokedAt) ||
      isSigningToken
  );
  const signingSigned = Boolean(
    invoice.receiverSignature || invoice.recipientSignedAt
  );
  const signingAvailable =
    signingRequested &&
    !signingSigned &&
    !invoice.recipientSigningRevokedAt &&
    !isSigningLinkExpired(invoice.recipientSigningExpiresAt);
  const payment = resolvePublicInvoicePayment({
    invoice,
    token
  });

  return {
    token,
    invoice,
    currency: publicInvoice.currency,
    language: publicInvoice.language,
    preferredInvoiceLanguage: publicInvoice.preferredInvoiceLanguage,
    payment: {
      configuredMode: payment.configuredMode,
      resolvedMode: payment.resolvedMode,
      provider: payment.provider,
      available: payment.available,
      manualReference: payment.manualReference
    },
    signing: {
      requested: signingRequested,
      signed: signingSigned,
      available: signingAvailable
    }
  };
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
  const currency =
    rows.at(0)?.currency?.toUpperCase() || DEFAULT_CURRENCY.toUpperCase();
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

  await captureAnalyticsEventForUser({
    userId,
    event: analyticsEvents.invoiceCreated,
    properties: {
      invoice_status: insertedInvoice.status,
      line_count: insertedInvoice.services?.length,
      has_custom_vat: insertedInvoice.services?.some(
        ({ vatRate }) => vatRate !== undefined && vatRate !== null
      )
    }
  });

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

  const foundInvoice = await getInvoiceFromDb(userId, id);

  if (!foundInvoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if ((foundInvoice.lifecycleStatus || 'draft') === 'voided')
    throw new BadRequestError(i18n.t('error.invoice.voidedImmutable'));
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
      includePublicLink?: boolean;
      requestSignature?: boolean;
      file?: MultipartFile;
    };
  }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const {
    recipientEmail,
    subject,
    message,
    includePublicLink = true,
    file
  } = req.body;
  const requestSignature = includePublicLink && !!req.body.requestSignature;
  const i18n = await useI18n(req);

  const [invoice, user] = await Promise.all([
    getInvoiceFromDb(userId, id),
    getUserFromDb(userId)
  ]);

  if (!user) throw new NotFoundError(i18n.t('error.user.notFound'));
  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  let publicInvoiceToken =
    invoice.publicInvoiceToken || randomBytes(32).toString('hex');
  let signingToken =
    invoice.recipientSigningToken || randomBytes(32).toString('hex');

  if (includePublicLink) {
    const publicInvoiceExpiresAt = createPublicInvoiceExpiration();
    const shouldRotatePublicLink = Boolean(
      invoice.publicInvoiceToken &&
        (invoice.publicInvoiceRevokedAt ||
          isPublicInvoiceLinkExpired(invoice.publicInvoiceExpiresAt))
    );
    const preparedPublicInvoice = shouldRotatePublicLink
      ? await regeneratePublicInvoiceFromDb({
          userId,
          id,
          token: randomBytes(32).toString('hex'),
          expiresAt: publicInvoiceExpiresAt
        })
      : await preparePublicInvoiceFromDb({
          userId,
          id,
          token: publicInvoiceToken,
          expiresAt: publicInvoiceExpiresAt
        });

    if (!preparedPublicInvoice?.publicInvoiceToken)
      throw new BadRequestError(
        i18n.t('error.invoice.unableToCreatePublicLink')
      );

    publicInvoiceToken = preparedPublicInvoice.publicInvoiceToken;
  }

  if (requestSignature) {
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
        expiresAt: createSigningLinkExpiration(
          Boolean(invoice.recipientSignedAt)
        )
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
  }

  const publicInvoiceLink = includePublicLink
    ? getAppUrl(`/invoices/public/${publicInvoiceToken}`)
    : undefined;

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
      publicInvoiceTitle: i18n.t('emails.invoice.publicInvoiceTitle'),
      publicInvoiceMessage: i18n.t('emails.invoice.publicInvoiceMessage'),
      publicInvoiceButton: i18n.t('emails.invoice.publicInvoiceButton'),
      footer: i18n.t('emails.invoice.footer'),
      copyright: i18n.t('emails.invoice.copyright', {
        year: new Date().getFullYear()
      })
    },
    publicInvoiceLink,
    isSigningAvailable: requestSignature && !invoice.recipientSignedAt
  });

  const { error } = await resend.emails.send({
    to: recipientEmail,
    from: appEmailFrom,
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

  await markPublicInvoiceSentInDb({ userId, id, requestSignature });

  if (
    !requestSignature &&
    invoice.recipientSigningToken &&
    !invoice.recipientSignedAt
  ) {
    await revokeInvoiceSigningFromDb({ userId, id });
  }

  await captureAnalyticsEventForUser({
    userId,
    event: analyticsEvents.invoiceEmailed,
    properties: {
      include_public_link: includePublicLink,
      request_signature: requestSignature,
      has_attachment: Boolean(attachment)
    }
  });

  reply.status(200).send({ message: i18n.t('success.invoice.emailSent') });
};

export const revokePublicInvoice = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if ((invoice.lifecycleStatus || 'draft') !== 'issued')
    throw new BadRequestError(i18n.t('error.invoice.publicLinkRequiresIssued'));
  if (!invoice.publicInvoiceToken)
    throw new BadRequestError(i18n.t('error.invoice.unableToCreatePublicLink'));

  const revoked = await revokePublicInvoiceFromDb({
    userId,
    id
  });

  if (!revoked) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  reply
    .status(200)
    .send({ message: i18n.t('success.invoice.publicLinkRevoked') });
};

export const regeneratePublicInvoice = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if ((invoice.lifecycleStatus || 'draft') !== 'issued')
    throw new BadRequestError(i18n.t('error.invoice.publicLinkRequiresIssued'));

  const regenerated = await regeneratePublicInvoiceFromDb({
    userId,
    id,
    token: randomBytes(32).toString('hex'),
    expiresAt: createPublicInvoiceExpiration()
  });

  if (!regenerated?.publicInvoiceToken)
    throw new BadRequestError(i18n.t('error.invoice.unableToCreatePublicLink'));

  reply.status(200).send({
    publicInvoiceToken: regenerated.publicInvoiceToken,
    publicInvoiceExpiresAt: regenerated.publicInvoiceExpiresAt,
    message: i18n.t('success.invoice.publicLinkRegenerated')
  });
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
      invoice: toInvoiceBody(signing.invoice),
      currency: signing.currency,
      language: signing.language,
      preferredInvoiceLanguage: signing.preferredInvoiceLanguage
    }
  });
};

export const getPublicInvoice = async (
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const publicInvoice = await getPublicInvoiceFromDb(req.params.token);

  if (!publicInvoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  if (req.params.token === publicInvoice.invoice.publicInvoiceToken) {
    assertPublicInvoiceLinkAvailable(publicInvoice.invoice, i18n);
  } else {
    assertSigningLinkAvailable(publicInvoice.invoice, i18n);
  }

  reply.status(200).send({
    publicInvoice: await buildPublicInvoicePayload({
      token: req.params.token,
      publicInvoice
    })
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

  const signing = await getPublicInvoiceFromDb(req.params.token);

  if (!signing) throw new NotFoundError(i18n.t('error.invoice.notFound'));
  if (req.params.token === signing.invoice.publicInvoiceToken) {
    assertPublicInvoiceLinkAvailable(signing.invoice, i18n);
  }
  assertSigningLinkAvailable(signing.invoice, i18n);
  if (!signing.invoice.recipientSigningToken)
    throw new BadRequestError(
      i18n.t('error.invoice.unableToCreateSigningLink')
    );
  if (
    req.params.token !== signing.invoice.recipientSigningToken &&
    !signing.invoice.recipientSigningRequestedAt
  )
    throw new BadRequestError(
      i18n.t('error.invoice.unableToCreateSigningLink')
    );
  if (signing.invoice.recipientSignedAt)
    throw new BadRequestError(i18n.t('error.invoice.alreadySigned'));

  const signatureUrl = await uploadSignatureFile(
    signatureFile,
    i18n.t('error.user.unableToUploadSignature')
  );
  const invoice = await signInvoiceByRecipientTokenInDb({
    token: signing.invoice.recipientSigningToken,
    receiverSignature: signatureUrl
  });

  if (!invoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  if (invoice?.sender?.email) {
    const invoiceId = invoice.invoiceId || String(invoice.id);
    const locale =
      locales[signing.language as keyof typeof locales] || locales.en;
    const translations = locale.emails.invoice.signedNotification;
    const receiverName = invoice?.receiver?.name || translations.recipient;
    const downloadLink = getAppUrl(`/invoices/public/${req.params.token}`);
    const notificationMessage = interpolateTranslation(translations.message, {
      receiverName,
      invoiceId
    });
    const subject = interpolateTranslation(translations.subject, {
      invoiceId
    });
    const reviewMessage = translations.review;
    const emailHtml = InvoiceSignedNotificationEmail({
      subject,
      message: notificationMessage,
      reviewMessage,
      buttonText: translations.reviewButton,
      invoiceUrl: downloadLink,
      footer: locale.emails.invoice.footer,
      copyright: `© ${new Date().getFullYear()} ${locale.emails.invoice.copyright}`
    });

    await resend.emails
      .send({
        to: invoice.sender.email,
        from: appEmailFrom,
        subject,
        react: emailHtml,
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
