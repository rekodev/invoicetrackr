import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  deleteExpenseAttachmentOptions,
  getExpenseAttachmentOptions,
  getExpenseAttachmentsOptions,
  postExpenseAttachmentOptions,
  replaceExpenseAttachmentOptions
} from '../options/expense';

const expenseRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get(
    '/api/:userId/expenses/:expenseId/attachments',
    getExpenseAttachmentsOptions
  );

  fastify.get(
    '/api/:userId/expenses/:expenseId/attachments/:attachmentId',
    getExpenseAttachmentOptions
  );

  fastify.post(
    '/api/:userId/expenses/:expenseId/attachments',
    postExpenseAttachmentOptions
  );

  fastify.put(
    '/api/:userId/expenses/:expenseId/attachments/:attachmentId',
    replaceExpenseAttachmentOptions
  );

  fastify.delete(
    '/api/:userId/expenses/:expenseId/attachments/:attachmentId',
    deleteExpenseAttachmentOptions
  );

  done();
};

export default expenseRoutes;
