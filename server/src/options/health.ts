import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { getHealth } from '../controllers/health';

export const getHealthOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ status: z.literal('ok') }),
      503: z.object({ status: z.literal('unavailable') })
    }
  },
  handler: getHealth
};
