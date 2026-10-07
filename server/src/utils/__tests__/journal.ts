import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';

import {
  buildJournal,
  buildJournalMonths,
  JournalExpenseDbRow,
  JournalIncomeDbRow,
  journalPeriod,
  paymentVatShare
} from '../journal';
import {
  buildJournalCsv,
  buildJournalXlsx,
  JournalExportInput,
  JournalExportLabels
} from '../journal-export';

const incomeRow = (
  overrides: Partial<JournalIncomeDbRow> = {}
): JournalIncomeDbRow => ({
  paymentId: 1,
  paymentDate: '2026-03-10',
  invoiceId: 10,
  documentNumber: 'SF001',
  receiverName: 'MB Šaltinis',
  receiverBusinessNumber: '305000000',
  descriptions: 'Svetainės kūrimas',
  receivedAmount: '121.00',
  paidBefore: '0',
  vatAmount: '21.00',
  totalAmount: '121.00',
  ...overrides
});

const expenseRow = (
  overrides: Partial<JournalExpenseDbRow> = {}
): JournalExpenseDbRow => ({
  expenseId: 20,
  expenseDate: '2026-03-05',
  documentNumber: 'EXP-1',
  supplier: 'Telia',
  description: 'Internetas',
  eurAmount: '40.00',
  businessUsePercentage: '50.00',
  deductibleAmount: '20.00',
  ...overrides
});

const labels: JournalExportLabels = {
  title: 'INCOME AND EXPENSE JOURNAL — 2026',
  ownerName: 'Name and surname',
  certificateNumber: 'Certificate No.',
  columns: {
    index: 'No.',
    date: 'Date',
    documentNumber: 'Document No.',
    incomeDescription: 'Income description',
    income: 'Income (€)',
    vat: 'VAT (€)',
    incomeNet: 'Income excl. VAT (€)',
    expenseDescription: 'Expense description',
    expenses: 'Expenses (€)',
    notes: 'Notes'
  },
  total: 'TOTAL:',
  netResult: 'NET RESULT:',
  summarySheet: 'Summary',
  summaryColumns: {
    month: 'Month',
    income: 'Income (€)',
    vat: 'VAT (€)',
    incomeNet: 'Income excl. VAT (€)',
    expenses: 'Expenses (€)',
    net: 'Net (€)'
  },
  businessUseNote: (percentage, total) => `Business use ${percentage}% of €${total}`
};

describe('journal', () => {
  it.each([
    [2026, undefined, '2026-01-01', '2026-12-31', null],
    [2026, 2, '2026-02-01', '2026-02-28', 2],
    [2024, 2, '2024-02-01', '2024-02-29', 2],
    [2026, 12, '2026-12-01', '2026-12-31', 12]
  ])('builds the period for %s month %s', (year, month, from, to, expectedMonth) => {
    expect(journalPeriod(year, month)).toEqual({
      year,
      month: expectedMonth,
      from,
      to
    });
  });

  it.each([
    ['full payment', '0', '121.00', '21.00'],
    ['first half', '0', '60.50', '10.50'],
    ['remaining half', '60.50', '60.50', '10.50'],
    ['first third', '0', '40.33', '7.00'],
    ['second third', '40.33', '40.33', '7.00'],
    ['last third settles the remainder', '80.66', '40.34', '7.00']
  ])('allocates VAT for a %s', (_case, paidBefore, receivedAmount, expected) => {
    const share = paymentVatShare({
      vatAmount: '21.00',
      totalAmount: '121.00',
      paidBefore,
      receivedAmount
    });

    expect(share).toBe(BigInt(Math.round(Number(expected) * 100)));
  });

  it('merges income and deductible expenses chronologically and nets income excl. VAT against expenses', () => {
    const { rows, totals } = buildJournal(
      [
        incomeRow(),
        incomeRow({
          paymentId: 2,
          paymentDate: '2026-04-02',
          invoiceId: 11,
          documentNumber: 'SF002',
          receiverBusinessNumber: null,
          receivedAmount: '50.00',
          vatAmount: '0.00',
          totalAmount: '100.00'
        })
      ],
      [
        expenseRow(),
        expenseRow({
          expenseId: 21,
          expenseDate: '2026-03-10',
          deductibleAmount: '15.50'
        })
      ]
    );

    expect(rows.map((row) => [row.kind, row.date, row.amount])).toEqual([
      ['expense', '2026-03-05', '20.00'],
      ['income', '2026-03-10', '121.00'],
      ['expense', '2026-03-10', '15.50'],
      ['income', '2026-04-02', '50.00']
    ]);
    expect(rows[1]).toMatchObject({
      invoiceId: 10,
      paymentId: 1,
      counterpartyCode: '305000000',
      vatAmount: '21.00',
      netAmount: '100.00'
    });
    expect(rows[3]).toMatchObject({ counterpartyCode: null, vatAmount: '0.00' });
    expect(totals).toEqual({
      income: '171.00',
      incomeVat: '21.00',
      incomeNet: '150.00',
      expenses: '35.50',
      net: '114.50'
    });

    const months = buildJournalMonths(rows, journalPeriod(2026));
    expect(months).toHaveLength(12);
    expect(months[2]).toMatchObject({ month: 3, income: '121.00', expenses: '35.50' });
    expect(months[3]).toMatchObject({ month: 4, income: '50.00', expenses: '0.00' });
  });

  it('reports a negative net result when expenses exceed income', () => {
    expect(buildJournal([], [expenseRow()]).totals.net).toBe('-20.00');
  });
});

