import type {
  TaxExpenseMethod,
  TaxMethodEstimate,
  TaxProfile
} from '@invoicetrackr/types';

import { fromCents, roundPositiveDivision, toCents } from './money';
import type { TaxYearRules } from './tax-rules';

export type TaxInputs = {
  income: string;
  actualExpenses: string;
  activeMonths: number;
};

const BASIS_POINTS = 10000n;

const share = (amount: bigint, bp: bigint) =>
  amount > 0n ? roundPositiveDivision(amount * bp, BASIS_POINTS) : 0n;

const max = (left: bigint, right: bigint) => (left > right ? left : right);
const min = (left: bigint, right: bigint) => (left < right ? left : right);

const monthOf = (date: string) => Number(date.slice(5, 7));
const yearOf = (date: string) => Number(date.slice(0, 4));

export const activeMonths = (
  year: number,
  startDate: string | null,
  endDate: string | null
) => {
  if (startDate && yearOf(startDate) > year) return 0;
  if (endDate && yearOf(endDate) < year) return 0;

  const first = startDate && yearOf(startDate) === year ? monthOf(startDate) : 1;
  const last = endDate && yearOf(endDate) === year ? monthOf(endDate) : 12;

  return Math.max(0, last - first + 1);
};

export const gpmCredit = (profit: bigint, rules: TaxYearRules) => {
  const fullCreditLimit = toCents(rules.gpm.fullCreditLimit);
  const creditLimit = toCents(rules.gpm.creditLimit);

  if (profit <= 0n || profit > creditLimit) return 0n;
  if (profit <= fullCreditLimit) return share(profit, rules.gpm.creditRateBp);

  const divisor = toCents(rules.gpm.creditSlopeDivisor);
  const creditRate =
    rules.gpm.creditRateBp * divisor - BASIS_POINTS * (profit - fullCreditLimit);

  return creditRate > 0n
    ? roundPositiveDivision(profit * creditRate, BASIS_POINTS * divisor)
    : 0n;
};

export const progressiveTax = (income: bigint, rules: TaxYearRules) => {
  const averageWage = toCents(rules.averageWage);
  let previousLimit = 0n;
  let tax = 0n;

  for (const band of rules.gpm.bands) {
    const limit =
      band.upToAverageWages === null
        ? income
        : min(income, band.upToAverageWages * averageWage);

    if (limit > previousLimit) {
      tax += share(limit - previousLimit, band.rateBp);
      previousLimit = limit;
    }
  }

  return tax;
};

const effectiveRate = (total: bigint, income: bigint) =>
  income > 0n
    ? fromCents(roundPositiveDivision(total * BASIS_POINTS, income))
    : '0.00';

export const calculateMethodEstimate = (
  method: TaxExpenseMethod,
  inputs: TaxInputs,
  profile: TaxProfile,
  rules: TaxYearRules
): TaxMethodEstimate => {
  const income = toCents(inputs.income);
  const deductions =
    method === 'actual'
      ? toCents(inputs.actualExpenses)
      : share(income, rules.deemedExpensesBp);
  const profit = income - deductions;
  const { contributions } = rules;

  const contributionBase = min(
    share(max(profit, 0n), contributions.baseShareBp),
    contributions.capAverageWages * toCents(rules.averageWage)
  );
  const vsd = share(
    contributionBase,
    contributions.vsdRateBp +
      (profile.hasAdditionalPensionAccumulation
        ? contributions.additionalPensionRateBp
        : 0n)
  );
  const psdFromIncome = share(contributionBase, contributions.psdRateBp);
  const psdMinimum = profile.hasEmploymentPsdCoverage
    ? 0n
    : BigInt(inputs.activeMonths) * toCents(contributions.monthlyPsdMinimum);
  const psd = max(psdFromIncome, psdMinimum);

  const gpmProfit = max(
    method === 'actual' ? profit - vsd - psd : profit,
    0n
  );
  const usesCombinedIncomeBands = gpmProfit > toCents(rules.gpm.creditLimit);
  const otherIncome = toCents(profile.otherDeclaredIncome);
  const gpmBeforeCredit = usesCombinedIncomeBands
    ? progressiveTax(otherIncome + gpmProfit, rules) -
      progressiveTax(otherIncome, rules)
    : share(gpmProfit, rules.gpm.rateBp);
  const gpmCreditAmount = gpmCredit(gpmProfit, rules);
  const gpm = gpmBeforeCredit - gpmCreditAmount;
  const total = gpm + vsd + psd;

  return {
    method,
    income: fromCents(income),
    deductions: fromCents(deductions),
    contributionBase: fromCents(contributionBase),
    vsd: fromCents(vsd),
    psd: fromCents(psd),
    psdMinimumApplied: psdMinimum > psdFromIncome,
    gpmProfit: fromCents(gpmProfit),
    gpmBeforeCredit: fromCents(gpmBeforeCredit),
    gpmCredit: fromCents(gpmCreditAmount),
    gpm: fromCents(gpm),
    usesCombinedIncomeBands,
    total: fromCents(total),
    effectiveRate: effectiveRate(total, income)
  };
};

export const calculateTaxEstimate = (
  inputs: TaxInputs,
  profile: TaxProfile,
  rules: TaxYearRules
) => {
  const estimate = (method: TaxExpenseMethod) =>
    calculateMethodEstimate(method, inputs, profile, rules);
  const actual = estimate('actual');
  const thirtyPercent = estimate('thirty_percent');
  const actualTotal = toCents(actual.total);
  const thirtyPercentTotal = toCents(thirtyPercent.total);
  const lowerMethod: TaxExpenseMethod | null =
    actualTotal === thirtyPercentTotal
      ? null
      : actualTotal < thirtyPercentTotal
        ? 'actual'
        : 'thirty_percent';

  return { methods: { actual, thirtyPercent }, lowerMethod };
};

export const summarizeTaxRules = ({ version, sources }: TaxYearRules) => ({
  version,
  sources
});
