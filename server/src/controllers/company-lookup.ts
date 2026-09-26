import type { CompanyLookupRequest } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { vmiCompanyLookupProvider } from '../services/company-lookup/vmi';
import { InternalServerError } from '../utils/error';

export const searchCompanyLookups = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: CompanyLookupRequest;
  }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);

  try {
    const results = await vmiCompanyLookupProvider.search(req.body.query);
    reply.status(200).send({ results });
  } catch {
    throw new InternalServerError(i18n.t('error.companyLookup.unavailable'));
  }
};
