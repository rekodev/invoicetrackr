import type {
  JournalPeriod,
  JournalRow,
  JournalTotals
} from '@invoicetrackr/types';
import ExcelJS from 'exceljs';

import { buildJournalMonths } from './journal';

export type JournalExportLabels = {
  title: string;
  ownerName: string;
  certificateNumber: string;
  columns: {
    index: string;
    date: string;
    documentNumber: string;
    incomeDescription: string;
    income: string;
    vat: string;
    incomeNet: string;
    expenseDescription: string;
    expenses: string;
    notes: string;
  };
  total: string;
  netResult: string;
  summarySheet: string;
  summaryColumns: {
    month: string;
    income: string;
    vat: string;
    incomeNet: string;
    expenses: string;
    net: string;
  };
  businessUseNote: (percentage: string, totalAmount: string) => string;
};

export type JournalExportInput = {
  period: JournalPeriod;
  rows: JournalRow[];
  totals: JournalTotals;
  owner: { legalName: string; activityCertificateNumber: string };
  labels: JournalExportLabels;
};

type Cell = string | number | Date | null;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const toSafeCsvText = (value: string) =>
  FORMULA_PREFIX.test(value) ? `'${value}` : value;

const joinDescription = (counterparty: string, description: string) =>
  [counterparty, description].filter(Boolean).join(' — ');

const formatPercentage = (value: string) => String(Number(value));

export const journalPeriodLabel = ({ year, month }: JournalPeriod) =>
  month ? `${year}-${String(month).padStart(2, '0')}` : String(year);

const toTableRow = (
  row: JournalRow,
  index: number,
  labels: JournalExportLabels
) => {
  if (row.kind === 'income') {
    const counterparty = row.counterpartyCode
      ? `${row.counterparty} (${row.counterpartyCode})`
      : row.counterparty;

    return {
      index: index + 1,
      date: row.date,
      documentNumber: row.documentNumber ?? '',
      incomeDescription: joinDescription(counterparty, row.description),
      income: row.amount,
      vat: row.vatAmount,
      incomeNet: row.netAmount,
      expenseDescription: '',
      expenses: null,
      notes: ''
    };
  }

  const isPartialBusinessUse = Number(row.businessUsePercentage) < 100;

  return {
    index: index + 1,
    date: row.date,
    documentNumber: row.documentNumber ?? '',
    incomeDescription: '',
    income: null,
    vat: null,
    incomeNet: null,
    expenseDescription: joinDescription(row.counterparty, row.description),
    expenses: row.amount,
    notes: isPartialBusinessUse
      ? labels.businessUseNote(
          formatPercentage(row.businessUsePercentage),
          row.totalEurAmount
        )
      : ''
  };
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

const MONEY_KEYS = new Set(['income', 'vat', 'incomeNet', 'expenses']);

const totalsRow = (labels: JournalExportLabels, totals: JournalTotals) => ({
  index: labels.total,
  income: totals.income,
  vat: totals.incomeVat,
  incomeNet: totals.incomeNet,
  expenses: totals.expenses
});

const netRow = (labels: JournalExportLabels, totals: JournalTotals) => ({
  index: labels.netResult,
  income: totals.net
});

const quoteCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const buildJournalCsv = ({ rows, totals, labels }: JournalExportInput) => {
  const lines: Array<Partial<Record<(typeof COLUMN_KEYS)[number], Cell>>> = [
    ...rows.map((row, index) => toTableRow(row, index, labels)),
    totalsRow(labels, totals),
    netRow(labels, totals)
  ];
  const header = COLUMN_KEYS.map((key) => quoteCsv(labels.columns[key]));
  const body = lines.map((line) =>
    COLUMN_KEYS.map((key) => {
      const value = line[key];
      if (value === null || value === undefined) return quoteCsv('');
      if (typeof value === 'number' || MONEY_KEYS.has(key)) {
        return quoteCsv(String(value));
      }
      return quoteCsv(toSafeCsvText(String(value)));
    }).join(',')
  );

  return `﻿${[header.join(','), ...body].join('\r\n')}\r\n`;
};

const MONEY_FORMAT = '#,##0.00';
const DATE_FORMAT = 'yyyy-mm-dd';

const toExcelDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toExcelMoney = (value: string | null | undefined) =>
  value === null || value === undefined ? null : Number(value);

const COLUMN_WIDTHS: Record<(typeof COLUMN_KEYS)[number], number> = {
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

const addJournalSheet = (
  workbook: ExcelJS.Workbook,
  { period, rows, totals, owner, labels }: JournalExportInput
) => {
  const sheet = workbook.addWorksheet(journalPeriodLabel(period));
  const lastColumn = COLUMN_KEYS.length;

  sheet.columns = COLUMN_KEYS.map((key) => ({
    key,
    width: COLUMN_WIDTHS[key],
    style: MONEY_KEYS.has(key) ? { numFmt: MONEY_FORMAT } : {}
  }));

  const title = sheet.getRow(1);
  title.getCell(1).value = labels.title;
  title.font = { bold: true, size: 14 };
  sheet.mergeCells(1, 1, 1, lastColumn);

  const ownerRow = sheet.getRow(2);
  ownerRow.getCell(1).value = labels.ownerName;
  ownerRow.getCell(3).value = owner.legalName;
  ownerRow.getCell(5).value = labels.certificateNumber;
  ownerRow.getCell(8).value = owner.activityCertificateNumber;
  ownerRow.font = { bold: true };

  const header = sheet.getRow(4);
  COLUMN_KEYS.forEach((key, index) => {
    const cell = header.getCell(index + 1);
    cell.value = labels.columns[key];
    cell.alignment = { wrapText: true, vertical: 'middle' };
  });
  header.font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 4 }];

  rows.forEach((row, index) => {
    const values = toTableRow(row, index, labels);
    const excelRow = sheet.addRow({
      ...values,
      date: toExcelDate(values.date),
      income: toExcelMoney(values.income),
      vat: toExcelMoney(values.vat),
      incomeNet: toExcelMoney(values.incomeNet),
      expenses: toExcelMoney(values.expenses)
    });
    excelRow.getCell('date').numFmt = DATE_FORMAT;
  });

  const totalValues = totalsRow(labels, totals);
  const totalExcelRow = sheet.addRow({
    index: totalValues.index,
    income: toExcelMoney(totalValues.income),
    vat: toExcelMoney(totalValues.vat),
    incomeNet: toExcelMoney(totalValues.incomeNet),
    expenses: toExcelMoney(totalValues.expenses)
  });
  totalExcelRow.font = { bold: true };
  sheet.mergeCells(totalExcelRow.number, 1, totalExcelRow.number, 4);

  const net = netRow(labels, totals);
  const netExcelRow = sheet.addRow({
    index: net.index,
    income: toExcelMoney(net.income)
  });
  netExcelRow.font = { bold: true };
  sheet.mergeCells(netExcelRow.number, 1, netExcelRow.number, 4);
};

