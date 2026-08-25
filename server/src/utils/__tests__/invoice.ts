import { describe, expect, it } from 'vitest';

import { calculateInvoiceTotals, positionInvoiceServices } from '../invoice';

describe('invoice utilities', () => {
  it('rounds each line subtotal to cents before calculating its VAT', () => {
    expect(
      calculateInvoiceTotals([
        { quantity: 1.005, amount: '10.00', vatRate: '21.00' },
        { quantity: 1.5, amount: '0.01', vatRate: '0.00' }
      ])
    ).toEqual({
      subtotalAmount: '10.07',
      vatAmount: '2.11',
      totalAmount: '12.18'
    });
  });

  it('calculates authoritative totals from lines without submitted totals', () => {
    const submittedInvoice = {
      subtotalAmount: '999.00',
      vatAmount: '999.00',
      totalAmount: '999.00',
      services: [{ quantity: 2, amount: 12.34, vatRate: 21 }]
    };

    expect(calculateInvoiceTotals(submittedInvoice.services)).toEqual({
      subtotalAmount: '24.68',
      vatAmount: '5.18',
      totalAmount: '29.86'
    });
  });

  it('assigns persisted positions from submitted array order', () => {
    expect(
      positionInvoiceServices([{ id: 20 }, { id: 10 }]).map(
        ({ id, position }) => ({ id, position })
      )
    ).toEqual([
      { id: 20, position: 0 },
      { id: 10, position: 1 }
    ]);
  });
});
