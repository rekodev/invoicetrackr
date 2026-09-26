import { describe, expect, it } from 'vitest';

import {
  assertPaymentFits,
  PAYMENT_EXCEEDS_BALANCE,
  summarizeInvoicePayments
} from '../invoice-payment';

describe('invoice payment summary', () => {
  it('sums partial receipts in cents and returns the remaining balance', () => {
    expect(
      summarizeInvoicePayments('100.00', [
        { amount: '33.33' },
        { amount: '33.33' }
      ])
    ).toEqual({ paidAmount: '66.66', outstandingAmount: '33.34' });
  });

  it('returns zero balance after the final payment', () => {
    expect(
      summarizeInvoicePayments('100.00', [
        { amount: '40.00' },
        { amount: '60.00' }
      ])
    ).toEqual({ paidAmount: '100.00', outstandingAmount: '0.00' });
  });

  it('rejects an overpayment and excludes the edited entry from the limit', () => {
    const entries = [
      { id: 1, amount: '40.00' },
      { id: 2, amount: '50.00' }
    ];
    expect(() => assertPaymentFits('100.00', entries, '61.00', 2)).toThrow(
      PAYMENT_EXCEEDS_BALANCE
    );
    expect(() =>
      assertPaymentFits('100.00', entries, '60.00', 2)
    ).not.toThrow();
  });
});
