import type { TaxProfile } from '@invoicetrackr/types';
import { describe, expect, it } from 'vitest';

import { fromCents, toCents } from '../money';
import {
  activeMonths,
  calculateMethodEstimate,
  calculateTaxEstimate,
  gpmCredit,
  progressiveTax
} from '../tax';
import { TAX_RULES } from '../tax-rules';

const rules = TAX_RULES[2026];

const profile = (overrides: Partial<TaxProfile> = {}): TaxProfile => ({
  expenseMethod: 'thirty_percent',
  hasEmploymentPsdCoverage: false,
  hasAdditionalPensionAccumulation: false,
  activityStartDate: null,
  activityEndDate: null,
  otherDeclaredIncome: '0',
  ...overrides
});

const inputs = (income: string, actualExpenses = '0', months = 12) => ({
  income,
  actualExpenses,
  activeMonths: months
});

describe('2026 individual activity tax rules', () => {
  it.each([
    ['20000.00', '3000.00'],
    ['20000.01', '3000.00'],
    ['30000.00', '2500.00'],
    ['42500.00', '0.00'],
    ['42500.01', '0.00'],
    ['0.00', '0.00']
  ])('gives a GPM credit of %s → %s', (profit, credit) => {
    expect(fromCents(gpmCredit(toCents(profit), rules))).toBe(credit);
  });

  it('attributes only the extra combined-income band tax to the activity', () => {
    const attributed =
      progressiveTax(toCents('120000.00'), rules) -
      progressiveTax(toCents('70000.00'), rules);

    expect(fromCents(attributed)).toBe('11838.13');
    expect(fromCents(progressiveTax(toCents('140000.00'), rules))).toBe('30927.10');
  });

  it.each([
    [null, null, 12],
    ['2026-04-15', null, 9],
    ['2025-06-01', '2026-03-31', 3],
    ['2027-01-01', null, 0],
    [null, '2025-12-31', 0]
  ])('counts active months from %s to %s as %i', (start, end, months) => {
    expect(activeMonths(2026, start, end)).toBe(months);
  });

  it('compares both methods on a small full-year activity with the PSD minimum', () => {
    const { methods, lowerMethod } = calculateTaxEstimate(
      inputs('15000.00'),
      profile(),
      rules
    );

    expect(methods.thirtyPercent).toMatchObject({
      deductions: '4500.00',
      contributionBase: '9450.00',
      vsd: '1183.14',
      psd: '965.76',
      psdMinimumApplied: true,
      gpmProfit: '10500.00',
      gpmBeforeCredit: '2100.00',
      gpmCredit: '1575.00',
      gpm: '525.00',
      usesCombinedIncomeBands: false,
      total: '2673.90',
      effectiveRate: '17.83'
    });
    expect(methods.actual).toMatchObject({
      deductions: '0.00',
      contributionBase: '13500.00',
      vsd: '1690.20',
      psd: '965.76',
      gpmProfit: '12344.04',
      gpmCredit: '1851.61',
      gpm: '617.20',
      total: '3273.16'
    });
    expect(lowerMethod).toBe('thirty_percent');
  });

  it('deducts VSD and PSD for GPM only under the actual method and uses other income above the credit limit', () => {
    const estimate = calculateMethodEstimate(
      'actual',
      inputs('60000.00', '5000.00'),
      profile({ otherDeclaredIncome: '30000.00' }),
      rules
    );

    expect(estimate).toMatchObject({
      contributionBase: '49500.00',
      vsd: '6197.40',
      psd: '3455.10',
      psdMinimumApplied: false,
      gpmProfit: '45347.50',
      gpmCredit: '0.00',
      gpm: '9069.50',
      usesCombinedIncomeBands: true,
      total: '18722.00',
      effectiveRate: '31.20'
    });
  });

  it('caps contributions at 43 average wages and adds the 3% pension accumulation', () => {
    expect(
      calculateMethodEstimate(
        'thirty_percent',
        inputs('200000.00'),
        profile({ hasAdditionalPensionAccumulation: true }),
        rules
      )
    ).toMatchObject({
      contributionBase: '99422.45',
      vsd: '15430.36',
      psd: '6939.69',
      gpm: '30927.10',
      total: '53297.15'
    });
  });

  it.each([
    [false, '724.32', true, '1635.33'],
    [true, '351.79', false, '1262.80']
  ])(
    'prorates the PSD minimum for a part-year activity (employment coverage: %s)',
    (hasEmploymentPsdCoverage, psd, psdMinimumApplied, total) => {
      expect(
        calculateMethodEstimate(
          'thirty_percent',
          inputs('8000.00', '0', 9),
          profile({ hasEmploymentPsdCoverage }),
          rules
        )
      ).toMatchObject({ vsd: '631.01', psd, psdMinimumApplied, gpm: '280.00', total });
    }
  );

  it('owes only the PSD minimum when expenses exceed income', () => {
    expect(
      calculateMethodEstimate('actual', inputs('1000.00', '3000.00'), profile(), rules)
    ).toMatchObject({
      contributionBase: '0.00',
      vsd: '0.00',
      psd: '965.76',
      gpmProfit: '0.00',
      gpm: '0.00',
      total: '965.76'
    });
  });
});
