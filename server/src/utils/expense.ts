import { DEFAULT_CURRENCY, ExpenseInput } from '@invoicetrackr/types';

const parseDecimalToMinorUnits = (value: string, scale: number) => {
  const [wholePart, decimalPart = ''] = value.split('.');
  const normalizedDecimal = decimalPart.padEnd(scale, '0');

  return (
    BigInt(wholePart) * BigInt(10 ** scale) + BigInt(normalizedDecimal || '0')
  );
};

const formatMinorUnits = (value: bigint, scale: number) => {
  const factor = BigInt(10 ** scale);
  const wholePart = value / factor;
  const decimalPart = (value % factor).toString().padStart(scale, '0');

  return `${wholePart}.${decimalPart}`;
};

export const calculateDeductibleAmount = (
  totalAmount: string,
  businessUsePercentage: ExpenseInput['businessUsePercentage']
) => {
  const totalCents = parseDecimalToMinorUnits(totalAmount, 2);
  const businessUseBasisPoints = parseDecimalToMinorUnits(
    String(businessUsePercentage),
    2
  );
  const deductibleCents =
    (totalCents * businessUseBasisPoints + 5000n) / 10000n;

  return formatMinorUnits(deductibleCents, 2);
};

const normalizeOptionalText = (value?: string | null) => {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
};

const normalizeOptionalMoney = (value?: string | null) =>
  value && value.trim()
    ? formatMinorUnits(parseDecimalToMinorUnits(value, 2), 2)
    : null;

export const normalizeExpenseForDb = (expense: ExpenseInput) => {
  const totalAmount = formatMinorUnits(
    parseDecimalToMinorUnits(expense.totalAmount, 2),
    2
  );
  const eurAmount = formatMinorUnits(
    parseDecimalToMinorUnits(expense.eurAmount || totalAmount, 2),
    2
  );
  const businessUsePercentage = formatMinorUnits(
    parseDecimalToMinorUnits(String(expense.businessUsePercentage ?? 100), 2),
    2
  );

  return {
    expenseDate: expense.expenseDate,
    paymentDate: normalizeOptionalText(expense.paymentDate),
    supplier: expense.supplier.trim(),
    documentNumber: normalizeOptionalText(expense.documentNumber),
    description: expense.description.trim(),
    category: expense.category,
    currency: expense.currency ?? DEFAULT_CURRENCY,
    totalAmount,
    eurAmount,
    vatAmount: normalizeOptionalMoney(expense.vatAmount),
    businessUsePercentage,
    deductibleAmount: calculateDeductibleAmount(
      totalAmount,
      businessUsePercentage
    ),
    paymentMethod: expense.paymentMethod || null,
    notes: normalizeOptionalText(expense.notes)
  };
};
