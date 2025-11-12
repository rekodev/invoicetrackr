import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { postContactMessageOptions } from '../options/contact';

const contactRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.post('/api/contact', postContactMessageOptions);

  done();
};

export default contactRoutes;
