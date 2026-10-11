import ExcelJS from 'exceljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as annualDb from '../../database/annual-package';
import * as dashboardDb from '../../database/dashboard';
import * as journalDb from '../../database/journal';
import * as taxDb from '../../database/tax';
import {
  exportAnnualPackageOptions,
  getAnnualPackageOptions
} from '../../options/annual-package';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { mockLocalizedI18n } from '../../test/i18n';
import { mockCreateAuditEvent } from '../../test/setup';

vi.mock('../../database/annual-package');
vi.mock('../../database/dashboard');
vi.mock('../../database/journal');
vi.mock('../../database/tax');
vi.mock('../../database/invoice-payment', () => ({
  todayInLithuania: () => '2026-10-07'
}));

const createApp = () =>
  createTestApp((fastifyApp) => {
    fastifyApp.get('/api/:userId/annual-package', {
      ...getAnnualPackageOptions,
      preHandler: mockAuthMiddleware
    });
    fastifyApp.get('/api/:userId/annual-package/export', {
      ...exportAnnualPackageOptions,
      preHandler: mockAuthMiddleware
    });
  });

const sheetValues = (sheet: ExcelJS.Worksheet) =>
  sheet.getSheetValues().filter(Boolean) as unknown[][];

describe('Annual Package Controller', () => {
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
        receivedAmount: '100.00',
        paidBefore: '0',
        vatAmount: '17.36',
        totalAmount: '100.00',
        method: 'bank_transfer',
        bankReference: 'SF001'
      }
    ]);
    vi.mocked(journalDb.getJournalExpenseRowsFromDb).mockResolvedValue([
      {
        expenseId: 20,
        expenseDate: '2026-03-05',
        paymentDate: null,
        documentNumber: null,
        supplier: 'Telia',
        description: 'Internetas',
        category: 'telecommunications',
        currency: 'eur',
        totalAmount: '40.00',
        eurAmount: '40.00',
        vatAmount: null,
        businessUsePercentage: '50.00',
        deductibleAmount: '20.00',
        paymentMethod: 'card'
      }
    ]);
    vi.mocked(journalDb.getJournalOwnerFromDb).mockResolvedValue({
      legalName: 'Artūras Žemaitis',
      activityCertificateNumber: ''
    });
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue({
      expenseMethod: 'thirty_percent',
      hasEmploymentPsdCoverage: true,
      hasAdditionalPensionAccumulation: false,
      activityStartDate: null,
      activityEndDate: null,
      otherDeclaredIncome: '0.00'
    });
    vi.mocked(annualDb.getAnnualInvoicesFromDb).mockResolvedValue([
      {
        id: 10,
        invoiceNumber: 'SF001',
        date: '2026-03-01',
        dueDate: '2026-03-31',
        clientName: 'MB Šaltinis',
        clientCode: '305000000',
        lifecycleStatus: 'issued',
        status: 'pending',
        vatAmount: '34.71',
        totalAmount: '200.00',
        paidAmount: '100.00'
      },
      {
        id: 11,
        invoiceNumber: 'SF002',
        date: '2026-04-01',
        dueDate: '2026-04-30',
        clientName: 'UAB Klaida',
        clientCode: '',
        lifecycleStatus: 'voided',
        status: 'canceled',
        vatAmount: '0.00',
        totalAmount: '50.00',
        paidAmount: '0.00'
      }
    ]);
    vi.mocked(annualDb.getExpenseDocumentCountsFromDb).mockResolvedValue([]);
    vi.mocked(dashboardDb.getDraftCountFromDb).mockResolvedValue(1);
  });

  it('returns reconciled totals with blocking problems and recommendations', async () => {
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/1/annual-package?year=2026' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      year: 2026,
      asOf: '2026-10-07',
      isComplete: false,
      summary: {
        income: '100.00',
        incomeVat: '17.36',
        incomeNet: '82.64',
        expenses: '20.00',
        net: '62.64',
        invoiced: '200.00',
        outstanding: '100.00',
        expenseMethod: 'thirty_percent',
        taxTotal: '13.04'
      },
      warnings: [
        { code: 'year_in_progress', severity: 'blocking' },
        { code: 'missing_owner_details', severity: 'blocking' },
        { code: 'draft_invoices', severity: 'recommendation', count: 1 },
        { code: 'outstanding_invoices', severity: 'recommendation', count: 1 },
        { code: 'expenses_missing_documents', severity: 'recommendation', count: 1 }
      ]
    });
    expect(annualDb.getAnnualInvoicesFromDb).toHaveBeenCalledWith({
      userId: 1,
      from: '2026-01-01',
      to: '2026-12-31'
    });
    expect(dashboardDb.getDraftCountFromDb).toHaveBeenCalledWith(1, {
      from: '2026-01-01',
      to: '2026-12-31'
    });
    expect(journalDb.getJournalIncomeRowsFromDb).toHaveBeenCalledTimes(1);
    expect(journalDb.getJournalExpenseRowsFromDb).toHaveBeenCalledTimes(1);
    expect(mockCreateAuditEvent).not.toHaveBeenCalled();

    const invalid = await app.inject({ method: 'GET', url: '/api/1/annual-package?year=last' });
    expect(invalid.statusCode).toBe(400);

    await app.close();
  });

  it('exports a Lithuanian workbook marked incomplete whose sheets reconcile with the summary', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/annual-package/export?year=2026',
      headers: { 'accept-language': 'lt' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="metine-ataskaita-2026.xlsx"'
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.rawPayload as unknown as ArrayBuffer);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Suvestinė',
      'Įspėjimai',
      'Žurnalas',
      'Mėnesiai',
      'Sąskaitos',
      'Mokėjimai',
      'Išlaidos'
    ]);

    const summary = sheetValues(workbook.getWorksheet('Suvestinė')!);
    const summaryValue = (label: string) =>
      summary.find((row) => row[1] === label)?.[2];
    expect(summary[0][1]).toBe('METINĖ MOKESČIŲ ATASKAITA — 2026');
    expect(summary.some((row) => String(row[1]).startsWith('NEBAIGTA'))).toBe(true);
    expect(summaryValue('Jūsų išlaidų metodas')).toBe('30 % pajamų');

    const totalRow = (name: string) => sheetValues(workbook.getWorksheet(name)!).at(-1)!;
    expect(totalRow('Mokėjimai')[5]).toBe(summaryValue('Gautos pajamos su PVM (€)'));
    expect(totalRow('Išlaidos')[13]).toBe(summaryValue('Atskaitomos išlaidos (€)'));
    expect(sheetValues(workbook.getWorksheet('Išlaidos')!)[1].slice(8, 10)).toEqual([40, 'EUR']);
    expect(totalRow('Sąskaitos')[8]).toBe(
      summaryValue('Išrašyta: šių metų datos išrašytos sąskaitos (€)')
    );
    expect(totalRow('Sąskaitos')[11]).toBe(100);
    const voidedInvoice = sheetValues(workbook.getWorksheet('Sąskaitos')!)[2];
    expect(voidedInvoice[2]).toBe('SF002');
    expect([8, 9, 10, 11].map((column) => voidedInvoice[column])).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ]);
    expect(sheetValues(workbook.getWorksheet('Įspėjimai')!)[1]).toEqual([
      undefined,
      'Blokuojanti',
      'Metai dar nesibaigė. Skaičiai apima įrašus iki parengimo datos.'
    ]);

    expect(mockCreateAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        action: 'report.annual_package_exported',
        entityType: 'report',
        entityId: '2026',
        newValue: {
          year: 2026,
          isComplete: false,
          warnings: [
            'year_in_progress',
            'missing_owner_details',
            'draft_invoices',
            'outstanding_invoices',
            'expenses_missing_documents'
          ]
        }
      })
    );

    await app.close();
  });
});
