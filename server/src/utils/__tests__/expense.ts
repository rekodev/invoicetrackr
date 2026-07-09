import { describe, expect, it } from 'vitest';

import { calculateDeductibleAmount, normalizeExpenseForDb } from '../expense';

describe('expense utilities', () => {
  describe('calculateDeductibleAmount', () => {
    it.each([
      ['0.00', '75', '0.00'],
      ['100.00', '100', '100.00'],
      ['100.00', '50', '50.00'],
      ['10.00', '33.33', '3.33'],
      ['0.01', '50', '0.01']
    ])(
      'calculates %s at %s percent as %s',
      (totalAmount, businessUsePercentage, expected) => {
        expect(
          calculateDeductibleAmount(totalAmount, businessUsePercentage)
        ).toBe(expected);
      }
    );
  });

  describe('normalizeExpenseForDb', () => {
    it('normalizes monetary fields and business-use percentage', () => {
      expect(
        normalizeExpenseForDb({
          expenseDate: '2026-07-08',
          paymentDate: '',
          supplier: ' Test Supplier ',
          documentNumber: ' DOC-1 ',
          description: ' Business software ',
          category: 'software',
          totalAmount: '10',
          eurAmount: '9.5',
          vatAmount: '1',
          businessUsePercentage: 33.3,
          paymentMethod: 'card',
          notes: ' Notes '
        })
      ).toMatchObject({
        supplier: 'Test Supplier',
        documentNumber: 'DOC-1',
        description: 'Business software',
        totalAmount: '10.00',
        eurAmount: '9.50',
        vatAmount: '1.00',
        businessUsePercentage: '33.30',
        deductibleAmount: '3.33',
        notes: 'Notes'
      });
    });

    it('defaults currency and eurAmount while calculating deductible amount from totalAmount', () => {
      expect(
        normalizeExpenseForDb({
          expenseDate: '2026-07-08',
          supplier: 'Fuel',
          description: 'Client trip',
          category: 'transport',
          totalAmount: '12.00',
          vatAmount: '2.52',
          businessUsePercentage: '25'
        })
      ).toMatchObject({
        currency: 'eur',
        totalAmount: '12.00',
        eurAmount: '12.00',
        vatAmount: '2.52',
        businessUsePercentage: '25.00',
        deductibleAmount: '3.00'
      });
    });

    it('does not include VAT amount in the deductible calculation', () => {
      const withoutVat = normalizeExpenseForDb({
        expenseDate: '2026-07-08',
        supplier: 'Software',
        description: 'Subscription',
        category: 'software',
        totalAmount: '100.00',
        vatAmount: null,
        businessUsePercentage: '60'
      });
      const withVat = normalizeExpenseForDb({
        expenseDate: '2026-07-08',
        supplier: 'Software',
        description: 'Subscription',
        category: 'software',
        totalAmount: '100.00',
        vatAmount: '21.00',
        businessUsePercentage: '60'
      });

      expect(withVat.deductibleAmount).toBe(withoutVat.deductibleAmount);
      expect(withVat.deductibleAmount).toBe('60.00');
    });
  });
});
