import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';
import { File } from 'fastify-multer/lib/interfaces';
import {
  deleteInvoiceFromDb,
  findInvoiceById,
  findInvoiceByInvoiceId,
  getInvoiceFromDb,
  getInvoicesFromDb,
  insertInvoiceInDb,
  updateInvoiceInDb,
} from '../database';
import { InvoiceDto } from '../types/dtos';
import { InvoiceModel } from '../types/models';
import { transformInvoiceDto } from '../types/transformers';

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const invoices = await getInvoicesFromDb(userId);
  reply.send(
    invoices.map((invoice) => transformInvoiceDto(invoice as InvoiceDto))
  );
};

export const getInvoice = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const invoice = await getInvoiceFromDb(userId, id);

  if (!invoice) reply.status(404).send({ message: 'Invoice not found' });

  reply.send(transformInvoiceDto(invoice));
};

export const postInvoice = async (
  req: FastifyRequest<{ Params: { userId: number }; Body: InvoiceModel }> & {
    file: File;
  },
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const invoiceData = req.body;
  const signatureFile = req.file;

  let uploadedSignature: UploadApiResponse;

  if (signatureFile) {
    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${signatureFile.buffer.toString(
        'base64'
      )}`
    );

    if (!uploadedSignature)
      return reply.status(400).send({ message: 'Unable to upload signature' });
  }

  const foundInvoice = await findInvoiceByInvoiceId(
    userId,
    invoiceData.invoiceId
  );

  if (foundInvoice)
    return reply
      .status(403)
      .send({ message: 'Invoice with provided invoice ID already exists' });

  const insertedInvoice = await insertInvoiceInDb(
    invoiceData,
    uploadedSignature ? uploadedSignature.url : invoiceData.senderSignature
  );

  if (!insertedInvoice)
    return reply.status(400).send({ message: 'Unable to add invoice' });

  reply.send({
    invoice: transformInvoiceDto(insertedInvoice),
    message: 'Invoice added successfully',
  });
};

export const updateInvoice = async (
  req: FastifyRequest<{
    Params: { userId: number; id: number };
    Body: InvoiceModel;
  }> & { file: File },
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const invoiceData = req.body;
  const signatureFile = req.file;

  let uploadedSignature: UploadApiResponse;

  if (signatureFile) {
    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${signatureFile.buffer.toString(
        'base64'
      )}`
    );

    if (!uploadedSignature)
      return reply.status(400).send({ message: 'Unable to upload signature' });
  }

  const foundInvoice = await findInvoiceById(userId, invoiceData.id);

  if (!foundInvoice)
    return reply.status(404).send({ message: 'Invoice not found' });

  const updatedInvoice = await updateInvoiceInDb(
    userId,
    id,
    invoiceData,
    signatureFile ? uploadedSignature.url : invoiceData.senderSignature
  );

  if (!updatedInvoice)
    return reply.status(400).send({ message: 'Unable to update invoice' });

  reply.send({
    invoice: transformInvoiceDto(updatedInvoice),
    message: 'Invoice updated successfully',
  });
};

export const deleteInvoice = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const deletedInvoice = await deleteInvoiceFromDb(userId, id);

  if (!deletedInvoice)
    return reply.status(400).send({ message: 'Unable to delete invoice' });

  reply.send({ message: 'Invoice deleted successfully' });
};
