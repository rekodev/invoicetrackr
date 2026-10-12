import { FastifyReply, FastifyRequest } from 'fastify';

import { pingDb } from '../database/db';

export const getHealth = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await pingDb();
  } catch (error) {
    req.log.error({ err: error }, 'Health check database ping failed');
    return reply.status(503).send({ status: 'unavailable' });
  }

  return reply.status(200).send({ status: 'ok' });
};
