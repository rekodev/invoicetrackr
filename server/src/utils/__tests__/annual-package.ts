import type { AnnualPackageWarning } from '@invoicetrackr/types';
import { describe, expect, it } from 'vitest';

import type { AnnualInvoiceDbRow } from '../../database/annual-package';
import {
  buildAnnualInvoices,
  buildAnnualSummary,
  buildAnnualWarnings,
  isAnnualPackageComplete
} from '../annual-package';
import type { TaxEstimate } from '../tax';

const invoiceRow = (
  overrides: Partial<AnnualInvoiceDbRow> = {}
): AnnualInvoiceDbRow => ({
  id: 1,
  invoiceNumber: 'SF001',
  date: '2026-03-01',
  dueDate: '2026-03-31',
  clientName: 'MB Šaltinis',
  clientCode: '305000000',
  lifecycleStatus: 'issued',
  status: 'pending',
  vatAmount: '21.00',
  totalAmount: '121.00',
  paidAmount: '60.50',
  ...overrides
});

const totals = {
  income: '160.50',
  incomeVat: '10.50',
  incomeNet: '150.00',
  expenses: '20.00',
  net: '130.00'
};

const readyEstimate = {
  status: 'ready',
  profile: { expenseMethod: 'thirty_percent' },
  methods: {
    actual: { method: 'actual', total: '30.00' },
    thirtyPercent: { method: 'thirty_percent', total: '25.00' }
  }
} as unknown as TaxEstimate;

const needsProfile: TaxEstimate = {
  year: 2026,
  supportedYears: [2026],
  status: 'needs_profile'
};

describe('annual package', () => {
  it('counts outstanding balances on unpaid issued invoices and leaves voided ones out of the summary', () => {
    const invoices = buildAnnualInvoices([
      invoiceRow(),
      invoiceRow({ id: 2, status: 'paid', totalAmount: '100.00', vatAmount: '0.00', paidAmount: '100.00' }),
      invoiceRow({ id: 3, lifecycleStatus: 'voided', status: 'canceled', totalAmount: '50.00', paidAmount: '0.00' })
    ]);

    expect(invoices.map(({ isVoided, outstandingAmount }) => ({ isVoided, outstandingAmount }))).toEqual([
      { isVoided: false, outstandingAmount: '60.50' },
      { isVoided: false, outstandingAmount: '0.00' },
      { isVoided: true, outstandingAmount: '0.00' }
    ]);
    expect(buildAnnualSummary({ totals, invoices, estimate: readyEstimate })).toEqual({
      ...totals,
      invoiced: '221.00',
      outstanding: '60.50',
      expenseMethod: 'thirty_percent',
      taxTotal: '25.00'
    });
    expect(buildAnnualSummary({ totals, invoices, estimate: needsProfile })).toMatchObject({
      expenseMethod: null,
      taxTotal: null
    });
  });

  it.each([
    {
      name: 'a finished year with complete records',
      today: '2027-01-10',
      estimate: readyEstimate,
      owner: { legalName: 'Artūras Žemaitis', activityCertificateNumber: '1093657' },
      draftCount: 0,
      invoices: [invoiceRow({ status: 'paid', paidAmount: '121.00' })],
      expenses: [{ documentCount: 1 }],
      expected: [] as AnnualPackageWarning[]
    },
    {
      name: 'a year in progress with missing details and unfinished records',
      today: '2026-10-11',
      estimate: needsProfile,
      owner: { legalName: 'Artūras Žemaitis', activityCertificateNumber: ' ' },
      draftCount: 2,
      invoices: [invoiceRow(), invoiceRow({ id: 2 })],
      expenses: [{ documentCount: 0 }, { documentCount: 2 }],
      expected: [
        { code: 'year_in_progress', severity: 'blocking' },
        { code: 'missing_tax_profile', severity: 'blocking' },
        { code: 'missing_owner_details', severity: 'blocking' },
        { code: 'draft_invoices', severity: 'recommendation', count: 2 },
        { code: 'outstanding_invoices', severity: 'recommendation', count: 2 },
        { code: 'expenses_missing_documents', severity: 'recommendation', count: 1 }
      ]
    },
    {
      name: 'a tax year the rules do not cover',
      today: '2027-01-10',
      estimate: { year: 2026, supportedYears: [2026], status: 'unsupported_year' } as TaxEstimate,
      owner: { legalName: 'Artūras Žemaitis', activityCertificateNumber: '1093657' },
      draftCount: 0,
      invoices: [],
      expenses: [],
      expected: [{ code: 'unsupported_tax_year', severity: 'blocking' }]
    }
  ])('flags $name', ({ today, estimate, owner, draftCount, invoices, expenses, expected }) => {
    const warnings = buildAnnualWarnings({
      year: 2026,
      today,
      owner,
      estimate,
      draftCount,
      invoices: buildAnnualInvoices(invoices),
      expenses
    });

    expect(warnings).toEqual(expected);
    expect(isAnnualPackageComplete(warnings)).toBe(
      expected.every((warning) => warning.severity !== 'blocking')
    );
  });
});
