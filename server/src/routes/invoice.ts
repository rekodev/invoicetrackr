import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  createRecipientDetailsRequestOptions,
  deleteInvoiceOptions,
  getIncomeJournalOptions,
  getInvoiceOptions,
  getInvoicesOptions,
  getInvoicesRevenueOptions,
  getInvoicesTotalAmountOptions,
  getLatestInvoicesOptions,
  getNextInvoiceNumberOptions,
  getPublicInvoiceOptions,
  getPublicInvoiceSigningOptions,
  getRecipientDetailsRequestOptions,
  issueInvoiceOptions,
  postInvoiceOptions,
  regenerateInvoiceSigningOptions,
  regeneratePublicInvoiceOptions,
  revokeInvoiceSigningOptions,
  revokePublicInvoiceOptions,
  sendInvoiceEmailOptions,
  signPublicInvoiceOptions,
  submitRecipientDetailsOptions,
  updateInvoiceOptions,
  updateInvoiceStatusOptions
} from '../options/invoice';

const invoiceRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/invoices', getInvoicesOptions);

  fastify.get(
    '/api/:userId/invoices/income-journal.csv',
    getIncomeJournalOptions
  );

  fastify.get('/api/:userId/invoices/next-number', getNextInvoiceNumberOptions);

  fastify.get('/api/:userId/invoices/:id', getInvoiceOptions);

  fastify.post('/api/:userId/invoices', postInvoiceOptions);

  fastify.post('/api/:userId/invoices/:id/issue', issueInvoiceOptions);

  fastify.post(
    '/api/:userId/invoices/:id/recipient-details-request',
    createRecipientDetailsRequestOptions
  );

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

  fastify.post(
    '/api/:userId/invoices/:id/public-link/revoke',
    revokePublicInvoiceOptions
  );

  fastify.post(
    '/api/:userId/invoices/:id/public-link/regenerate',
    regeneratePublicInvoiceOptions
  );

  fastify.post(
    '/api/:userId/invoices/:id/signing-link/revoke',
    revokeInvoiceSigningOptions
  );

  fastify.post(
    '/api/:userId/invoices/:id/signing-link/regenerate',
    regenerateInvoiceSigningOptions
  );

  fastify.get('/api/invoices/sign/:token', getPublicInvoiceSigningOptions);

  fastify.post('/api/invoices/sign/:token', signPublicInvoiceOptions);

  fastify.get('/api/invoices/public/:token', getPublicInvoiceOptions);

  fastify.get(
    '/api/invoices/details/:token',
    getRecipientDetailsRequestOptions
  );
  fastify.put('/api/invoices/details/:token', submitRecipientDetailsOptions);

  done();
};

export default invoiceRoutes;
