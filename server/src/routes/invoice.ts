import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  getInvoicesOptions,
  getInvoiceOptions,
  postInvoiceOptions,
  updateInvoiceOptions,
  deleteInvoiceOptions,
  getInvoicesTotalAmountOptions,
} from '../options';

const invoiceRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/invoices', getInvoicesOptions);

  fastify.get('/api/:userId/invoices/:id', getInvoiceOptions);

  fastify.post('/api/:userId/invoices', postInvoiceOptions);

  fastify.put('/api/:userId/invoices/:id', updateInvoiceOptions);

  fastify.delete('/api/:userId/invoices/:id', deleteInvoiceOptions);

  fastify.get(
    '/api/:userId/invoices/total-amount',
    getInvoicesTotalAmountOptions
  );

  done();
};

export default invoiceRoutes;
