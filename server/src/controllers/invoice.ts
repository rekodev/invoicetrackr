import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  deleteInvoiceFromDb,
  findInvoiceById,
  findInvoiceByInvoiceId,
  getClientsFromDb,
  getInvoiceFromDb,
  getInvoicesFromDb,
  getInvoicesRevenueFromDb,
  getInvoicesTotalAmountFromDb,
  getLatestInvoicesFromDb,
  insertInvoiceInDb,
  updateInvoiceInDb
} from '../database';
import { InvoiceModel } from '../types/models';
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError
} from '../utils/errors';

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoices = await getInvoicesFromDb(userId);

  reply.status(200).send(invoices);
};

export const getInvoice = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) throw new NotFoundError('Invoice not found');

  reply.status(200).send({ invoice });
};

export const postInvoice = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: InvoiceModel & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoiceData = req.body;
  const signatureFile = req.body.file;

  let uploadedSignature: UploadApiResponse;

  if (signatureFile) {
    const fileBuffer = await signatureFile.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError('Unable to upload signature');
  }

  const foundInvoice = await findInvoiceByInvoiceId(
    userId,
    invoiceData.invoiceId
  );

  if (foundInvoice)
    throw new AlreadyExistsError(
      'Invoice with provided invoice ID already exists'
    );

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : invoiceData.senderSignature;

  const insertedInvoice = await insertInvoiceInDb(
    invoiceData,
    userId,
    signatureUrl
  );

  if (!insertedInvoice) throw new BadRequestError('Unable to add invoice');

  reply.status(200).send({
    invoice: insertedInvoice,
    message: 'Invoice added successfully'
  });
};

export const updateInvoice = async (
  req: FastifyRequest<{
    Params: { userId: number; id: number };
    Body: InvoiceModel & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const invoiceData = req.body;
  const signatureFile = req.body.file;

  let uploadedSignature: UploadApiResponse;

  if (signatureFile) {
    const fileBuffer = await signatureFile.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError('Unable to upload signature');
  }

  const foundInvoice = await findInvoiceById(userId, invoiceData.id);

  if (!foundInvoice) throw new NotFoundError('Invoice not found');

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : invoiceData.senderSignature;

  const updatedInvoice = await updateInvoiceInDb(
    userId,
    id,
    invoiceData,
    signatureUrl
  );

  if (!updatedInvoice) throw new BadRequestError('Unable to update invoice');

  reply.status(200).send({
    invoice: updatedInvoice,
    message: 'Invoice updated successfully'
  });
};

export const deleteInvoice = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const deletedInvoice = await deleteInvoiceFromDb(userId, id);

  if (!deletedInvoice) throw new BadRequestError('Unable to delete invoice');

  reply.status(200).send({ message: 'Invoice deleted successfully' });
};

export const getInvoicesTotalAmount = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoices = await getInvoicesTotalAmountFromDb(userId);
  const clients = await getClientsFromDb(userId);

  if (!invoices.length)
    throw new BadRequestError('Unable to retrieve invoice data');

  reply.status(200).send({ invoices, totalClients: clients.length });
};

export const getInvoicesRevenue = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoices = await getInvoicesRevenueFromDb(userId);

  if (!invoices.length)
    throw new BadRequestError('Unable to retrieve invoice data');

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
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoices = await getLatestInvoicesFromDb(userId);

  if (!invoices.length)
    throw new BadRequestError('Unable to retrieve invoices');

  reply.status(200).send({ invoices });
};
