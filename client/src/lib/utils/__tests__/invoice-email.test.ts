import { getInvoiceEmailDefaults, switchInvoiceEmailLanguage } from '@invoicetrackr/emails/content';
import { describe, expect, it } from 'vitest';

const input = { invoiceNumber: 'SF007', totalAmount: '100.00', outstandingAmount: '60.00',
  currency: 'eur', dueDate: '2026-09-26', today: '2026-09-26' };

describe('invoice email defaults', () => {
  it.each(['lt', 'en'] as const)('uses the remaining balance for %s reminders', (language) => {
    const reminder = getInvoiceEmailDefaults({ ...input, kind: 'reminder', language });
    expect(reminder.message).toContain('60.00 EUR');
    expect(reminder.message).not.toContain('100.00 EUR');
    expect(reminder.message).toContain('SF007');
    expect(reminder.message).toContain('2026-09-26');
  });
  it('does not call an invoice overdue on its due date', () => {
    expect(getInvoiceEmailDefaults({ ...input, kind: 'reminder', language: 'en' }).message).not.toContain('overdue');
    expect(getInvoiceEmailDefaults({ ...input, today: '2026-09-27', kind: 'reminder', language: 'en' }).message).toContain('overdue');
  });
  it('preserves an intentionally cleared message when switching language', () => {
    const previous = getInvoiceEmailDefaults({ ...input, kind: 'invoice', language: 'lt' });
    const next = getInvoiceEmailDefaults({ ...input, kind: 'invoice', language: 'en' });
    expect(switchInvoiceEmailLanguage({ ...previous, message: '' }, previous, next)).toEqual({ subject: next.subject, message: '' });
  });
});
