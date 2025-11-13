import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  deleteInvoiceOptions,
  getInvoiceOptions,
  getInvoicesOptions,
  getInvoicesRevenueOptions,
  getInvoicesTotalAmountOptions,
  getLatestInvoicesOptions,
  postInvoiceOptions,
  sendInvoiceEmailOptions,
  updateInvoiceOptions,
  updateInvoiceStatusOptions
} from '../options/invoice';

const invoiceRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/invoices', getInvoicesOptions);

  fastify.get('/api/:userId/invoices/:id', getInvoiceOptions);

  fastify.post('/api/:userId/invoices', postInvoiceOptions);

  fastify.put('/api/:userId/invoices/:id', updateInvoiceOptions);

  fastify.put('/api/:userId/invoices/:id/status', updateInvoiceStatusOptions);

  fastify.delete('/api/:userId/invoices/:id', deleteInvoiceOptions);

  fastify.get(
    '/api/:userId/invoices/total-amount',
    getInvoicesTotalAmountOptions
  );

  fastify.get('/api/:userId/invoices/revenue', getInvoicesRevenueOptions);

  fastify.get('/api/:userId/invoices/latest', getLatestInvoicesOptions);

  fastify.post('/api/:userId/invoices/:id/send-email', sendInvoiceEmailOptions);

  done();
};

export default invoiceRoutes;
