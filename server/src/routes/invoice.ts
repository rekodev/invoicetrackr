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
} from '../options/invoice';

const invoiceRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/invoices', getInvoicesOptions);

  fastify.get('/api/invoices/:id', getInvoiceOptions);

  fastify.post('/api/invoices', postInvoiceOptions);

  fastify.put('/api/invoices/:id', updateInvoiceOptions);

  fastify.delete('/api/invoices/:id', deleteInvoiceOptions);

  done();
};

export default invoiceRoutes;
