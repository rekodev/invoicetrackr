import { invoicePaymentBodySchema } from '@invoicetrackr/types';
import { describe, expect, it } from 'vitest';

import {
  assertPaymentFits,
  PAYMENT_EXCEEDS_BALANCE,
  PaymentExceedsBalanceError,
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
    try {
      assertPaymentFits('100.00', entries, '61.00', 2);
    } catch (error) {
      expect(error).toBeInstanceOf(PaymentExceedsBalanceError);
      expect((error as PaymentExceedsBalanceError).maximumAmount).toBe('60.00');
    }
  });

  it('handles the database money limit exactly and leaves zero totals unsettled', () => {
    expect(summarizeInvoicePayments('9999999999.99', [{ amount: '9999999999.98' }]))
      .toEqual({ paidAmount: '9999999999.98', outstandingAmount: '0.01' });
    expect(summarizeInvoicePayments('0.00', []))
      .toEqual({ paidAmount: '0.00', outstandingAmount: '0.00' });
  });
});

describe('payment request validation', () => {
  it.each(['0', '0.00', '-1.00', '0.001', '1e3', '10000000000.00'])('rejects invalid amount %s', (amount) => {
    expect(invoicePaymentBodySchema.safeParse({ paymentDate: '2026-01-01', amount }).success).toBe(false);
  });

  it('normalizes decimal input and trims optional text without rounding it', () => {
    expect(invoicePaymentBodySchema.parse({ paymentDate: '2026-01-01', amount: '25.5', bankReference: ' Ref ', notes: ' Note ' }))
      .toEqual({ paymentDate: '2026-01-01', amount: '25.50', bankReference: 'Ref', notes: 'Note' });
  });
});
