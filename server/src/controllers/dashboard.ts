import { DashboardSummaryQuery } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  getDraftCountFromDb,
  getExpensesByMonthFromDb,
  getExpensesMissingDocumentsCountFromDb,
  getInvoicedTotalFromDb,
  getOpenInvoicesFromDb,
  getReceivedIncomeByMonthFromDb
} from '../database/dashboard';
import { todayInLithuania } from '../database/invoice-payment';
import {
  buildMonthlySummary,
  calculateSafeToSpend,
  summarizeOpenInvoices
} from '../utils/dashboard';
import { loadJournal } from './journal';
import { loadTaxEstimate } from './tax';

export const getDashboardSummary = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Querystring: DashboardSummaryQuery;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const today = todayInLithuania();
  const year = req.query.year ?? Number(today.slice(0, 4));

  const [
    incomeRows,
    expenseRows,
    invoiced,
    openInvoices,
    draftCount,
    expensesMissingDocuments,
    journal
  ] = await Promise.all([
    getReceivedIncomeByMonthFromDb(userId, year),
    getExpensesByMonthFromDb(userId, year),
    getInvoicedTotalFromDb(userId, year),
    getOpenInvoicesFromDb(userId),
    getDraftCountFromDb(userId),
    getExpensesMissingDocumentsCountFromDb(userId, year),
    loadJournal(userId, { year })
  ]);

  const { monthly, receivedIncome, expenses, deductibleExpenses } =
    buildMonthlySummary(incomeRows, expenseRows);
  const {
    outstanding,
    overdue,
    overdueCount,
    overdueWithoutEmail,
    overdueInvoices
  } = summarizeOpenInvoices(openInvoices, today);
  const estimate = await loadTaxEstimate(
    userId,
    year,
    async () => journal.totals
  );

  reply.status(200).send({
    year,
    totals: {
      receivedIncome,
      invoiced,
      outstanding,
      overdue,
      expenses,
      deductibleExpenses
    },
    monthly,
    overdueInvoices,
    overdueCount,
    attention: { draftCount, expensesMissingDocuments, overdueWithoutEmail },
    safeToSpend: calculateSafeToSpend({
      receivedIncome,
      vatCollected: journal.totals.incomeVat,
      expenses,
      estimate
    })
  });
};
