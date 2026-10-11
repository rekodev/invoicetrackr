import type { AnnualPackageQuery } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  getAnnualDraftCountFromDb,
  getAnnualExpensesFromDb,
  getAnnualInvoicesFromDb,
  getAnnualPaymentsFromDb
} from '../database/annual-package';
import { todayInLithuania } from '../database/invoice-payment';
import { getJournalOwnerFromDb } from '../database/journal';
import { getTaxProfileFromDb } from '../database/tax';
import {
  buildAnnualInvoices,
  buildAnnualSummary,
  buildAnnualWarnings,
  isAnnualPackageComplete
} from '../utils/annual-package';
import { buildAnnualPackageXlsx } from '../utils/annual-package-export';
import { recordRequestAudit } from '../utils/audit';
import { journalPeriod } from '../utils/journal';
import { estimateTaxes } from '../utils/tax';
import { loadJournal } from './journal';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const loadAnnualPackage = async (userId: number, year: number) => {
  const { from, to } = journalPeriod(year);
  const range = { userId, from, to };
  const [journal, owner, profile, invoiceRows, payments, expenses, draftCount] =
    await Promise.all([
      loadJournal(userId, { year }),
      getJournalOwnerFromDb(userId),
      getTaxProfileFromDb(userId, year),
      getAnnualInvoicesFromDb(range),
      getAnnualPaymentsFromDb(range),
      getAnnualExpensesFromDb(range),
      getAnnualDraftCountFromDb(range)
    ]);
  const asOf = todayInLithuania();
  const estimate = estimateTaxes(year, profile, journal.totals);
  const invoices = buildAnnualInvoices(invoiceRows);
  const warnings = buildAnnualWarnings({
    year,
    today: asOf,
    owner,
    estimate,
    draftCount,
    invoices,
    expenses
  });

  return {
    year,
    asOf,
    isComplete: isAnnualPackageComplete(warnings),
    summary: buildAnnualSummary({ totals: journal.totals, invoices, estimate }),
    warnings,
    estimate,
    journal,
    owner,
    invoices,
    payments,
    expenses
  };
};

export const getAnnualPackage = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: AnnualPackageQuery;
  }>,
  reply: FastifyReply
) => {
  const { year, asOf, isComplete, summary, warnings } = await loadAnnualPackage(
    Number(req.params.userId),
    req.query.year
  );

  reply.status(200).send({ year, asOf, isComplete, summary, warnings });
};

export const exportAnnualPackage = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: AnnualPackageQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { year } = req.query;
  const i18n = await useI18n(req);
  const annualPackage = await loadAnnualPackage(userId, year);
  const file = await buildAnnualPackageXlsx({
    ...annualPackage,
    t: (key, values) => i18n.t(`annualPackage.${key}`, values),
    tJournal: (key, values) => i18n.t(`journal.${key}`, values)
  });
  const filename = `${i18n.t('annualPackage.filename')}-${year}.xlsx`;

  await recordRequestAudit({
    req,
    userId,
    action: 'report.annual_package_exported',
    entityType: 'report',
    entityId: String(year),
    newValue: {
      year,
      isComplete: annualPackage.isComplete,
      warnings: annualPackage.warnings.map((warning) => warning.code)
    }
  });

  reply
    .header('Content-Type', XLSX_CONTENT_TYPE)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(file);
};
