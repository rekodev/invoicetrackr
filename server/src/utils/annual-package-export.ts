import type {
  AnnualPackageSummary,
  AnnualPackageWarning,
  JournalPeriod,
  JournalRow,
  JournalTotals
} from '@invoicetrackr/types';
import ExcelJS from 'exceljs';

import type {
  AnnualExpenseDbRow,
  AnnualPaymentDbRow
} from '../database/annual-package';
import type { AnnualInvoice } from './annual-package';
import { sumMoney } from './annual-package';
import {
  addJournalSheet,
  addSummarySheet,
  DATE_FORMAT,
  type JournalTranslate,
  MONEY_FORMAT,
  toExcelDate
} from './journal-export';
import type { TaxEstimate } from './tax';

export type AnnualPackageExportInput = {
  year: number;
  asOf: string;
  isComplete: boolean;
  summary: AnnualPackageSummary;
  warnings: AnnualPackageWarning[];
  estimate: TaxEstimate;
  journal: { period: JournalPeriod; rows: JournalRow[]; totals: JournalTotals };
  owner: { legalName: string; activityCertificateNumber: string };
  invoices: AnnualInvoice[];
  payments: AnnualPaymentDbRow[];
  expenses: AnnualExpenseDbRow[];
  t: JournalTranslate;
  tJournal: JournalTranslate;
};

type CellValue = string | number | null;

type Column<Row> = {
  key: string;
  width: number;
  format?: 'money' | 'date';
  value: (row: Row, index: number) => CellValue;
};

const toCell = (format: Column<unknown>['format'], value: CellValue) => {
  if (value === null || value === '') return null;
  if (format === 'money') return Number(value);
  if (format === 'date') return toExcelDate(String(value));
  return value;
};

