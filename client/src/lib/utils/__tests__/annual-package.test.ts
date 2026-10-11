import type {
  AnnualPackageSummary,
  TaxEstimateResponse,
  TaxMethodEstimate
} from '@invoicetrackr/types';
import { describe, expect, it } from 'vitest';

import { declarationFigures } from '../annual-package';

const summary: AnnualPackageSummary = {
  income: '1210.00',
  incomeVat: '210.00',
  incomeNet: '1000.00',
  expenses: '100.00',
  net: '900.00',
  invoiced: '1210.00',
  outstanding: '0.00',
  expenseMethod: 'thirty_percent',
  taxTotal: '150.00'
};

const method = (overrides: Partial<TaxMethodEstimate>) =>
  ({ income: '1000.00', ...overrides }) as TaxMethodEstimate;

const ready = {
  year: 2026,
  supportedYears: [2026],
  status: 'ready',
  profile: { expenseMethod: 'thirty_percent' },
  methods: {
    actual: method({ method: 'actual', deductions: '100.00' }),
    thirtyPercent: method({ method: 'thirty_percent', deductions: '300.00' })
  }
} as TaxEstimateResponse;

describe('declarationFigures', () => {
  it.each([
    {
      name: 'uses the chosen expense method once the estimate is ready',
      estimate: ready,
      expected: [
        { key: 'deductions', amount: '300.00', copyable: true, method: 'thirty_percent' },
        { key: 'profit', amount: '700.00', copyable: false }
      ]
    },
    {
      name: 'falls back to actual journal expenses without a confirmed estimate',
      estimate: { year: 2026, supportedYears: [2026], status: 'needs_profile' } as TaxEstimateResponse,
      expected: [
        { key: 'actual_expenses', amount: '100.00', copyable: false },
        { key: 'net', amount: '900.00', copyable: false }
      ]
    }
  ])('$name', ({ estimate, expected }) => {
    expect(declarationFigures(summary, estimate)).toEqual([
      { key: 'income', amount: '1210.00', copyable: false },
      { key: 'income_vat', amount: '210.00', copyable: false },
      { key: 'income_net', amount: '1000.00', copyable: true },
      ...expected
    ]);
  });
});
