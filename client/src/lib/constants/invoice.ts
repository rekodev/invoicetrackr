export const COMMON_INVOICE_UNITS = [
  'service',
  'hour',
  'day',
  'item',
  'month',
  'project',
  'kilometre',
  'kilogram'
] as const;

type CommonInvoiceUnit = (typeof COMMON_INVOICE_UNITS)[number];

const isCommonInvoiceUnit = (unit: string): unit is CommonInvoiceUnit =>
  COMMON_INVOICE_UNITS.some((commonUnit) => commonUnit === unit);

export const localizeInvoiceUnit = (
  unit: string,
  translate: (unit: CommonInvoiceUnit) => string
) => (isCommonInvoiceUnit(unit) ? translate(unit) : unit);
