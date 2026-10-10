import type { JournalExportQuery, JournalQuery } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  getJournalExpenseRowsFromDb,
  getJournalIncomeRowsFromDb,
  getJournalOwnerFromDb
} from '../database/journal';
import { recordRequestAudit } from '../utils/audit';
import { buildJournal, journalPeriod } from '../utils/journal';
import {
  buildJournalCsv,
  buildJournalXlsx,
  journalPeriodLabel
} from '../utils/journal-export';

const loadJournal = async (userId: number, { year, month }: JournalQuery) => {
  const period = journalPeriod(year, month);
  const range = { userId, from: period.from, to: period.to };
  const [incomeRows, expenseRows] = await Promise.all([
    getJournalIncomeRowsFromDb(range),
    getJournalExpenseRowsFromDb(range)
  ]);

  return { period, ...buildJournal(incomeRows, expenseRows) };
};

const CONTENT_TYPES = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
} as const;

export const getJournal = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: JournalQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const journal = await loadJournal(userId, req.query);

  reply.status(200).send(journal);
};

export const exportJournal = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: JournalExportQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { year, month, format } = req.query;
  const i18n = await useI18n(req);
  const [journal, owner] = await Promise.all([
    loadJournal(userId, { year, month }),
    getJournalOwnerFromDb(userId)
  ]);
  const periodLabel = journalPeriodLabel(journal.period);
  const input = {
    ...journal,
    owner,
    t: (key: string, values?: Record<string, string>) =>
      i18n.t(`journal.${key}`, values)
  };
  const file =
    format === 'xlsx' ? await buildJournalXlsx(input) : buildJournalCsv(input);
  const filename = `${i18n.t('journal.filename')}-${periodLabel}.${format}`;

  await recordRequestAudit({
    req,
    userId,
    action: 'report.journal_exported',
    entityType: 'report',
    entityId: periodLabel,
    newValue: { year, month: month ?? null, format, rowCount: journal.rows.length }
  });

  reply
    .header('Content-Type', CONTENT_TYPES[format])
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(file);
};
