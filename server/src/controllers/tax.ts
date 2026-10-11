import type { TaxEstimateQuery, TaxProfileBody } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { getTaxProfileFromDb, upsertTaxProfileInDb } from '../database/tax';
import { recordRequestAudit } from '../utils/audit';
import {
  activeMonths,
  calculateTaxEstimate,
  summarizeTaxRules
} from '../utils/tax';
import { SUPPORTED_TAX_YEARS, TAX_RULES } from '../utils/tax-rules';
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
  const rules = TAX_RULES[year];
  const base = { year, supportedYears: SUPPORTED_TAX_YEARS };

  if (!rules) {
    return reply.status(200).send({ ...base, status: 'unsupported_year' });
  }

  const profile = await getTaxProfileFromDb(userId, year);

  if (!profile) {
    return reply.status(200).send({ ...base, status: 'needs_profile' });
  }

  const { totals } = await loadJournal(userId, { year });
  const inputs = {
    income: totals.incomeNet,
    actualExpenses: totals.expenses,
    activeMonths: activeMonths(
      year,
      profile.activityStartDate,
      profile.activityEndDate
    )
  };

  reply.status(200).send({
    ...base,
    status: 'ready',
    profile,
    activeMonths: inputs.activeMonths,
    ...calculateTaxEstimate(inputs, profile, rules),
    rules: summarizeTaxRules(rules)
  });
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
  const profile = await upsertTaxProfileInDb({ userId, year, profile: req.body });

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
