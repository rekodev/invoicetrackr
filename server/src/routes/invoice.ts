import {
  getInvoicesOptions,
  getInvoiceOptions,
  postInvoiceOptions,
  updateInvoiceOptions,
  deleteInvoiceOptions,
} from '../options/invoice';

const invoiceRoutes = (fastify, _options, done) => {
  fastify.get('/api/invoices', getInvoicesOptions);

  fastify.get('/api/invoices/:id', getInvoiceOptions);

  fastify.post('/api/invoices', postInvoiceOptions);

  fastify.put('/api/invoices/:id', updateInvoiceOptions);

  fastify.delete('/api/invoices/:id', deleteInvoiceOptions);

  done();
};

export default invoiceRoutes;
