import { FastifyRequest } from 'fastify';

import { ForbiddenError } from '../utils/error';
import { getBillingStatusFromDb } from '../database/payment';

export const requirePaidEntitlement = async (
  req: FastifyRequest<{ Params: { userId?: string } }>
) => {
  const userId = Number(req.params.userId);
  const billing = await getBillingStatusFromDb(userId);

  if (!billing?.hasPaidAccess) {
    throw new ForbiddenError('A paid subscription or active trial is required');
  }
};