const addTableSheet = <Row>(
  workbook: ExcelJS.Workbook,
  {
    name,
    columns,
    rows,
    totals,
    t
  }: {
    name: string;
    columns: Column<Row>[];
    rows: Row[];
    totals: Record<string, string>;
    t: JournalTranslate;
  }
) => {
  const sheet = workbook.addWorksheet(name);

  sheet.columns = columns.map(({ key, width, format }) => ({
    key,
    width,
    header: t(`columns.${key}`),
    style:
      format === 'money'
        ? { numFmt: MONEY_FORMAT }
        : format === 'date'
          ? { numFmt: DATE_FORMAT }
          : {}
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  rows.forEach((row, index) => {
    sheet.addRow(
      Object.fromEntries(
        columns.map((column) => [
          column.key,
          toCell(column.format, column.value(row, index))
        ])
      )
    );
  });

  sheet.addRow({
    [columns[0].key]: t('total'),
    ...Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [key, Number(value)])
    )
  }).font = { bold: true };
};

const index = (_row: unknown, position: number) => position + 1;

const addInvoicesSheet = (
  workbook: ExcelJS.Workbook,
  { invoices, t }: AnnualPackageExportInput
) => {
  const counted = invoices.filter((invoice) => !invoice.isVoided);
  const status = (invoice: AnnualInvoice) =>
    t(`statuses.${invoice.isVoided ? 'voided' : invoice.status}`);

  addTableSheet<AnnualInvoice>(workbook, {
    name: t('sheets.invoices'),
    t,
    rows: invoices,
    columns: [
      { key: 'index', width: 8, value: index },
      { key: 'invoiceNumber', width: 14, value: (row) => row.invoiceNumber },
      { key: 'date', width: 12, format: 'date', value: (row) => row.date },
      { key: 'dueDate', width: 12, format: 'date', value: (row) => row.dueDate },
      { key: 'client', width: 32, value: (row) => row.clientName },
      { key: 'clientCode', width: 14, value: (row) => row.clientCode },
      { key: 'status', width: 14, value: status },
      { key: 'total', width: 14, format: 'money', value: (row) => row.totalAmount },
      { key: 'vat', width: 12, format: 'money', value: (row) => row.vatAmount },
      { key: 'paid', width: 14, format: 'money', value: (row) => row.paidAmount },
      {
        key: 'outstanding',
        width: 14,
        format: 'money',
        value: (row) => row.outstandingAmount
      }
    ],
    totals: {
      total: sumMoney(counted.map((invoice) => invoice.totalAmount)),
      vat: sumMoney(counted.map((invoice) => invoice.vatAmount)),
      paid: sumMoney(counted.map((invoice) => invoice.paidAmount)),
      outstanding: sumMoney(counted.map((invoice) => invoice.outstandingAmount))
    }
  });
};

const addPaymentsSheet = (
  workbook: ExcelJS.Workbook,
  { payments, t }: AnnualPackageExportInput
) =>
  addTableSheet<AnnualPaymentDbRow>(workbook, {
    name: t('sheets.payments'),
    t,
    rows: payments,
    columns: [
      { key: 'index', width: 8, value: index },
      {
        key: 'paymentDate',
        width: 12,
        format: 'date',
        value: (row) => row.paymentDate
      },
      { key: 'invoiceNumber', width: 14, value: (row) => row.invoiceNumber },
      { key: 'client', width: 32, value: (row) => row.clientName },
      { key: 'amount', width: 14, format: 'money', value: (row) => row.amount },
      {
        key: 'method',
        width: 18,
        value: (row) => t(`paymentMethods.${row.method}`)
      },
      { key: 'reference', width: 24, value: (row) => row.bankReference }
    ],
    totals: { amount: sumMoney(payments.map((payment) => payment.amount)) }
  });

const addExpensesSheet = (
  workbook: ExcelJS.Workbook,
  { expenses, t }: AnnualPackageExportInput
) =>
  addTableSheet<AnnualExpenseDbRow>(workbook, {
    name: t('sheets.expenses'),
    t,
    rows: expenses,
    columns: [
      { key: 'index', width: 8, value: index },
      { key: 'date', width: 12, format: 'date', value: (row) => row.expenseDate },
      {
        key: 'paymentDate',
        width: 12,
        format: 'date',
        value: (row) => row.paymentDate
      },
      { key: 'supplier', width: 28, value: (row) => row.supplier },
      { key: 'documentNumber', width: 14, value: (row) => row.documentNumber },
      { key: 'description', width: 32, value: (row) => row.description },
      {
        key: 'category',
        width: 20,
        value: (row) => t(`categories.${row.category}`)
      },
      {
        key: 'originalAmount',
        width: 14,
        value: (row) => `${row.totalAmount} ${row.currency.toUpperCase()}`
      },
      { key: 'eurAmount', width: 14, format: 'money', value: (row) => row.eurAmount },
      { key: 'vat', width: 12, format: 'money', value: (row) => row.vatAmount },
      {
        key: 'businessUse',
        width: 12,
        value: (row) => Number(row.businessUsePercentage)
      },
      {
        key: 'deductible',
        width: 14,
        format: 'money',
        value: (row) => row.deductibleAmount
      },
      {
        key: 'method',
        width: 18,
        value: (row) =>
          row.paymentMethod ? t(`paymentMethods.${row.paymentMethod}`) : null
      },
      { key: 'documents', width: 12, value: (row) => row.documentCount }
    ],
    totals: {
      eurAmount: sumMoney(expenses.map((expense) => expense.eurAmount)),
      deductible: sumMoney(expenses.map((expense) => expense.deductibleAmount))
    }
  });

const TAX_ROWS = ['income', 'deductions', 'vsd', 'psd', 'gpm', 'total'] as const;

const addOverviewSheet = (
  workbook: ExcelJS.Workbook,
  { year, asOf, isComplete, summary, estimate, owner, t, tJournal }: AnnualPackageExportInput
) => {
  const sheet = workbook.addWorksheet(t('sheets.summary'));
  sheet.columns = [{ width: 48 }, { width: 20 }, { width: 20 }];

  const addLine = (values: CellValue[], style: Partial<ExcelJS.Style> = {}) => {
    const row = sheet.addRow(values);
    Object.assign(row, style);
    return row;
  };
  const addMoneyLine = (label: string, ...amounts: string[]) => {
    const row = addLine([label, ...amounts.map(Number)]);
    amounts.forEach((_, position) => {
      row.getCell(position + 2).numFmt = MONEY_FORMAT;
    });
    return row;
  };

  addLine([t('title', { year: String(year) })], { font: { bold: true, size: 14 } });
  addLine([tJournal('ownerName'), owner.legalName]);
  addLine([tJournal('certificateNumber'), owner.activityCertificateNumber]);
  addLine([t('preparedOn'), asOf]);
  if (!isComplete) {
    addLine([t('incomplete')], {
      font: { bold: true, color: { argb: 'FFC00000' } }
    });
  }

  addLine([]);
  addLine([t('sections.totals')], { font: { bold: true } });
  addMoneyLine(t('summary.income'), summary.income);
  addMoneyLine(t('summary.incomeVat'), summary.incomeVat);
  addMoneyLine(t('summary.incomeNet'), summary.incomeNet);
  addMoneyLine(t('summary.expenses'), summary.expenses);
  addMoneyLine(t('summary.net'), summary.net).font = { bold: true };
  addMoneyLine(t('summary.invoiced'), summary.invoiced);
  addMoneyLine(t('summary.outstanding', { date: asOf }), summary.outstanding);

  addLine([]);
  addLine([t('sections.tax')], { font: { bold: true } });

  if (estimate.status !== 'ready') {
    addLine([t(`taxUnavailable.${estimate.status}`)]);
  } else {
    addLine([t('expenseMethod'), t(`methods.${estimate.profile.expenseMethod}`)]);
    addLine(['', t('methods.actual'), t('methods.thirty_percent')], {
      font: { bold: true }
    });
    TAX_ROWS.forEach((key) => {
      const row = addMoneyLine(
        t(`taxRows.${key}`),
        estimate.methods.actual[key],
        estimate.methods.thirtyPercent[key]
      );
      if (key === 'total') row.font = { bold: true };
    });
  }

  addLine([]);
  const disclaimer = addLine([t('disclaimer')]);
  disclaimer.getCell(1).alignment = { wrapText: true, vertical: 'top' };
  disclaimer.height = 45;
  sheet.mergeCells(disclaimer.number, 1, disclaimer.number, 3);
};

const addWarningsSheet = (
  workbook: ExcelJS.Workbook,
  { warnings, t }: AnnualPackageExportInput
) => {
  const sheet = workbook.addWorksheet(t('sheets.warnings'));

  sheet.columns = [
    { key: 'severity', header: t('columns.severity'), width: 18 },
    { key: 'issue', header: t('columns.issue'), width: 80 }
  ];
  sheet.getRow(1).font = { bold: true };

  if (warnings.length === 0) {
    sheet.addRow({ issue: t('warnings.none') });
    return;
  }

  warnings.forEach(({ code, severity, count }) => {
    sheet.addRow({
      severity: t(`severity.${severity}`),
      issue: t(`warnings.${code}`, { count: String(count ?? 0) })
    });
  });
};

export const buildAnnualPackageXlsx = async (input: AnnualPackageExportInput) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'InvoiceTrackr';
  const journalInput = { ...input.journal, owner: input.owner, t: input.tJournal };

  addOverviewSheet(workbook, input);
  addWarningsSheet(workbook, input);
  addJournalSheet(workbook, journalInput, input.t('sheets.journal'));
  addSummarySheet(workbook, journalInput, input.t('sheets.monthly'));
  addInvoicesSheet(workbook, input);
  addPaymentsSheet(workbook, input);
  addExpensesSheet(workbook, input);

  return Buffer.from(await workbook.xlsx.writeBuffer());
};
