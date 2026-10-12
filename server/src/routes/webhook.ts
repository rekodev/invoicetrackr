import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { resendWebhookOptions } from '../options/webhook';
import { BadRequestError } from '../utils/error';

const webhookRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.removeContentTypeParser('application/json');
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, parsed) => {
      req.rawBody = body as string;

      try {
        parsed(null, JSON.parse(body as string));
      } catch {
        parsed(new BadRequestError('Invalid JSON body'), undefined);
      }
    }
  );

  fastify.post('/api/webhook/resend', resendWebhookOptions);

  done();
};

export default webhookRoutes;
