import type { TaxEstimateQuery, TaxProfileBody } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { getTaxProfileFromDb, upsertTaxProfileInDb } from '../database/tax';
import { recordRequestAudit } from '../utils/audit';
import { estimateTaxes } from '../utils/tax';
import { TAX_RULES } from '../utils/tax-rules';
import { loadJournal } from './journal';

export const getTaxEstimate = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: TaxEstimateQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { year } = req.query;
  const profile = TAX_RULES[year]
    ? await getTaxProfileFromDb(userId, year)
    : null;
  const journal = profile ? await loadJournal(userId, { year }) : null;

  reply.status(200).send(estimateTaxes(year, profile, journal?.totals ?? null));
};

export const saveTaxProfile = async (
  req: FastifyRequest<{
    Params: { userId: string; year: number };
    Body: TaxProfileBody;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { year } = req.params;
  const i18n = await useI18n(req);
  const previous = await getTaxProfileFromDb(userId, year);
  const profile = await upsertTaxProfileInDb({
    userId,
    year,
    profile: req.body
  });

  await recordRequestAudit({
    req,
    userId,
    action: 'tax_profile.updated',
    entityType: 'tax_profile',
    entityId: year,
    previousValue: previous,
    newValue: profile
  });

  reply.status(200).send({ message: i18n.t('success.taxProfile.saved') });
};
