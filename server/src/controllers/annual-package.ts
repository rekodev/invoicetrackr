import type { AnnualPackageQuery } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  getAnnualInvoicesFromDb,
  getExpenseDocumentCountsFromDb
} from '../database/annual-package';
import { getDraftCountFromDb } from '../database/dashboard';
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
import { buildJournal, journalPeriod } from '../utils/journal';
import { estimateTaxes } from '../utils/tax';
import { CONTENT_TYPES, loadJournalRecords } from './journal';

const loadAnnualPackage = async (userId: number, year: number) => {
  const { from, to } = journalPeriod(year);
  const [
    { period, incomeRows, expenseRows },
    owner,
    profile,
    invoiceRows,
    draftCount,
    documentCounts
  ] = await Promise.all([
    loadJournalRecords(userId, { year }),
    getJournalOwnerFromDb(userId),
    getTaxProfileFromDb(userId, year),
    getAnnualInvoicesFromDb({ userId, from, to }),
    getDraftCountFromDb(userId, { from, to }),
    getExpenseDocumentCountsFromDb({ userId, from, to })
  ]);
  const documentsByExpense = new Map(
    documentCounts.map((row) => [row.expenseId, row.documentCount])
  );
  const expenses = expenseRows.map((row) => ({
    ...row,
    documentCount: documentsByExpense.get(row.expenseId) ?? 0
  }));
  const journal = { period, ...buildJournal(incomeRows, expenseRows) };
  const asOf = todayInLithuania();
  const balanceDate = asOf < to ? asOf : to;
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
    balanceDate,
    isComplete: isAnnualPackageComplete(warnings),
    summary: buildAnnualSummary({ totals: journal.totals, invoices, estimate }),
    warnings,
    estimate,
    journal,
    owner,
    invoices,
    payments: incomeRows,
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
  const { year, asOf, isComplete, summary, warnings, estimate } =
    await loadAnnualPackage(Number(req.params.userId), req.query.year);

  reply.status(200).send({ year, asOf, isComplete, summary, warnings, estimate });
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
    .header('Content-Type', CONTENT_TYPES.xlsx)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(file);
};