const addSummarySheet = (
  workbook: ExcelJS.Workbook,
  { period, rows, totals, labels }: JournalExportInput
) => {
  const sheet = workbook.addWorksheet(labels.summarySheet);

  sheet.columns = [
    { header: labels.summaryColumns.month, key: 'month', width: 12 },
    { header: labels.summaryColumns.income, key: 'income', width: 16 },
    { header: labels.summaryColumns.vat, key: 'vat', width: 12 },
    { header: labels.summaryColumns.incomeNet, key: 'incomeNet', width: 18 },
    { header: labels.summaryColumns.expenses, key: 'expenses', width: 16 },
    { header: labels.summaryColumns.net, key: 'net', width: 16 }
  ].map((column) =>
    column.key === 'month'
      ? column
      : { ...column, style: { numFmt: MONEY_FORMAT } }
  );
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const toSummaryRow = (month: string, values: JournalTotals) => ({
    month,
    income: toExcelMoney(values.income),
    vat: toExcelMoney(values.incomeVat),
    incomeNet: toExcelMoney(values.incomeNet),
    expenses: toExcelMoney(values.expenses),
    net: toExcelMoney(values.net)
  });

  buildJournalMonths(rows, period).forEach(({ month, ...values }) => {
    sheet.addRow(
      toSummaryRow(`${period.year}-${String(month).padStart(2, '0')}`, values)
    );
  });

  sheet.addRow(toSummaryRow(labels.total, totals)).font = { bold: true };
};

export const buildJournalXlsx = async (input: JournalExportInput) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'InvoiceTrackr';

  addJournalSheet(workbook, input);
  addSummarySheet(workbook, input);

  return Buffer.from(await workbook.xlsx.writeBuffer());
};
