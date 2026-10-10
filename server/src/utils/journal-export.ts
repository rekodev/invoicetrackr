import type {
  JournalPeriod,
  JournalRow,
  JournalTotals
} from '@invoicetrackr/types';
import ExcelJS from 'exceljs';

import { buildJournalMonths } from './journal';

export type JournalTranslate = (
  key: string,
  values?: Record<string, string>
) => string;

export type JournalExportInput = {
  period: JournalPeriod;
  rows: JournalRow[];
  totals: JournalTotals;
  owner: { legalName: string; activityCertificateNumber: string };
  t: JournalTranslate;
};

const COLUMN_KEYS = [
  'index',
  'date',
  'documentNumber',
  'incomeDescription',
  'income',
  'vat',
  'incomeNet',
  'expenseDescription',
  'expenses',
  'notes'
] as const;

type ColumnKey = (typeof COLUMN_KEYS)[number];
type TableLine = Partial<Record<ColumnKey, string | number | null>>;

const MONEY_KEYS = new Set<ColumnKey>(['income', 'vat', 'incomeNet', 'expenses']);

const SUMMARY_KEYS = [
  'month',
  'income',
  'vat',
  'incomeNet',
  'expenses',
  'net'
] as const;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const toSafeCsvText = (value: string) =>
  FORMULA_PREFIX.test(value) ? `'${value}` : value;

const joinDescription = (counterparty: string, description: string) =>
  [counterparty, description].filter(Boolean).join(' — ');

export const journalPeriodLabel = ({
  year,
  month
}: Pick<JournalPeriod, 'year' | 'month'>) =>
  month ? `${year}-${String(month).padStart(2, '0')}` : String(year);

const toTableRow = (
  row: JournalRow,
  index: number,
  t: JournalTranslate
): TableLine => {
  const shared = {
    index: index + 1,
    date: row.date,
    documentNumber: row.documentNumber ?? ''
  };

  if (row.kind === 'income') {
    const counterparty = row.counterpartyCode
      ? `${row.counterparty} (${row.counterpartyCode})`
      : row.counterparty;

    return {
      ...shared,
      incomeDescription: joinDescription(counterparty, row.description),
      income: row.amount,
      vat: row.vatAmount,
      incomeNet: row.netAmount
    };
  }

  return {
    ...shared,
    expenseDescription: joinDescription(row.counterparty, row.description),
    expenses: row.amount,
    notes:
      Number(row.businessUsePercentage) < 100
        ? t('businessUseNote', {
            percentage: String(Number(row.businessUsePercentage)),
            total: row.totalEurAmount
          })
        : ''
  };
};

const totalsRow = (t: JournalTranslate, totals: JournalTotals): TableLine => ({
  index: t('total'),
  income: totals.income,
  vat: totals.incomeVat,
  incomeNet: totals.incomeNet,
  expenses: totals.expenses
});

const netRow = (t: JournalTranslate, totals: JournalTotals): TableLine => ({
  index: t('netResult'),
  incomeNet: totals.net
});

const quoteCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const buildJournalCsv = ({ rows, totals, t }: JournalExportInput) => {
  const lines = [
    ...rows.map((row, index) => toTableRow(row, index, t)),
    totalsRow(t, totals),
    netRow(t, totals)
  ];
  const header = COLUMN_KEYS.map((key) => quoteCsv(t(`columns.${key}`)));
  const body = lines.map((line) =>
    COLUMN_KEYS.map((key) => {
      const value = String(line[key] ?? '');
      return quoteCsv(
        typeof line[key] === 'string' && !MONEY_KEYS.has(key)
          ? toSafeCsvText(value)
          : value
      );
    }).join(',')
  );

  return `\uFEFF${[header.join(','), ...body].join('\r\n')}\r\n`;
};

const MONEY_FORMAT = '#,##0.00';
const DATE_FORMAT = 'yyyy-mm-dd';

const COLUMN_WIDTHS: Record<ColumnKey, number> = {
  index: 8,
  date: 12,
  documentNumber: 14,
  incomeDescription: 40,
  income: 14,
  vat: 12,
  incomeNet: 14,
  expenseDescription: 40,
  expenses: 14,
  notes: 30
};

const toExcelDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toExcelValues = (line: TableLine) =>
  Object.fromEntries(
    Object.entries(line).map(([key, value]) => [
      key,
      MONEY_KEYS.has(key as ColumnKey) && value !== null ? Number(value) : value
    ])
  );

const addJournalSheet = (
  workbook: ExcelJS.Workbook,
  { period, rows, totals, owner, t }: JournalExportInput
) => {
  const periodLabel = journalPeriodLabel(period);
  const sheet = workbook.addWorksheet(periodLabel);

  sheet.columns = COLUMN_KEYS.map((key) => ({
    key,
    width: COLUMN_WIDTHS[key],
    style: MONEY_KEYS.has(key) ? { numFmt: MONEY_FORMAT } : {}
  }));

  const title = sheet.getRow(1);
  title.getCell(1).value = t('title', { period: periodLabel });
  title.font = { bold: true, size: 14 };
  sheet.mergeCells(1, 1, 1, COLUMN_KEYS.length);

  const ownerRow = sheet.getRow(2);
  ownerRow.getCell(1).value = t('ownerName');
  ownerRow.getCell(3).value = owner.legalName;
  ownerRow.getCell(5).value = t('certificateNumber');
  ownerRow.getCell(8).value = owner.activityCertificateNumber;
  ownerRow.font = { bold: true };

  const header = sheet.getRow(4);
  COLUMN_KEYS.forEach((key, index) => {
    const cell = header.getCell(index + 1);
    cell.value = t(`columns.${key}`);
    cell.alignment = { wrapText: true, vertical: 'middle' };
  });
  header.font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 4 }];

  rows.forEach((row, index) => {
    const values = toExcelValues(toTableRow(row, index, t));
    const excelRow = sheet.addRow({ ...values, date: toExcelDate(row.date) });
    excelRow.getCell('date').numFmt = DATE_FORMAT;
  });

  [totalsRow(t, totals), netRow(t, totals)].forEach((line) => {
    const excelRow = sheet.addRow(toExcelValues(line));
    excelRow.font = { bold: true };
    sheet.mergeCells(excelRow.number, 1, excelRow.number, 4);
  });
};

const addSummarySheet = (
  workbook: ExcelJS.Workbook,
  { period, rows, totals, t }: JournalExportInput
) => {
  const sheet = workbook.addWorksheet(t('summarySheet'));

  sheet.columns = SUMMARY_KEYS.map((key) => ({
    key,
    header: t(`summaryColumns.${key}`),
    width: key === 'month' ? 12 : 18,
    style: key === 'month' ? {} : { numFmt: MONEY_FORMAT }
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const toSummaryRow = (month: string, values: JournalTotals) => ({
    month,
    income: Number(values.income),
    vat: Number(values.incomeVat),
    incomeNet: Number(values.incomeNet),
    expenses: Number(values.expenses),
    net: Number(values.net)
  });

  buildJournalMonths(rows, period).forEach(({ month, ...values }) => {
    sheet.addRow(
      toSummaryRow(journalPeriodLabel({ year: period.year, month }), values)
    );
  });

  sheet.addRow(toSummaryRow(t('total'), totals)).font = { bold: true };
};

export const buildJournalXlsx = async (input: JournalExportInput) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'InvoiceTrackr';

  addJournalSheet(workbook, input);
  addSummarySheet(workbook, input);

  return Buffer.from(await workbook.xlsx.writeBuffer());
};
