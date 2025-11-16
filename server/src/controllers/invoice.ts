import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { InvoiceBody } from '@invoicetrackr/types';
import { InvoiceEmail } from '@invoicetrackr/emails';
import { MultipartFile } from '@fastify/multipart';
import { render } from '@react-email/render';
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
  getInvoiceFromDb,
  getInvoicesFromDb,
  getInvoicesRevenueFromDb,
  getInvoicesTotalAmountFromDb,
  getLatestInvoicesFromDb,
  insertInvoiceInDb,
  updateInvoiceInDb,
  updateInvoiceStatusInDb
} from '../database/invoice';
import { getClientsFromDb } from '../database/client';
import { getUserFromDb } from '../database/user';
import { resend } from '../config/resend';

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoices = await getInvoicesFromDb(userId);

  reply.status(200).send({ invoices });
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

export const postInvoice = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: InvoiceBody & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const invoiceData = req.body;
  const signatureFile = req.body.file;
  const i18n = await useI18n(req);

  let uploadedSignature: UploadApiResponse | undefined;

  if (signatureFile) {
    const fileBuffer = await signatureFile.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError(i18n.t('error.user.unableToUploadSignature'));
  }

  const foundInvoice = await findInvoiceByInvoiceId(
    userId,
    invoiceData.invoiceId
  );

  if (foundInvoice)
    throw new AlreadyExistsError(i18n.t('error.invoice.alreadyExists'));

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : invoiceData.senderSignature;

  const insertedInvoice = await insertInvoiceInDb(
    invoiceData,
    userId,
    signatureUrl
  );

  if (!insertedInvoice)
    throw new BadRequestError(i18n.t('error.invoice.unableToCreate'));

  reply.status(200).send({
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
  const signatureFile = req.body.file;
  const i18n = await useI18n(req);

  const foundInvoice = await findInvoiceById(userId, Number(invoiceData.id));

  if (!foundInvoice) throw new NotFoundError(i18n.t('error.invoice.notFound'));

  let uploadedSignature: UploadApiResponse | undefined;

  if (signatureFile) {
    const fileBuffer = await signatureFile.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError(i18n.t('error.user.unableToUploadSignature'));
  }

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : invoiceData.senderSignature;

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

  if (!invoices.length)
    throw new BadRequestError(i18n.t('error.invoice.unableToRetrieveData'));

  reply.status(200).send({ invoices, totalClients: clients.length });
};

export const getInvoicesRevenue = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const invoices = await getInvoicesRevenueFromDb(userId);

  if (!invoices.length)
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

  if (!invoices.length)
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

  const attachment = file
    ? await file.toBuffer().then((buffer) => buffer.toString('base64'))
    : undefined;

  const htmlContent = await render(
    InvoiceEmail({
      invoiceNumber: invoice.invoiceId,
      amount: `${invoice.totalAmount} ${user.currency}`,
      dueDate: invoice.dueDate,
      senderName: user.name || user.email,
      message: message || i18n.t('emails.invoice.defaultMessage'),
      translations: {
        title: i18n.t('emails.invoice.title'),
        subtitle: i18n.t('emails.invoice.subtitle'),
        detailsTitle: i18n.t('emails.invoice.detailsTitle'),
        invoiceNumber: i18n.t('emails.invoice.invoiceNumber'),
        amount: i18n.t('emails.invoice.amount'),
        dueDate: i18n.t('emails.invoice.dueDate'),
        from: i18n.t('emails.invoice.from'),
        attachmentTitle: i18n.t('emails.invoice.attachmentTitle'),
        attachmentMessage: i18n.t('emails.invoice.attachmentMessage'),
        footer: i18n.t('emails.invoice.footer'),
        copyright: i18n.t('emails.invoice.copyright', {
          year: new Date().getFullYear()
        })
      }
    })
  );

  const { error } = await resend.emails.send({
    to: recipientEmail,
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    replyTo: user.email,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        content: attachment,
        filename: file?.filename
      }
    ]
  });

  if (error)
    throw new BadRequestError(i18n.t('error.invoice.unableToSendEmail'));

  reply.status(200).send({ message: i18n.t('success.invoice.emailSent') });
};
