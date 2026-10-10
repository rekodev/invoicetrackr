import fastifyCookie from '@fastify/cookie';
import ExcelJS from 'exceljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as journalDb from '../../database/journal';
import { exportJournalOptions, getJournalOptions } from '../../options/journal';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { mockLocalizedI18n } from '../../test/i18n';
import { mockCreateAuditEvent } from '../../test/setup';

vi.mock('../../database/journal');

const createApp = ({ withAuth = false } = {}) =>
  createTestApp((fastifyApp) => {
    if (withAuth) fastifyApp.register(fastifyCookie);
    const preHandler = withAuth
      ? getJournalOptions.preHandler
      : mockAuthMiddleware;
    fastifyApp.get('/api/:userId/journal', { ...getJournalOptions, preHandler });
    fastifyApp.get('/api/:userId/journal/export', {
      ...exportJournalOptions,
      preHandler
    });
  });

describe('Journal Controller', () => {
  beforeEach(() => {
    mockLocalizedI18n();
    vi.mocked(journalDb.getJournalIncomeRowsFromDb).mockResolvedValue([
      {
        paymentId: 3,
        paymentDate: '2026-03-10',
        invoiceId: 10,
        documentNumber: 'SF001',
        receiverName: 'MB Šaltinis',
        receiverBusinessNumber: '305000000',
        descriptions: 'Svetainės kūrimas',
        receivedAmount: '60.50',
        paidBefore: '60.50',
        vatAmount: '21.00',
        totalAmount: '121.00'
      }
    ]);
    vi.mocked(journalDb.getJournalExpenseRowsFromDb).mockResolvedValue([
      {
        expenseId: 20,
        expenseDate: '2026-03-05',
        documentNumber: null,
        supplier: 'Telia',
        description: 'Internetas',
        eurAmount: '40.00',
        businessUsePercentage: '50.00',
        deductibleAmount: '20.00'
      }
    ]);
    vi.mocked(journalDb.getJournalOwnerFromDb).mockResolvedValue({
      legalName: 'Artūras Žemaitis',
      activityCertificateNumber: '1093657'
    });
  });

  it('returns linked journal rows and reconciled totals for a month', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/journal?year=2026&month=3'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      period: { year: 2026, month: 3, from: '2026-03-01', to: '2026-03-31' },
      rows: [
        {
          kind: 'expense',
          date: '2026-03-05',
          documentNumber: null,
          counterparty: 'Telia',
          description: 'Internetas',
          expenseId: 20,
          amount: '20.00',
          totalEurAmount: '40.00',
          businessUsePercentage: '50.00'
        },
        {
          kind: 'income',
          date: '2026-03-10',
          documentNumber: 'SF001',
          counterparty: 'MB Šaltinis',
          counterpartyCode: '305000000',
          description: 'Svetainės kūrimas',
          invoiceId: 10,
          paymentId: 3,
          amount: '60.50',
          vatAmount: '10.50',
          netAmount: '50.00'
        }
      ],
      totals: {
        income: '60.50',
        incomeVat: '10.50',
        incomeNet: '50.00',
        expenses: '20.00',
        net: '30.00'
      }
    });
    const range = { userId: 1, from: '2026-03-01', to: '2026-03-31' };
    expect(journalDb.getJournalIncomeRowsFromDb).toHaveBeenCalledWith(range);
    expect(journalDb.getJournalExpenseRowsFromDb).toHaveBeenCalledWith(range);
    expect(mockCreateAuditEvent).not.toHaveBeenCalled();

    await app.close();
  });

  it.each([
    ['/api/1/journal'],
    ['/api/1/journal?year=1999'],
    ['/api/1/journal?year=2026&month=13'],
    ['/api/1/journal/export?year=2026&format=pdf']
  ])('rejects invalid query %s', async (url) => {
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url });

    expect(response.statusCode).toBe(400);
    expect(journalDb.getJournalIncomeRowsFromDb).not.toHaveBeenCalled();

    await app.close();
  });

  it('exports a Lithuanian CSV with audit trail and localized filename', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/journal/export?year=2026&month=3&format=csv',
      headers: { 'accept-language': 'lt' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="pajamu-islaidu-zurnalas-2026-03.csv"'
    );
    expect(response.body).toContain('\uFEFF"Eil. Nr.","Data (YYYY-MM-DD)"');
    expect(response.body).toContain('"Veiklai 50% iš 40.00 €"');
    expect(response.body).toContain('"IŠ VISO:","","","","60.50","10.50","50.00","","20.00",""');
    expect(mockCreateAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        action: 'report.journal_exported',
        entityType: 'report',
        entityId: '2026-03',
        newValue: { year: 2026, month: 3, format: 'csv', rowCount: 2 }
      })
    );

    await app.close();
  });

  it('exports an English XLSX workbook for the whole year', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/journal/export?year=2026&format=xlsx',
      headers: { 'accept-language': 'en' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="income-expense-journal-2026.xlsx"'
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Uint8Array.from(response.rawPayload).buffer);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['2026', 'Summary']);
    expect(workbook.worksheets[0].getCell('A1').value).toBe(
      'INCOME AND EXPENSE JOURNAL — 2026'
    );
    expect(journalDb.getJournalIncomeRowsFromDb).toHaveBeenCalledWith({
      userId: 1,
      from: '2026-01-01',
      to: '2026-12-31'
    });

    await app.close();
  });

  it('requires a session before exporting', async () => {
    const app = await createApp({ withAuth: true });
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/journal/export?year=2026&format=csv'
    });

    expect(response.statusCode).toBe(401);
    expect(journalDb.getJournalIncomeRowsFromDb).not.toHaveBeenCalled();

    await app.close();
  });
});
