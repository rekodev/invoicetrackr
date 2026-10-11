import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as dashboardDb from '../../database/dashboard';
import * as journalDb from '../../database/journal';
import * as taxDb from '../../database/tax';
import { getDashboardSummaryOptions } from '../../options/dashboard';
import { createTestApp, mockAuthMiddleware } from '../../test/app';

vi.mock('../../database/dashboard');
vi.mock('../../database/journal');
vi.mock('../../database/tax');
vi.mock('../../database/invoice-payment', () => ({
  todayInLithuania: () => '2026-10-07'
}));

const createApp = () =>
  createTestApp((fastifyApp) => {
    fastifyApp.get('/api/:userId/dashboard/summary', {
      ...getDashboardSummaryOptions,
      preHandler: mockAuthMiddleware
    });
  });

describe('Dashboard Controller', () => {
  beforeEach(() => {
    vi.mocked(dashboardDb.getReceivedIncomeByMonthFromDb).mockResolvedValue([
      { month: 5, amount: '40.00' },
      { month: 6, amount: '60.00' }
    ]);
    vi.mocked(dashboardDb.getExpensesByMonthFromDb).mockResolvedValue([
      { month: 6, total: '25.00', deductible: '12.50' }
    ]);
    vi.mocked(dashboardDb.getInvoicedTotalFromDb).mockResolvedValue('300.00');
    vi.mocked(dashboardDb.getOpenInvoicesFromDb).mockResolvedValue([
      {
        id: 7,
        invoiceId: 'INV007',
        clientName: 'Late Client',
        clientEmail: 'late@example.com',
        totalAmount: '200.00',
        paidAmount: '50.00',
        dueDate: '2026-09-30'
      },
      {
        id: 8,
        invoiceId: 'INV008',
        clientName: 'Future Client',
        clientEmail: 'future@example.com',
        totalAmount: '50.00',
        paidAmount: '0.00',
        dueDate: '2026-11-01'
      }
    ]);
    vi.mocked(dashboardDb.getDraftCountFromDb).mockResolvedValue(2);
    vi.mocked(dashboardDb.getExpensesMissingDocumentsCountFromDb).mockResolvedValue(1);
    vi.mocked(journalDb.getJournalIncomeRowsFromDb).mockResolvedValue([
      {
        paymentId: 1,
        paymentDate: '2026-05-10',
        invoiceId: 10,
        documentNumber: 'SF001',
        receiverName: 'MB Šaltinis',
        receiverBusinessNumber: '',
        descriptions: 'Konsultacijos',
        receivedAmount: '100.00',
        paidBefore: '0',
        vatAmount: '17.36',
        totalAmount: '100.00'
      }
    ]);
    vi.mocked(journalDb.getJournalExpenseRowsFromDb).mockResolvedValue([]);
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue(null);
  });

  it('returns the current Vilnius year summary with reconciled totals and overdue actions', async () => {
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/1/dashboard/summary' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({
      year: 2026,
      totals: {
        receivedIncome: '100.00',
        invoiced: '300.00',
        outstanding: '200.00',
        overdue: '150.00',
        expenses: '25.00',
        deductibleExpenses: '12.50'
      },
      overdueCount: 1,
      overdueInvoices: [
        {
          id: 7,
          invoiceId: 'INV007',
          clientName: 'Late Client',
          clientEmail: 'late@example.com',
          totalAmount: '200.00',
          outstandingAmount: '150.00',
          dueDate: '2026-09-30',
          daysOverdue: 7
        }
      ],
      attention: { draftCount: 2, expensesMissingDocuments: 1, overdueWithoutEmail: 0 },
      safeToSpend: {
        status: 'needs_profile',
        receivedIncome: '100.00',
        vatCollected: '17.36',
        expenses: '25.00'
      }
    });
    expect(body.monthly).toHaveLength(12);
    expect(body.monthly[4]).toEqual({ month: 5, receivedIncome: '40.00', expenses: '0.00', deductibleExpenses: '0.00' });
    expect(dashboardDb.getReceivedIncomeByMonthFromDb).toHaveBeenCalledWith(1, 2026);
    expect(dashboardDb.getOpenInvoicesFromDb).toHaveBeenCalledWith(1);

    await app.close();
  });

  it('uses a requested year and rejects an invalid one', async () => {
    const app = await createApp();

    const previousYear = await app.inject({ method: 'GET', url: '/api/1/dashboard/summary?year=2025' });
    expect(previousYear.statusCode).toBe(200);
    expect(previousYear.json()).toMatchObject({
      year: 2025,
      safeToSpend: { status: 'unsupported_year' }
    });
    expect(dashboardDb.getExpensesByMonthFromDb).toHaveBeenCalledWith(1, 2025);

    vi.mocked(dashboardDb.getInvoicedTotalFromDb).mockClear();
    const invalid = await app.inject({ method: 'GET', url: '/api/1/dashboard/summary?year=last' });
    expect(invalid.statusCode).toBe(400);
    expect(dashboardDb.getInvoicedTotalFromDb).not.toHaveBeenCalled();

    await app.close();
  });

  it('reserves the saved method\'s tax estimate', async () => {
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue({
      expenseMethod: 'thirty_percent',
      hasEmploymentPsdCoverage: true,
      hasAdditionalPensionAccumulation: false,
      activityStartDate: null,
      activityEndDate: null,
      otherDeclaredIncome: '0.00'
    });
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/1/dashboard/summary' });

    expect(response.statusCode).toBe(200);
    expect(response.json().safeToSpend).toEqual({
      status: 'ready',
      receivedIncome: '100.00',
      vatCollected: '17.36',
      expenses: '25.00',
      expenseMethod: 'thirty_percent',
      taxReserve: '13.04',
      safeToSpend: '44.60',
      shortfall: '0.00'
    });

    await app.close();
  });
});