describe('journal export', () => {
  const exportInput = (): JournalExportInput => {
    const { rows, totals } = buildJournal(
      [incomeRow()],
      [
        expenseRow(),
        expenseRow({
          expenseId: 21,
          supplier: '=HYPERLINK("http://evil")',
          description: 'Kanceliarinės prekės "A4"',
          businessUsePercentage: '100.00',
          deductibleAmount: '12.30'
        })
      ]
    );

    return {
      period: journalPeriod(2026),
      rows,
      totals,
      owner: { legalName: 'Artūras Žemaitis', activityCertificateNumber: '1093657' },
      labels
    };
  };

  it('writes a BOM-prefixed CSV with escaped, formula-safe cells and reconciling totals', () => {
    const csv = buildJournalCsv(exportInput());
    const lines = csv.split('\r\n');

    expect(csv.startsWith('﻿"No.","Date","Document No."')).toBe(true);
    expect(lines[1]).toBe(
      '"1","2026-03-05","EXP-1","","","","","Telia — Internetas","20.00","Business use 50% of €40.00"'
    );
    expect(lines[2]).toBe(
      '"2","2026-03-05","EXP-1","","","","","\'=HYPERLINK(""http://evil"") — Kanceliarinės prekės ""A4""","12.30",""'
    );
    expect(lines[3]).toBe(
      '"3","2026-03-10","SF001","MB Šaltinis (305000000) — Svetainės kūrimas","121.00","21.00","100.00","","",""'
    );
    expect(lines[4]).toBe('"TOTAL:","","","","121.00","21.00","100.00","","32.30",""');
    expect(lines[5]).toBe('"NET RESULT:","","","","","","67.70","","",""');
    expect(lines[6]).toBe('');
  });

  it('writes an XLSX workbook with typed date and money cells plus a monthly summary', async () => {
    const buffer = await buildJournalXlsx(exportInput());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Uint8Array.from(buffer).buffer);

    const [journal, summary] = workbook.worksheets;
    expect(journal.name).toBe('2026');
    expect(journal.getCell('A1').value).toBe(labels.title);
    expect(journal.getCell('C2').value).toBe('Artūras Žemaitis');
    expect(journal.getCell('H2').value).toBe('1093657');
    expect(journal.getRow(4).getCell(4).value).toBe('Income description');

    const income = journal.getRow(7);
    expect(income.getCell(2).value).toEqual(new Date(Date.UTC(2026, 2, 10)));
    expect(income.getCell(2).numFmt).toBe('yyyy-mm-dd');
    expect(income.getCell(5).value).toBe(121);
    expect(income.getCell(5).numFmt).toBe('#,##0.00');
    expect(journal.getRow(6).getCell(8).value).toBe(
      '=HYPERLINK("http://evil") — Kanceliarinės prekės "A4"'
    );

    expect(journal.getRow(8).getCell(1).value).toBe('TOTAL:');
    expect(journal.getRow(8).getCell(9).value).toBe(32.3);
    expect(journal.getRow(9).getCell(7).value).toBe(67.7);

    expect(summary.name).toBe('Summary');
    expect(summary.getRow(4).values).toEqual([undefined, '2026-03', 121, 21, 100, 32.3, 67.7]);
    expect(summary.getRow(14).getCell(1).value).toBe('TOTAL:');
    expect(summary.getRow(14).getCell(6).value).toBe(67.7);
  });
});
