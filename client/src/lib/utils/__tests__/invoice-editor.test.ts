import { describe, expect, it } from 'vitest';

import {
  buildInvoicePreviewData,
  getDueDateAfterIssueDateChange
} from '../invoice-editor';

describe('invoice editor utilities', () => {
  it('derives the due date from profile payment terms until manually overridden', () => {
    expect(
      getDueDateAfterIssueDateChange({
        issueDate: '2026-08-25',
        currentDueDate: '2026-09-24',
        paymentTermsDays: 14,
        isManuallyOverridden: false
      })
    ).toBe('2026-09-08');

    expect(
      getDueDateAfterIssueDateChange({
        issueDate: '2026-08-26',
        currentDueDate: '2026-09-30',
        paymentTermsDays: 14,
        isManuallyOverridden: true
      })
    ).toBe('2026-09-30');
  });

  it('builds a detached draft preview with recalculated totals and positions', () => {
    const formData = {
      date: '2026-08-25',
      serviceDate: '2026-08-24',
      dueDate: '2026-09-08',
      notes: 'Visible note',
      sender: {
        name: 'Sender',
        businessType: 'individual' as const,
        businessNumber: 'IV-1',
        address: 'Vilnius',
        type: 'sender' as const
      },
      receiver: {
        name: 'Client',
        businessType: 'business' as const,
        businessNumber: '123',
        address: 'Kaunas',
        type: 'receiver' as const
      },
      services: [
        {
          description: 'Second',
          unit: 'hour',
          quantity: 1.25,
          amount: 80.4,
          vatRate: 21
        },
        {
          description: 'First',
          unit: 'service',
          quantity: 0.5,
          amount: 10,
          vatRate: 0
        }
      ],
      subtotalAmount: '999.00',
      vatAmount: '999.00',
      totalAmount: '999.00',
      status: 'pending' as const,
      lifecycleStatus: 'issued' as const,
      paymentMode: 'disabled' as const
    };

    const preview = buildInvoicePreviewData(formData);

    expect(preview).not.toBe(formData);
    expect(preview.lifecycleStatus).toBe('draft');
    expect(preview.services.map((service) => service.position)).toEqual([0, 1]);
    expect(preview).toMatchObject({
      subtotalAmount: '105.50',
      vatAmount: '21.11',
      totalAmount: '126.61'
    });
    expect(formData.totalAmount).toBe('999.00');
  });
});
